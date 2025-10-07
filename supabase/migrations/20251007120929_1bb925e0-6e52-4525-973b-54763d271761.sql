-- Criar tabela de conquistas/medalhas
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar NOT NULL UNIQUE,
  display_name varchar NOT NULL,
  description text,
  icon varchar NOT NULL,
  color varchar NOT NULL DEFAULT 'gold',
  category varchar NOT NULL DEFAULT 'special',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Criar tabela de conquistas dos jogadores
CREATE TABLE IF NOT EXISTS public.player_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  is_displayed boolean DEFAULT false,
  display_order integer,
  UNIQUE(player_id, achievement_id)
);

-- Criar tabela de códigos de resgate
CREATE TABLE IF NOT EXISTS public.redemption_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar NOT NULL UNIQUE,
  banner_id uuid REFERENCES public.banners(id) ON DELETE SET NULL,
  achievement_id uuid REFERENCES public.achievements(id) ON DELETE SET NULL,
  max_uses integer,
  current_uses integer DEFAULT 0,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Criar tabela de códigos resgatados
CREATE TABLE IF NOT EXISTS public.redeemed_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  code_id uuid NOT NULL REFERENCES public.redemption_codes(id) ON DELETE CASCADE,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(player_id, code_id)
);

-- Adicionar coluna para conquistas selecionadas no players
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS selected_achievements jsonb DEFAULT '[]'::jsonb;

-- Adicionar constraint UNIQUE na coluna name da tabela banners se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'banners_name_key' 
    AND conrelid = 'public.banners'::regclass
  ) THEN
    ALTER TABLE public.banners ADD CONSTRAINT banners_name_key UNIQUE (name);
  END IF;
END $$;

-- Habilitar RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemption_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redeemed_codes ENABLE ROW LEVEL SECURITY;

-- Políticas para achievements
CREATE POLICY "Conquistas são visíveis por todos"
ON public.achievements FOR SELECT
USING (true);

-- Políticas para player_achievements
CREATE POLICY "Jogadores podem ver suas conquistas"
ON public.player_achievements FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.players 
  WHERE players.id = player_achievements.player_id 
  AND players.user_id = auth.uid()
));

CREATE POLICY "Sistema pode adicionar conquistas"
ON public.player_achievements FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.players 
  WHERE players.id = player_achievements.player_id 
  AND players.user_id = auth.uid()
));

CREATE POLICY "Jogadores podem atualizar suas conquistas"
ON public.player_achievements FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.players 
  WHERE players.id = player_achievements.player_id 
  AND players.user_id = auth.uid()
));

-- Políticas para redemption_codes
CREATE POLICY "Códigos ativos são visíveis por todos"
ON public.redemption_codes FOR SELECT
USING (is_active = true);

-- Políticas para redeemed_codes
CREATE POLICY "Jogadores podem ver seus resgates"
ON public.redeemed_codes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.players 
  WHERE players.id = redeemed_codes.player_id 
  AND players.user_id = auth.uid()
));

CREATE POLICY "Jogadores podem resgatar códigos"
ON public.redeemed_codes FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.players 
  WHERE players.id = redeemed_codes.player_id 
  AND players.user_id = auth.uid()
));

-- Inserir o banner legado
INSERT INTO public.banners (name, display_name, description, image_url, unlock_condition, unlock_description, is_default)
VALUES (
  'legacy_banner',
  'Banner Legado',
  'Banner comemorativo de lançamento do site',
  'https://dzrgcyhovmomyoztzmoq.supabase.co/storage/v1/object/public/Temas/banner%20legado%20buchas.png',
  'redemption_code',
  'Desbloqueie com o código de resgate especial',
  false
) ON CONFLICT (name) DO NOTHING;

-- Inserir a conquista "Bucha de Elite"
INSERT INTO public.achievements (name, display_name, description, icon, color, category)
VALUES (
  'bucha_elite',
  'Bucha de Elite',
  'Conquistado por membros fundadores da comunidade',
  'award',
  'gold',
  'special'
) ON CONFLICT (name) DO NOTHING;

-- Inserir o código de resgate
INSERT INTO public.redemption_codes (
  code, 
  banner_id, 
  achievement_id, 
  max_uses,
  is_active
)
SELECT 
  'eusoubuchad+',
  (SELECT id FROM public.banners WHERE name = 'legacy_banner'),
  (SELECT id FROM public.achievements WHERE name = 'bucha_elite'),
  NULL,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.redemption_codes WHERE code = 'eusoubuchad+'
);

-- Função para resgatar código
CREATE OR REPLACE FUNCTION public.redeem_code(p_player_id uuid, p_code varchar)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code_record record;
  v_result jsonb;
BEGIN
  -- Buscar código
  SELECT * INTO v_code_record
  FROM redemption_codes
  WHERE code = p_code
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > now())
  AND (max_uses IS NULL OR current_uses < max_uses);
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Código inválido ou expirado');
  END IF;
  
  -- Verificar se já resgatou
  IF EXISTS (
    SELECT 1 FROM redeemed_codes 
    WHERE player_id = p_player_id 
    AND code_id = v_code_record.id
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Você já resgatou este código');
  END IF;
  
  -- Registrar resgate
  INSERT INTO redeemed_codes (player_id, code_id)
  VALUES (p_player_id, v_code_record.id);
  
  -- Atualizar contador
  UPDATE redemption_codes
  SET current_uses = current_uses + 1
  WHERE id = v_code_record.id;
  
  -- Desbloquear banner
  IF v_code_record.banner_id IS NOT NULL THEN
    INSERT INTO player_banners (player_id, banner_id)
    VALUES (p_player_id, v_code_record.banner_id)
    ON CONFLICT (player_id, banner_id) DO NOTHING;
  END IF;
  
  -- Desbloquear conquista
  IF v_code_record.achievement_id IS NOT NULL THEN
    INSERT INTO player_achievements (player_id, achievement_id)
    VALUES (p_player_id, v_code_record.achievement_id)
    ON CONFLICT (player_id, achievement_id) DO NOTHING;
  END IF;
  
  v_result := jsonb_build_object(
    'success', true, 
    'message', 'Código resgatado com sucesso!',
    'banner_unlocked', v_code_record.banner_id IS NOT NULL,
    'achievement_unlocked', v_code_record.achievement_id IS NOT NULL
  );
  
  RETURN v_result;
END;
$$;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_player_achievements_player_id ON public.player_achievements(player_id);
CREATE INDEX IF NOT EXISTS idx_player_achievements_displayed ON public.player_achievements(player_id, is_displayed) WHERE is_displayed = true;
CREATE INDEX IF NOT EXISTS idx_redeemed_codes_player ON public.redeemed_codes(player_id);
CREATE INDEX IF NOT EXISTS idx_redemption_codes_active ON public.redemption_codes(code) WHERE is_active = true;
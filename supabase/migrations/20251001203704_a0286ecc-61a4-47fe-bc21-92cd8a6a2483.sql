-- Criar tabela de banners disponíveis
CREATE TABLE IF NOT EXISTS public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar NOT NULL,
  display_name varchar NOT NULL,
  description text,
  image_url text NOT NULL,
  unlock_condition varchar NOT NULL,
  unlock_description text,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Criar tabela de banners desbloqueados por jogador
CREATE TABLE IF NOT EXISTS public.player_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  banner_id uuid REFERENCES banners(id) ON DELETE CASCADE NOT NULL,
  unlocked_at timestamp with time zone DEFAULT now(),
  UNIQUE(player_id, banner_id)
);

-- Adicionar coluna selected_banner_id na tabela players
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS selected_banner_id uuid REFERENCES banners(id);

-- Habilitar RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_banners ENABLE ROW LEVEL SECURITY;

-- Políticas para banners (todos podem ver)
CREATE POLICY "Banners são visíveis por todos"
ON public.banners FOR SELECT
USING (true);

-- Políticas para player_banners
CREATE POLICY "Jogadores podem ver seus banners"
ON public.player_banners FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM players
    WHERE players.id = player_banners.player_id
    AND players.user_id = auth.uid()
  )
);

CREATE POLICY "Sistema pode desbloquear banners"
ON public.player_banners FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM players
    WHERE players.id = player_banners.player_id
    AND players.user_id = auth.uid()
  )
);

-- Inserir banner padrão
INSERT INTO public.banners (name, display_name, description, image_url, unlock_condition, unlock_description, is_default)
VALUES 
  ('default', 'Padrão', 'Banner padrão para todos os jogadores', '', 'default', 'Disponível para todos', true),
  ('legacy', 'Legado', 'Banner especial do evento de lançamento', '', 'event_launch', 'Participou do evento de lançamento', false)
ON CONFLICT DO NOTHING;

-- Adicionar cooldown de 90 dias para avaliações
CREATE OR REPLACE FUNCTION can_request_evaluation(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_evaluation_date timestamp with time zone;
BEGIN
  SELECT MAX(created_at) INTO last_evaluation_date
  FROM evaluations
  WHERE player_id IN (SELECT id FROM players WHERE players.user_id = can_request_evaluation.user_id);
  
  -- Se nunca solicitou avaliação, pode solicitar
  IF last_evaluation_date IS NULL THEN
    RETURN true;
  END IF;
  
  -- Verificar se passaram 90 dias
  RETURN (NOW() - last_evaluation_date) >= INTERVAL '90 days';
END;
$$;
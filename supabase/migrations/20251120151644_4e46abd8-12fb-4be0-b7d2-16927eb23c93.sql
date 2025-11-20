-- ============================================
-- MIGRAÇÃO COMPLETA: Sistema Kage Arena
-- ============================================

-- ============================================
-- 1. TABELAS PRINCIPAIS
-- ============================================

-- Tabela de jogadores/usuários
CREATE TABLE IF NOT EXISTS public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name VARCHAR(50) NOT NULL,
  rank VARCHAR(20) DEFAULT 'Unranked',
  rank_level VARCHAR DEFAULT 'Unranked',
  points INTEGER DEFAULT 1000,
  current_points INTEGER DEFAULT 1000,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  win_streak INTEGER DEFAULT 0,
  is_ranked BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  is_moderator BOOLEAN DEFAULT FALSE,
  role VARCHAR DEFAULT 'player',
  kage_title VARCHAR DEFAULT NULL,
  avatar_url TEXT,
  ninja_phrase TEXT DEFAULT 'Esse é o meu jeito ninja de ser!',
  favorite_characters JSONB DEFAULT '[]',
  selected_achievements JSONB DEFAULT '[]',
  selected_banner_id UUID,
  privacy_settings JSONB DEFAULT '{"evaluation_visibility": "all"}',
  tutor_id UUID REFERENCES public.players(id),
  last_profile_update TIMESTAMP WITH TIME ZONE,
  promotion_series_active BOOLEAN DEFAULT false,
  promotion_series_wins INTEGER DEFAULT 0,
  promotion_series_losses INTEGER DEFAULT 0,
  last_promotion_attempt DATE,
  last_match_date DATE,
  immunity_until DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de banners
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  display_name VARCHAR NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  rarity VARCHAR NOT NULL DEFAULT 'common',
  category VARCHAR NOT NULL DEFAULT 'general',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de banners dos jogadores
CREATE TABLE IF NOT EXISTS public.player_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  banner_id UUID NOT NULL REFERENCES public.banners(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(player_id, banner_id)
);

-- Tabela de conquistas/medalhas
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  display_name VARCHAR NOT NULL,
  description TEXT,
  icon VARCHAR NOT NULL,
  color VARCHAR NOT NULL DEFAULT 'gold',
  category VARCHAR NOT NULL DEFAULT 'special',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de conquistas dos jogadores
CREATE TABLE IF NOT EXISTS public.player_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_displayed BOOLEAN DEFAULT false,
  display_order INTEGER,
  UNIQUE(player_id, achievement_id)
);

-- Tabela de códigos de resgate
CREATE TABLE IF NOT EXISTS public.redemption_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR NOT NULL UNIQUE,
  banner_id UUID REFERENCES public.banners(id) ON DELETE SET NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE SET NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de códigos resgatados
CREATE TABLE IF NOT EXISTS public.redeemed_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  code_id UUID NOT NULL REFERENCES public.redemption_codes(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(player_id, code_id)
);

-- Tabela de avaliações
CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  evaluator_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending',
  request_message TEXT,
  pin_score FLOAT CHECK (pin_score >= 0 AND pin_score <= 10),
  defense_score FLOAT CHECK (defense_score >= 0 AND defense_score <= 10),
  aerial_score FLOAT CHECK (aerial_score >= 0 AND aerial_score <= 10),
  kunai_score FLOAT CHECK (kunai_score >= 0 AND kunai_score <= 10),
  timing_score FLOAT CHECK (timing_score >= 0 AND timing_score <= 10),
  resource_score FLOAT CHECK (resource_score >= 0 AND resource_score <= 10),
  dash_score FLOAT CHECK (dash_score >= 0 AND dash_score <= 10),
  general_score FLOAT CHECK (general_score >= 0 AND general_score <= 10),
  tips TEXT,
  comments TEXT,
  initial_rank VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  evaluated_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de resultados de avaliação
CREATE TABLE IF NOT EXISTS public.evaluation_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluation_id UUID NOT NULL REFERENCES public.evaluations(id),
  evaluator_id UUID NOT NULL,
  player_id UUID NOT NULL,
  pin_score DECIMAL(3,1) CHECK (pin_score >= 0 AND pin_score <= 10),
  defense_score DECIMAL(3,1) CHECK (defense_score >= 0 AND defense_score <= 10),
  aerial_score DECIMAL(3,1) CHECK (aerial_score >= 0 AND aerial_score <= 10),
  kunai_score DECIMAL(3,1) CHECK (kunai_score >= 0 AND kunai_score <= 10),
  timing_score DECIMAL(3,1) CHECK (timing_score >= 0 AND timing_score <= 10),
  resource_score DECIMAL(3,1) CHECK (resource_score >= 0 AND resource_score <= 10),
  dash_score DECIMAL(3,1) CHECK (dash_score >= 0 AND dash_score <= 10),
  general_score DECIMAL(3,1) CHECK (general_score >= 0 AND general_score <= 10),
  initial_rank VARCHAR NOT NULL,
  initial_points INTEGER NOT NULL,
  evaluation_summary TEXT NOT NULL,
  tip_1 TEXT NOT NULL,
  tip_2 TEXT NOT NULL,
  tip_3 TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de desafios
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  challenged_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  match_type VARCHAR(20) DEFAULT 'FT5',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '3 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de partidas/resultados
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE SET NULL,
  winner_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  loser_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  rounds_data JSONB,
  match_notes TEXT,
  evidence_url TEXT,
  winner_points_change INTEGER,
  loser_points_change INTEGER,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de histórico de mudanças de ranking
CREATE TABLE IF NOT EXISTS public.ranking_changes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL,
  old_rank VARCHAR,
  new_rank VARCHAR,
  old_points INTEGER,
  new_points INTEGER,
  change_reason VARCHAR NOT NULL,
  match_id UUID,
  evaluation_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de torneios
CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT,
  tournament_type VARCHAR(20) DEFAULT 'single_elimination',
  max_participants INTEGER DEFAULT 32,
  min_rank VARCHAR,
  max_rank VARCHAR,
  require_top_character BOOLEAN DEFAULT false,
  required_character VARCHAR,
  rules_text TEXT,
  registration_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  registration_end TIMESTAMP WITH TIME ZONE NOT NULL,
  check_in_start TIMESTAMP WITH TIME ZONE,
  check_in_end TIMESTAMP WITH TIME ZONE,
  tournament_start TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'registration',
  bracket_data JSONB DEFAULT '[]'::jsonb,
  current_round INTEGER DEFAULT 1,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de participantes do torneio
CREATE TABLE IF NOT EXISTS public.tournament_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  seed INTEGER,
  current_match_id UUID,
  final_position INTEGER,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, player_id)
);

-- Tabela de partidas de torneio
CREATE TABLE IF NOT EXISTS public.tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  player1_id UUID REFERENCES public.tournament_participants(id),
  player2_id UUID REFERENCES public.tournament_participants(id),
  winner_id UUID REFERENCES public.tournament_participants(id),
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  status VARCHAR DEFAULT 'pending',
  bracket_position INTEGER,
  next_match_id UUID REFERENCES public.tournament_matches(id),
  played_at TIMESTAMP WITH TIME ZONE,
  evidence_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de recompensas de torneio
CREATE TABLE IF NOT EXISTS public.tournament_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  points_reward INTEGER DEFAULT 0,
  banner_id UUID REFERENCES public.banners(id),
  achievement_id UUID REFERENCES public.achievements(id),
  custom_reward_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tournament_id, position)
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- 2. HABILITAR ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemption_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redeemed_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranking_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. FUNÇÕES DE SEGURANÇA
-- ============================================

-- Função para verificar se é admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
  SELECT COALESCE(
    (SELECT p.is_admin
     FROM public.players p
     WHERE p.user_id = user_uuid
     LIMIT 1),
    false
  );
$$;

-- Função para verificar se é moderador
CREATE OR REPLACE FUNCTION public.is_moderator(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
  SELECT COALESCE(
    (SELECT p.is_moderator
     FROM public.players p
     WHERE p.user_id = user_uuid
     LIMIT 1),
    false
  );
$$;

-- Função para verificar cooldown de atualização de perfil
CREATE OR REPLACE FUNCTION public.can_update_profile_settings(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  last_update TIMESTAMP WITH TIME ZONE;
  days_since_update INTEGER;
BEGIN
  SELECT last_profile_update INTO last_update
  FROM players
  WHERE players.user_id = $1;
  
  IF last_update IS NULL THEN
    RETURN true;
  END IF;
  
  days_since_update := EXTRACT(day FROM (now() - last_update));
  
  RETURN days_since_update >= 33;
END;
$$;

-- Função para calcular pontos iniciais por rank
CREATE OR REPLACE FUNCTION public.get_initial_points_for_rank(rank_name VARCHAR)
RETURNS INTEGER AS $$
BEGIN
  CASE rank_name
    WHEN 'Genin' THEN RETURN 100;
    WHEN 'Chunnin' THEN RETURN 200;
    WHEN 'Jounnin' THEN RETURN 350;
    WHEN 'Anbu' THEN RETURN 450;
    WHEN 'Sanin' THEN RETURN 600;
    ELSE RETURN 100;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar títulos Kage
CREATE OR REPLACE FUNCTION public.update_kage_titles()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  top_players RECORD;
  kage_titles TEXT[] := ARRAY['Hokage', 'Kazekage', 'Mizukage', 'Raikage', 'Tsuchikage'];
  counter INTEGER := 1;
BEGIN
  UPDATE public.players SET kage_title = NULL;
  
  FOR top_players IN 
    SELECT id FROM public.players 
    WHERE is_ranked = true AND user_id IS NOT NULL
    ORDER BY current_points DESC, wins DESC 
    LIMIT 5
  LOOP
    UPDATE public.players 
    SET kage_title = kage_titles[counter]
    WHERE id = top_players.id;
    
    counter := counter + 1;
  END LOOP;
END;
$$;

-- Função para definir admin inicial
CREATE OR REPLACE FUNCTION public.set_initial_admin(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.players WHERE is_admin = true) THEN
    UPDATE public.players
    SET is_admin = true, is_moderator = true, role = 'admin'
    WHERE user_id = target_user_id;
  END IF;
END;
$$;

-- Função para distribuir recompensas de torneio
CREATE OR REPLACE FUNCTION public.distribute_tournament_rewards(tournament_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  participant RECORD;
  reward RECORD;
BEGIN
  FOR participant IN 
    SELECT tp.player_id, tp.final_position
    FROM tournament_participants tp
    WHERE tp.tournament_id = tournament_uuid
    AND tp.final_position IS NOT NULL
  LOOP
    FOR reward IN
      SELECT * FROM tournament_rewards
      WHERE tournament_id = tournament_uuid
      AND position = participant.final_position
    LOOP
      IF reward.points_reward > 0 THEN
        UPDATE players
        SET current_points = current_points + reward.points_reward,
            points = points + reward.points_reward
        WHERE id = participant.player_id;
      END IF;
      
      IF reward.banner_id IS NOT NULL THEN
        INSERT INTO player_banners (player_id, banner_id)
        VALUES (participant.player_id, reward.banner_id)
        ON CONFLICT (player_id, banner_id) DO NOTHING;
      END IF;
      
      IF reward.achievement_id IS NOT NULL THEN
        INSERT INTO player_achievements (player_id, achievement_id)
        VALUES (participant.player_id, reward.achievement_id)
        ON CONFLICT (player_id, achievement_id) DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;
END;
$$;

-- Função para resgatar código
CREATE OR REPLACE FUNCTION public.redeem_code(
  p_player_id UUID,
  p_code_text VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  v_code RECORD;
  v_result JSONB;
BEGIN
  SELECT * INTO v_code
  FROM redemption_codes
  WHERE code = p_code_text
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > now())
  AND (max_uses IS NULL OR current_uses < max_uses);
  
  IF v_code.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Código inválido ou expirado');
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM redeemed_codes
    WHERE player_id = p_player_id AND code_id = v_code.id
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Código já resgatado');
  END IF;
  
  INSERT INTO redeemed_codes (player_id, code_id)
  VALUES (p_player_id, v_code.id);
  
  UPDATE redemption_codes
  SET current_uses = current_uses + 1
  WHERE id = v_code.id;
  
  IF v_code.banner_id IS NOT NULL THEN
    INSERT INTO player_banners (player_id, banner_id)
    VALUES (p_player_id, v_code.banner_id)
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF v_code.achievement_id IS NOT NULL THEN
    INSERT INTO player_achievements (player_id, achievement_id)
    VALUES (p_player_id, v_code.achievement_id)
    ON CONFLICT DO NOTHING;
  END IF;
  
  v_result := jsonb_build_object(
    'success', true,
    'banner_id', v_code.banner_id,
    'achievement_id', v_code.achievement_id
  );
  
  RETURN v_result;
END;
$$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_players_updated_at
BEFORE UPDATE ON public.players
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at
BEFORE UPDATE ON public.tournaments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tournament_matches_updated_at
BEFORE UPDATE ON public.tournament_matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 4. POLÍTICAS RLS - PLAYERS
-- ============================================

CREATE POLICY "Perfis são visíveis por todos"
ON public.players FOR SELECT
USING (true);

CREATE POLICY "Usuários podem criar seu próprio perfil"
ON public.players FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
ON public.players FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins podem atualizar qualquer perfil"
ON public.players FOR UPDATE
USING (public.is_admin(auth.uid()));

-- ============================================
-- 5. POLÍTICAS RLS - BANNERS
-- ============================================

CREATE POLICY "Banners são visíveis por todos"
ON public.banners FOR SELECT
USING (is_available = true);

CREATE POLICY "Admins podem gerenciar banners"
ON public.banners FOR ALL
USING (public.is_admin(auth.uid()));

CREATE POLICY "Jogadores podem ver seus banners"
ON public.player_banners FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.players
    WHERE players.id = player_banners.player_id
    AND players.user_id = auth.uid()
  )
);

CREATE POLICY "Sistema pode adicionar banners"
ON public.player_banners FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.players
    WHERE players.id = player_banners.player_id
    AND players.user_id = auth.uid()
  )
);

-- ============================================
-- 6. POLÍTICAS RLS - ACHIEVEMENTS
-- ============================================

CREATE POLICY "Conquistas são visíveis por todos"
ON public.achievements FOR SELECT
USING (true);

CREATE POLICY "Admins podem gerenciar conquistas"
ON public.achievements FOR ALL
USING (public.is_admin(auth.uid()));

CREATE POLICY "Jogadores podem ver suas conquistas"
ON public.player_achievements FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.players
    WHERE players.id = player_achievements.player_id
    AND players.user_id = auth.uid()
  )
);

CREATE POLICY "Sistema pode adicionar conquistas"
ON public.player_achievements FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.players
    WHERE players.id = player_achievements.player_id
    AND players.user_id = auth.uid()
  )
);

CREATE POLICY "Jogadores podem atualizar suas conquistas"
ON public.player_achievements FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.players
    WHERE players.id = player_achievements.player_id
    AND players.user_id = auth.uid()
  )
);

-- ============================================
-- 7. POLÍTICAS RLS - REDEMPTION CODES
-- ============================================

CREATE POLICY "Códigos ativos são visíveis por todos"
ON public.redemption_codes FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins podem gerenciar códigos"
ON public.redemption_codes FOR ALL
USING (public.is_admin(auth.uid()));

CREATE POLICY "Jogadores podem ver seus resgates"
ON public.redeemed_codes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.players
    WHERE players.id = redeemed_codes.player_id
    AND players.user_id = auth.uid()
  )
);

CREATE POLICY "Jogadores podem resgatar códigos"
ON public.redeemed_codes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.players
    WHERE players.id = redeemed_codes.player_id
    AND players.user_id = auth.uid()
  )
);

-- ============================================
-- 8. POLÍTICAS RLS - EVALUATIONS
-- ============================================

CREATE POLICY "Avaliações visíveis por todos ou configuração privada"
ON public.evaluations FOR SELECT
USING (
  status = 'completed'
  OR EXISTS (
    SELECT 1 FROM public.players
    WHERE players.id = evaluations.player_id
    AND players.user_id = auth.uid()
  )
  OR public.is_moderator(auth.uid())
);

CREATE POLICY "Jogadores podem solicitar avaliação"
ON public.evaluations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.players
    WHERE players.id = evaluations.player_id
    AND players.user_id = auth.uid()
  )
);

CREATE POLICY "Moderadores podem atualizar avaliações"
ON public.evaluations FOR UPDATE
USING (public.is_moderator(auth.uid()));

CREATE POLICY "Resultados visíveis por participantes"
ON public.evaluation_results FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM players
    WHERE (players.id = evaluation_results.player_id AND players.user_id = auth.uid())
  ) OR
  EXISTS (
    SELECT 1 FROM players
    WHERE (players.id = evaluation_results.evaluator_id AND players.user_id = auth.uid())
  )
);

CREATE POLICY "Avaliadores podem inserir resultados"
ON public.evaluation_results FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM players
    WHERE (players.id = evaluation_results.evaluator_id AND players.user_id = auth.uid() AND players.is_moderator = true)
  )
);

-- ============================================
-- 9. POLÍTICAS RLS - CHALLENGES & MATCHES
-- ============================================

CREATE POLICY "Desafios são visíveis por todos"
ON public.challenges FOR SELECT
USING (true);

CREATE POLICY "Jogadores podem criar desafios"
ON public.challenges FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.players
    WHERE players.id = challenges.challenger_id
    AND players.user_id = auth.uid()
  )
);

CREATE POLICY "Participantes podem atualizar desafios"
ON public.challenges FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.players p
    WHERE (p.id = challenges.challenger_id OR p.id = challenges.challenged_id)
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Partidas são visíveis por todos"
ON public.matches FOR SELECT
USING (true);

CREATE POLICY "Moderadores podem registrar partidas"
ON public.matches FOR INSERT
WITH CHECK (public.is_moderator(auth.uid()));

CREATE POLICY "Mudanças de ranking visíveis por todos"
ON public.ranking_changes FOR SELECT
USING (true);

-- ============================================
-- 10. POLÍTICAS RLS - TOURNAMENTS
-- ============================================

CREATE POLICY "Torneios são visíveis por todos"
ON public.tournaments FOR SELECT
USING (true);

CREATE POLICY "Moderadores podem criar torneios"
ON public.tournaments FOR INSERT
WITH CHECK (public.is_moderator(auth.uid()));

CREATE POLICY "Moderadores podem atualizar torneios"
ON public.tournaments FOR UPDATE
USING (public.is_moderator(auth.uid()));

CREATE POLICY "Moderadores podem deletar torneios"
ON public.tournaments FOR DELETE
USING (public.is_moderator(auth.uid()));

CREATE POLICY "Participantes são visíveis por todos"
ON public.tournament_participants FOR SELECT
USING (true);

CREATE POLICY "Jogadores podem se inscrever e fazer check-in"
ON public.tournament_participants FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM players
    WHERE players.id = tournament_participants.player_id
    AND players.user_id = auth.uid()
  )
);

CREATE POLICY "Participantes podem atualizar check-in"
ON public.tournament_participants FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM players
    WHERE players.id = tournament_participants.player_id
    AND players.user_id = auth.uid()
  )
);

CREATE POLICY "Moderadores podem gerenciar participantes"
ON public.tournament_participants FOR ALL
USING (public.is_moderator(auth.uid()));

CREATE POLICY "Partidas de torneio são visíveis por todos"
ON public.tournament_matches FOR SELECT
USING (true);

CREATE POLICY "Participantes podem reportar resultados"
ON public.tournament_matches FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM tournament_participants tp
    WHERE (tp.id = tournament_matches.player1_id OR tp.id = tournament_matches.player2_id)
    AND EXISTS (
      SELECT 1 FROM players p
      WHERE p.id = tp.player_id AND p.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Moderadores podem gerenciar partidas"
ON public.tournament_matches FOR ALL
USING (public.is_moderator(auth.uid()));

CREATE POLICY "Recompensas são visíveis por todos"
ON public.tournament_rewards FOR SELECT
USING (true);

CREATE POLICY "Moderadores podem gerenciar recompensas"
ON public.tournament_rewards FOR ALL
USING (public.is_moderator(auth.uid()));

-- ============================================
-- 11. POLÍTICAS RLS - NOTIFICATIONS
-- ============================================

CREATE POLICY "Usuários podem ver suas notificações"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode criar notificações"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas notificações"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas notificações"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 12. STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('Temas', 'Temas', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para Temas (imagens de torneios)
CREATE POLICY "Imagens de torneio são públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'Temas');

CREATE POLICY "Moderadores podem fazer upload de temas"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'Temas' AND public.is_moderator(auth.uid()));

CREATE POLICY "Moderadores podem atualizar temas"
ON storage.objects FOR UPDATE
USING (bucket_id = 'Temas' AND public.is_moderator(auth.uid()));

CREATE POLICY "Moderadores podem deletar temas"
ON storage.objects FOR DELETE
USING (bucket_id = 'Temas' AND public.is_moderator(auth.uid()));

-- Políticas de storage para avatars
CREATE POLICY "Avatares são públicos"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Usuários podem fazer upload de seus avatares"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem atualizar seus avatares"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem deletar seus avatares"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 13. ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_players_user_id ON public.players(user_id);
CREATE INDEX IF NOT EXISTS idx_players_is_ranked ON public.players(is_ranked);
CREATE INDEX IF NOT EXISTS idx_players_current_points ON public.players(current_points DESC);
CREATE INDEX IF NOT EXISTS idx_evaluations_player_id ON public.evaluations(player_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_status ON public.evaluations(status);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.challenges(status);
CREATE INDEX IF NOT EXISTS idx_matches_winner_id ON public.matches(winner_id);
CREATE INDEX IF NOT EXISTS idx_matches_loser_id ON public.matches(loser_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament_id ON public.tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_tournament_id ON public.tournament_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
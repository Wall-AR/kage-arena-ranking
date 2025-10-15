-- Atualizar tabela de torneios com novos campos
ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS min_rank VARCHAR,
ADD COLUMN IF NOT EXISTS max_rank VARCHAR,
ADD COLUMN IF NOT EXISTS require_top_character BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS required_character VARCHAR,
ADD COLUMN IF NOT EXISTS check_in_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS check_in_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS bracket_data JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS current_round INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS rules_text TEXT;

-- Atualizar tabela de participantes
ALTER TABLE tournament_participants
ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS seed INTEGER,
ADD COLUMN IF NOT EXISTS current_match_id UUID;

-- Criar tabela de partidas de torneio
CREATE TABLE IF NOT EXISTS tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  player1_id UUID REFERENCES tournament_participants(id),
  player2_id UUID REFERENCES tournament_participants(id),
  winner_id UUID REFERENCES tournament_participants(id),
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  status VARCHAR DEFAULT 'pending', -- pending, in_progress, completed, bye
  bracket_position INTEGER,
  next_match_id UUID REFERENCES tournament_matches(id),
  played_at TIMESTAMP WITH TIME ZONE,
  evidence_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de recompensas de torneio
CREATE TABLE IF NOT EXISTS tournament_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  position INTEGER NOT NULL, -- 1 = primeiro, 2 = segundo, etc
  points_reward INTEGER DEFAULT 0,
  banner_id UUID REFERENCES banners(id),
  achievement_id UUID REFERENCES achievements(id),
  custom_reward_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tournament_id, position)
);

-- Habilitar RLS
ALTER TABLE tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_rewards ENABLE ROW LEVEL SECURITY;

-- Políticas para tournament_matches
CREATE POLICY "Partidas de torneio são visíveis por todos"
ON tournament_matches FOR SELECT
USING (true);

CREATE POLICY "Participantes podem reportar resultados"
ON tournament_matches FOR UPDATE
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
ON tournament_matches FOR ALL
USING (is_moderator(auth.uid()));

-- Políticas para tournament_rewards
CREATE POLICY "Recompensas são visíveis por todos"
ON tournament_rewards FOR SELECT
USING (true);

CREATE POLICY "Moderadores podem gerenciar recompensas"
ON tournament_rewards FOR ALL
USING (is_moderator(auth.uid()));

-- Atualizar política de participantes para incluir check-in
DROP POLICY IF EXISTS "Jogadores podem se inscrever" ON tournament_participants;

CREATE POLICY "Jogadores podem se inscrever e fazer check-in"
ON tournament_participants FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM players
    WHERE players.id = tournament_participants.player_id
    AND players.user_id = auth.uid()
  )
);

CREATE POLICY "Participantes podem atualizar check-in"
ON tournament_participants FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM players
    WHERE players.id = tournament_participants.player_id
    AND players.user_id = auth.uid()
  )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tournament_matches_tournament ON tournament_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_round ON tournament_matches(round);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_player ON tournament_participants(player_id);
CREATE INDEX IF NOT EXISTS idx_tournament_rewards_tournament ON tournament_rewards(tournament_id);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_tournament_match_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_tournament_matches_updated_at ON tournament_matches;
CREATE TRIGGER update_tournament_matches_updated_at
  BEFORE UPDATE ON tournament_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_tournament_match_updated_at();

-- Função para distribuir recompensas ao finalizar torneio
CREATE OR REPLACE FUNCTION distribute_tournament_rewards(p_tournament_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reward_record RECORD;
  participant_record RECORD;
BEGIN
  -- Para cada recompensa definida
  FOR reward_record IN 
    SELECT * FROM tournament_rewards WHERE tournament_id = p_tournament_id
  LOOP
    -- Encontrar participante na posição
    SELECT tp.player_id INTO participant_record
    FROM tournament_participants tp
    WHERE tp.tournament_id = p_tournament_id
    AND tp.final_position = reward_record.position
    LIMIT 1;
    
    IF participant_record.player_id IS NOT NULL THEN
      -- Adicionar pontos
      IF reward_record.points_reward > 0 THEN
        UPDATE players
        SET current_points = current_points + reward_record.points_reward
        WHERE id = participant_record.player_id;
      END IF;
      
      -- Desbloquear banner
      IF reward_record.banner_id IS NOT NULL THEN
        INSERT INTO player_banners (player_id, banner_id)
        VALUES (participant_record.player_id, reward_record.banner_id)
        ON CONFLICT (player_id, banner_id) DO NOTHING;
      END IF;
      
      -- Desbloquear conquista
      IF reward_record.achievement_id IS NOT NULL THEN
        INSERT INTO player_achievements (player_id, achievement_id)
        VALUES (participant_record.player_id, reward_record.achievement_id)
        ON CONFLICT (player_id, achievement_id) DO NOTHING;
      END IF;
    END IF;
  END LOOP;
END;
$$;
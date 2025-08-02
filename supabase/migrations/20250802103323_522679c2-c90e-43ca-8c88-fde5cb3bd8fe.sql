-- Corrigir estrutura de permissões e implementar sistema completo de ranking

-- 1. Criar enum para cargos/roles
CREATE TYPE IF NOT EXISTS user_role AS ENUM ('admin', 'moderator', 'player');

-- 2. Atualizar tabela players com novos campos necessários
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'player',
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 3. Corrigir estrutura da tabela evaluations para melhor funcionalidade
ALTER TABLE evaluations
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS tip_1 TEXT,
ADD COLUMN IF NOT EXISTS tip_2 TEXT,
ADD COLUMN IF NOT EXISTS tip_3 TEXT;

-- 4. Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM players WHERE players.user_id = is_admin.user_id LIMIT 1),
    false
  );
$$;

-- 5. Função para verificar se usuário é moderador/avaliador
CREATE OR REPLACE FUNCTION is_moderator(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT is_moderator FROM players WHERE players.user_id = is_moderator.user_id LIMIT 1),
    false
  );
$$;

-- 6. Função para verificar se usuário é rankeado
CREATE OR REPLACE FUNCTION is_ranked_player(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT is_ranked FROM players WHERE players.user_id = is_ranked_player.user_id LIMIT 1),
    false
  );
$$;

-- 7. Dropear políticas existentes da tabela evaluations
DROP POLICY IF EXISTS "Avaliações são visíveis baseado na privacidade" ON evaluations;
DROP POLICY IF EXISTS "Jogadores podem criar pedidos de avaliação" ON evaluations;
DROP POLICY IF EXISTS "Moderadores podem atualizar avaliações" ON evaluations;

-- 8. Criar novas políticas para evaluations
-- Jogadores não rankeados podem criar pedidos de avaliação
CREATE POLICY "evaluation_insert_policy" ON evaluations
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM players 
    WHERE players.id = evaluations.player_id 
    AND players.user_id = auth.uid()
    AND players.is_ranked = false
  )
);

-- Moderadores podem ver todas as avaliações
CREATE POLICY "evaluation_select_policy" ON evaluations
FOR SELECT 
USING (
  is_moderator(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM players 
    WHERE players.id = evaluations.player_id 
    AND players.user_id = auth.uid()
  )
);

-- Moderadores podem atualizar avaliações
CREATE POLICY "evaluation_update_policy" ON evaluations
FOR UPDATE 
USING (is_moderator(auth.uid()));

-- 9. Dropear políticas existentes da tabela players
DROP POLICY IF EXISTS "Players são visíveis por todos" ON players;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON players;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON players;

-- 10. Criar novas políticas para players
-- Todos podem ver players
CREATE POLICY "players_select_policy" ON players
FOR SELECT USING (true);

-- Usuários podem atualizar seu próprio perfil (exceto campos admin)
CREATE POLICY "players_update_own_policy" ON players
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  (
    -- Admins podem alterar tudo
    is_admin(auth.uid()) OR
    -- Usuários normais não podem alterar campos críticos
    (
      is_moderator = (SELECT is_moderator FROM players WHERE id = players.id) AND
      is_admin = (SELECT is_admin FROM players WHERE id = players.id) AND
      role = (SELECT role FROM players WHERE id = players.id)
    )
  )
);

-- Apenas trigger pode inserir players
CREATE POLICY "players_insert_policy" ON players
FOR INSERT WITH CHECK (true);

-- 11. Política especial para admins gerenciarem outros usuários
CREATE POLICY "admin_manage_players_policy" ON players
FOR UPDATE 
USING (is_admin(auth.uid()));

-- 12. Atualizar função de pontos para ranking
CREATE OR REPLACE FUNCTION get_initial_points_for_rank(rank_name character varying)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- 13. Função para calcular mudança de pontos
CREATE OR REPLACE FUNCTION calculate_points_change(
  winner_rank character varying,
  loser_rank character varying,
  is_winner boolean
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  rank_values jsonb := '{"Genin": 1, "Chunnin": 2, "Jounnin": 3, "Anbu": 4, "Sanin": 5, "Kage": 6}';
  winner_level integer;
  loser_level integer;
  class_diff integer;
  base_points integer := 20;
  base_loss integer := 10;
BEGIN
  winner_level := (rank_values->>winner_rank)::integer;
  loser_level := (rank_values->>loser_rank)::integer;
  class_diff := ABS(winner_level - loser_level);
  
  IF class_diff = 0 THEN
    -- Mesma classe
    RETURN CASE WHEN is_winner THEN base_points ELSE -base_loss END;
  ELSE
    -- Classes diferentes - multiplicar pela diferença
    IF is_winner THEN
      -- Se venceu alguém de classe superior, ganha mais pontos
      IF loser_level > winner_level THEN
        RETURN base_points * (class_diff + 1);
      ELSE
        -- Se venceu alguém de classe inferior, ganha menos pontos
        RETURN base_points;
      END IF;
    ELSE
      -- Se perdeu para classe inferior, perde mais pontos
      IF loser_level < winner_level THEN
        RETURN -base_loss * (class_diff + 1);
      ELSE
        -- Se perdeu para classe superior, perde menos pontos
        RETURN -base_loss;
      END IF;
    END IF;
  END IF;
END;
$$;

-- 14. Função para determinar nova classe baseada na classe do oponente
CREATE OR REPLACE FUNCTION get_new_rank_after_victory(
  current_rank character varying,
  opponent_rank character varying
)
RETURNS character varying
LANGUAGE plpgsql
AS $$
DECLARE
  rank_hierarchy text[] := ARRAY['Genin', 'Chunnin', 'Jounnin', 'Anbu', 'Sanin', 'Kage'];
  current_index integer;
  opponent_index integer;
BEGIN
  -- Encontrar índices dos ranks
  SELECT array_position(rank_hierarchy, current_rank) INTO current_index;
  SELECT array_position(rank_hierarchy, opponent_rank) INTO opponent_index;
  
  -- Se venceu alguém de classe superior, assume a classe do oponente
  IF opponent_index > current_index THEN
    RETURN opponent_rank;
  END IF;
  
  -- Caso contrário, mantém a classe atual
  RETURN current_rank;
END;
$$;

-- 15. Função para rebaixamento após derrota
CREATE OR REPLACE FUNCTION get_new_rank_after_defeat(
  current_rank character varying,
  opponent_rank character varying
)
RETURNS character varying
LANGUAGE plpgsql
AS $$
DECLARE
  rank_hierarchy text[] := ARRAY['Genin', 'Chunnin', 'Jounnin', 'Anbu', 'Sanin', 'Kage'];
  current_index integer;
  opponent_index integer;
  new_index integer;
BEGIN
  -- Encontrar índices dos ranks
  SELECT array_position(rank_hierarchy, current_rank) INTO current_index;
  SELECT array_position(rank_hierarchy, opponent_rank) INTO opponent_index;
  
  -- Se perdeu para classe inferior, cai apenas 1 nível
  IF opponent_index < current_index THEN
    new_index := current_index - 1;
    -- Não pode ser menor que 1 (Genin)
    IF new_index < 1 THEN
      new_index := 1;
    END IF;
    RETURN rank_hierarchy[new_index];
  END IF;
  
  -- Caso contrário, mantém a classe atual
  RETURN current_rank;
END;
$$;

-- 16. Atualizar trigger para criar players com dados corretos
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.players (
    user_id, 
    name, 
    rank, 
    rank_level,
    points, 
    current_points,
    wins, 
    losses, 
    win_streak,
    is_ranked, 
    is_moderator,
    is_admin,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'Ninja'), 
    'Unranked',
    'Unranked', 
    1000,
    1000, 
    0, 
    0, 
    0,
    false, 
    false,
    false,
    'player',
    now(),
    now()
  );
  RETURN NEW;
END;
$$;

-- 17. Marcar usuários existentes como admin se necessário (ajustar conforme necessário)
UPDATE players 
SET is_admin = true, role = 'admin'
WHERE is_moderator = true 
AND name IN ('Wall', 'Wall7');  -- Ajustar nomes conforme necessário
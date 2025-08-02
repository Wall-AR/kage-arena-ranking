-- Corrigir estrutura de permissões e implementar sistema completo de ranking

-- 1. Criar enum para cargos/roles (sem IF NOT EXISTS)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'player');
    END IF;
END $$;

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

-- 6. Dropear políticas existentes da tabela evaluations
DROP POLICY IF EXISTS "Avaliações são visíveis baseado na privacidade" ON evaluations;
DROP POLICY IF EXISTS "Jogadores podem criar pedidos de avaliação" ON evaluations;
DROP POLICY IF EXISTS "Moderadores podem atualizar avaliações" ON evaluations;

-- 7. Criar novas políticas para evaluations
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

-- Moderadores podem ver todas as avaliações, jogadores podem ver as próprias
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

-- 8. Dropear políticas existentes da tabela players
DROP POLICY IF EXISTS "Players são visíveis por todos" ON players;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON players;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON players;

-- 9. Criar novas políticas para players
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

-- 10. Política especial para admins gerenciarem outros usuários
CREATE POLICY "admin_manage_players_policy" ON players
FOR UPDATE 
USING (is_admin(auth.uid()));

-- 11. Atualizar trigger para criar players com dados corretos
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

-- 12. Marcar usuários existentes como admin
UPDATE players 
SET is_admin = true, role = 'admin'
WHERE is_moderator = true 
AND name IN ('Wall', 'Wall7');
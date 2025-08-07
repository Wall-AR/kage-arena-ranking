-- Corrigir políticas RLS para permitir admins gerenciarem roles
-- Remover política restritiva atual
DROP POLICY IF EXISTS "players_update_own_policy" ON players;

-- Política para jogadores atualizarem apenas seus próprios dados básicos
CREATE POLICY "players_update_own_basic_policy" 
ON players 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND 
  -- Não permitir que jogadores normais alterem roles/flags administrativos
  is_admin = (SELECT is_admin FROM players WHERE id = players.id) AND
  is_moderator = (SELECT is_moderator FROM players WHERE id = players.id) AND
  role = (SELECT role FROM players WHERE id = players.id)
);

-- Política para admins gerenciarem todos os jogadores (incluindo roles)
CREATE POLICY "admin_update_all_players_policy" 
ON players 
FOR UPDATE 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Criar função para verificar se um usuário específico é admin (necessária para primeira configuração)
CREATE OR REPLACE FUNCTION public.set_initial_admin(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Apenas permite definir o primeiro admin se não houver nenhum admin ainda
  IF NOT EXISTS (SELECT 1 FROM players WHERE is_admin = true) THEN
    UPDATE players 
    SET is_admin = true, is_moderator = true, role = 'admin'
    WHERE user_id = target_user_id;
  END IF;
END;
$$;
-- Corrigir as políticas RLS problemáticas da tabela players
DROP POLICY IF EXISTS "players_update_own_basic_policy" ON public.players;
DROP POLICY IF EXISTS "admin_manage_players_policy" ON public.players;
DROP POLICY IF EXISTS "admin_update_all_players_policy" ON public.players;

-- Criar políticas RLS corretas
CREATE POLICY "players_update_own_profile_policy" 
ON public.players 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND 
  -- Preservar valores de admin/moderator para usuários normais
  (NOT is_admin(auth.uid()) OR is_admin = is_admin) AND
  (NOT is_admin(auth.uid()) OR is_moderator = is_moderator) AND
  (NOT is_admin(auth.uid()) OR role = role)
);

-- Política para admins gerenciarem outros players
CREATE POLICY "admin_manage_all_players_policy" 
ON public.players 
FOR UPDATE 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Corrigir as funções is_admin e is_moderator para serem mais robustas
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT COALESCE(
    (SELECT p.is_admin FROM public.players p WHERE p.user_id = $1 LIMIT 1),
    false
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_moderator(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT COALESCE(
    (SELECT p.is_moderator FROM public.players p WHERE p.user_id = $1 LIMIT 1),
    false
  );
$function$;
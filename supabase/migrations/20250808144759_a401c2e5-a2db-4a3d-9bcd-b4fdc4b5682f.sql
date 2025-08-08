
-- 1) Corrigir as funções de verificação de cargo

CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
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

CREATE OR REPLACE FUNCTION public.is_moderator(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
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

-- 2) Definir "Wall" como admin inicial (somente se ainda não houver admin)
DO $$
DECLARE
  target_uuid uuid;
BEGIN
  -- Encontra o user_id do jogador chamado "Wall" (case-insensitive) que já possua user_id
  SELECT user_id
    INTO target_uuid
  FROM public.players
  WHERE lower(name) = lower('Wall')
    AND user_id IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 1;

  IF target_uuid IS NULL THEN
    RAISE NOTICE 'Não encontrei um player com nome "Wall" e user_id definido. Faça login com o usuário "Wall" e execute novamente.';
  ELSE
    PERFORM public.set_initial_admin(target_uuid);
    RAISE NOTICE 'set_initial_admin executado para o usuário "Wall" (%).', target_uuid;
  END IF;
END
$$;

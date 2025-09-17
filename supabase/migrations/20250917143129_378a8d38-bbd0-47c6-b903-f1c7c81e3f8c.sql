-- Recriar o trigger para criar players automaticamente quando users são criados
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO public.players (
    user_id, 
    name, 
    rank, 
    rank_level,
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
$function$;

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Criar players para users existentes que não têm player ainda
INSERT INTO public.players (
  user_id, 
  name, 
  rank, 
  rank_level,
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
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'name', 'Ninja'),
  'Unranked',
  'Unranked',
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
FROM auth.users au
LEFT JOIN public.players p ON p.user_id = au.id
WHERE p.user_id IS NULL;

-- Função para definir o primeiro admin facilmente
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $function$
DECLARE
  target_user_id uuid;
  player_exists boolean;
BEGIN
  -- Buscar o user_id pelo email
  SELECT au.id INTO target_user_id 
  FROM auth.users au 
  WHERE au.email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN 'Usuário com email ' || user_email || ' não encontrado.';
  END IF;
  
  -- Verificar se o player existe
  SELECT EXISTS(SELECT 1 FROM public.players WHERE user_id = target_user_id) INTO player_exists;
  
  IF NOT player_exists THEN
    RETURN 'Player não encontrado para o usuário ' || user_email;
  END IF;
  
  -- Promover a admin e moderador
  UPDATE public.players 
  SET 
    is_admin = true, 
    is_moderator = true, 
    role = 'admin'
  WHERE user_id = target_user_id;
  
  RETURN 'Usuário ' || user_email || ' promovido a administrador com sucesso!';
END;
$function$;

-- Função para definir moderador
CREATE OR REPLACE FUNCTION public.make_user_moderator(user_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $function$
DECLARE
  target_user_id uuid;
  player_exists boolean;
BEGIN
  -- Buscar o user_id pelo email
  SELECT au.id INTO target_user_id 
  FROM auth.users au 
  WHERE au.email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN 'Usuário com email ' || user_email || ' não encontrado.';
  END IF;
  
  -- Verificar se o player existe
  SELECT EXISTS(SELECT 1 FROM public.players WHERE user_id = target_user_id) INTO player_exists;
  
  IF NOT player_exists THEN
    RETURN 'Player não encontrado para o usuário ' || user_email;
  END IF;
  
  -- Promover a moderador (deve ser rankeado para ser moderador)
  UPDATE public.players 
  SET 
    is_moderator = true, 
    role = 'moderator',
    is_ranked = true,
    rank = COALESCE(rank_level, 'Genin'),
    current_points = CASE WHEN current_points < 100 THEN 100 ELSE current_points END
  WHERE user_id = target_user_id;
  
  RETURN 'Usuário ' || user_email || ' promovido a moderador com sucesso!';
END;
$function$;
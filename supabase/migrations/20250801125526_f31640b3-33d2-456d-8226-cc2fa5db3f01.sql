-- Verificar se o trigger existe
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Recriar a função e trigger com correções
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
    now(),
    now()
  );
  RETURN NEW;
END;
$$;

-- Dropar o trigger se existir e recriar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Criar profiles para usuários existentes que não têm
INSERT INTO public.players (user_id, name, rank, rank_level, points, current_points, wins, losses, win_streak, is_ranked, is_moderator)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'name', 'Ninja'),
  'Unranked',
  'Unranked',
  1000,
  1000,
  0,
  0,
  0,
  false,
  false
FROM auth.users au
LEFT JOIN public.players p ON p.user_id = au.id
WHERE p.user_id IS NULL;
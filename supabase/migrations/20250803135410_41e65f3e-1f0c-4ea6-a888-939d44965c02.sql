-- Corrigir problemas de segurança detectados pelo linter

-- Atualizar funções para ter search_path seguro
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM players WHERE players.user_id = is_admin.user_id LIMIT 1),
    false
  );
$$;

CREATE OR REPLACE FUNCTION is_moderator(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT COALESCE(
    (SELECT is_moderator FROM players WHERE players.user_id = is_moderator.user_id LIMIT 1),
    false
  );
$$;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
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
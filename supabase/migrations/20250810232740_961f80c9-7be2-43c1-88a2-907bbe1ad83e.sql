-- 0) Re-create role-check functions WITHOUT dropping (keep same signature)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
  SELECT COALESCE(
    (SELECT p.is_admin FROM public.players p WHERE p.user_id = user_id LIMIT 1),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_moderator(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $$
  SELECT COALESCE(
    (SELECT p.is_moderator FROM public.players p WHERE p.user_id = user_id LIMIT 1),
    false
  );
$$;

-- 1) Ensure signup trigger is present
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- 2) Backfill players for existing users
INSERT INTO public.players (
  user_id, name, rank, rank_level,
  points, current_points, wins, losses, win_streak,
  is_ranked, is_moderator, is_admin, role, created_at, updated_at
)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data ->> 'name', 'Ninja'),
  'Unranked', 'Unranked',
  1000, 1000, 0, 0, 0,
  false, false, false, 'player', now(), now()
FROM auth.users u
LEFT JOIN public.players p ON p.user_id = u.id
WHERE p.id IS NULL;

-- 3) Keep updated_at in sync
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_players_updated_at') THEN
    CREATE TRIGGER trg_players_updated_at
    BEFORE UPDATE ON public.players
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_evaluations_updated_at') THEN
    CREATE TRIGGER trg_evaluations_updated_at
    BEFORE UPDATE ON public.evaluations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_tournaments_updated_at') THEN
    CREATE TRIGGER trg_tournaments_updated_at
    BEFORE UPDATE ON public.tournaments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 4) Auto-apply match impacts to points/ranking logs
CREATE OR REPLACE FUNCTION public.apply_match_result()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path='public','pg_temp'
AS $$
DECLARE
  w_change int := COALESCE(NEW.winner_points_change, 25);
  l_change int := COALESCE(NEW.loser_points_change, -25);
  w_old int;
  w_new int;
  l_old int;
  l_new int;
  w_rank text;
  l_rank text;
BEGIN
  -- Winner
  SELECT current_points INTO w_old FROM public.players WHERE id = NEW.winner_id FOR UPDATE;
  w_new := COALESCE(w_old, 1000) + w_change;
  UPDATE public.players
    SET current_points = w_new,
        wins = wins + 1,
        win_streak = win_streak + 1,
        last_match_date = (NEW.played_at)::date
  WHERE id = NEW.winner_id;

  -- Loser
  SELECT current_points INTO l_old FROM public.players WHERE id = NEW.loser_id FOR UPDATE;
  l_new := COALESCE(l_old, 1000) + l_change;
  UPDATE public.players
    SET current_points = l_new,
        losses = losses + 1,
        win_streak = 0,
        last_match_date = (NEW.played_at)::date
  WHERE id = NEW.loser_id;

  -- Ranks snapshot
  SELECT rank INTO w_rank FROM public.players WHERE id = NEW.winner_id;
  SELECT rank INTO l_rank FROM public.players WHERE id = NEW.loser_id;

  -- Log changes
  INSERT INTO public.ranking_changes (player_id, old_points, new_points, match_id, change_reason, old_rank, new_rank)
  VALUES (NEW.winner_id, w_old, w_new, NEW.id, 'match', w_rank, w_rank);
  INSERT INTO public.ranking_changes (player_id, old_points, new_points, match_id, change_reason, old_rank, new_rank)
  VALUES (NEW.loser_id, l_old, l_new, NEW.id, 'match', l_rank, l_rank);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_match_result ON public.matches;
CREATE TRIGGER trg_apply_match_result
AFTER INSERT ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.apply_match_result();

-- 5) Unique index for one player per user (safe)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_players_user_id_unique'
  ) THEN
    IF NOT EXISTS (
      SELECT user_id FROM public.players WHERE user_id IS NOT NULL GROUP BY user_id HAVING COUNT(*) > 1
    ) THEN
      CREATE UNIQUE INDEX idx_players_user_id_unique ON public.players(user_id) WHERE user_id IS NOT NULL;
    END IF;
  END IF;
END $$;

-- 6) Try to set initial admin for "Wall" if present
DO $$
DECLARE target_uuid uuid;
BEGIN
  SELECT user_id INTO target_uuid
  FROM public.players
  WHERE lower(name) = lower('Wall') AND user_id IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 1;

  IF target_uuid IS NOT NULL THEN
    PERFORM public.set_initial_admin(target_uuid);
  END IF;
END $$;

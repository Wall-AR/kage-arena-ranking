-- 0) Ensure core role-check functions are correct
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

-- 1) Create trigger to auto-create a players row when a user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- 2) Backfill players for existing auth.users without a players row
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

-- 3) Simplify and correct players UPDATE policies
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS players_update_own_basic_policy ON public.players;
DROP POLICY IF EXISTS admin_manage_players_policy ON public.players;
DROP POLICY IF EXISTS admin_update_all_players_policy ON public.players;
DROP POLICY IF EXISTS moderator_assign_tutor_policy ON public.players;

-- Owners can update their own row (trigger will restrict which columns)
CREATE POLICY players_update_own_basic_policy
ON public.players
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can update any player
CREATE POLICY admin_update_all_players_policy
ON public.players
FOR UPDATE
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Moderators can update (trigger will restrict to tutor assignment)
CREATE POLICY moderator_assign_tutor_policy
ON public.players
FOR UPDATE
USING (public.is_moderator(auth.uid()))
WITH CHECK (public.is_moderator(auth.uid()));

-- 4) Prevent privilege escalation and unsafe updates via trigger
CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public','pg_temp'
AS $$
DECLARE
  my_player_id uuid;
BEGIN
  -- Allow system/definer calls (no auth context)
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Admins can do anything
  IF public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  -- Block changes to restricted fields by non-admins
  IF
     (NEW.is_admin IS DISTINCT FROM OLD.is_admin) OR
     (NEW.is_moderator IS DISTINCT FROM OLD.is_moderator) OR
     (NEW.role IS DISTINCT FROM OLD.role) OR
     (NEW.points IS DISTINCT FROM OLD.points) OR
     (NEW.current_points IS DISTINCT FROM OLD.current_points) OR
     (NEW.wins IS DISTINCT FROM OLD.wins) OR
     (NEW.losses IS DISTINCT FROM OLD.losses) OR
     (NEW.win_streak IS DISTINCT FROM OLD.win_streak) OR
     (NEW.is_ranked IS DISTINCT FROM OLD.is_ranked) OR
     (NEW.rank IS DISTINCT FROM OLD.rank) OR
     (NEW.rank_level IS DISTINCT FROM OLD.rank_level) OR
     (NEW.kage_title IS DISTINCT FROM OLD.kage_title) OR
     (NEW.promotion_series_active IS DISTINCT FROM OLD.promotion_series_active) OR
     (NEW.promotion_series_wins IS DISTINCT FROM OLD.promotion_series_wins) OR
     (NEW.promotion_series_losses IS DISTINCT FROM OLD.promotion_series_losses) OR
     (NEW.last_promotion_attempt IS DISTINCT FROM OLD.last_promotion_attempt)
  THEN
     RAISE EXCEPTION 'Not allowed to modify restricted fields' USING ERRCODE = '42501';
  END IF;

  -- Moderators: only allowed to set tutor_id to themselves, nothing else
  IF public.is_moderator(auth.uid()) THEN
     SELECT id INTO my_player_id FROM public.players WHERE user_id = auth.uid() LIMIT 1;

     IF (NEW.tutor_id IS DISTINCT FROM OLD.tutor_id) THEN
        IF NEW.tutor_id = my_player_id THEN
           -- Ensure no other non-cosmetic fields are changed
           IF (
             ROW(NEW.name, NEW.avatar_url, NEW.ninja_phrase, NEW.favorite_characters, NEW.privacy_settings)
             IS DISTINCT FROM
             ROW(OLD.name, OLD.avatar_url, OLD.ninja_phrase, OLD.favorite_characters, OLD.privacy_settings)
           ) THEN
             RAISE EXCEPTION 'Moderators can only set tutor_id' USING ERRCODE = '42501';
           END IF;
           RETURN NEW;
        ELSE
           RAISE EXCEPTION 'Moderators can only set tutor_id to themselves' USING ERRCODE = '42501';
        END IF;
     END IF;

     RAISE EXCEPTION 'Moderators cannot modify players except tutor_id' USING ERRCODE = '42501';
  END IF;

  -- Owners: allow cosmetic fields only; tutor_id cannot be changed
  IF NEW.user_id = auth.uid() THEN
     IF NEW.tutor_id IS DISTINCT FROM OLD.tutor_id THEN
       RAISE EXCEPTION 'You cannot change tutor assignment' USING ERRCODE = '42501';
     END IF;
     -- All other checks passed; allowed cosmetic updates
     RETURN NEW;
  END IF;

  -- Others cannot update
  RAISE EXCEPTION 'Not allowed' USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_privilege_escalation ON public.players;
CREATE TRIGGER trg_prevent_privilege_escalation
BEFORE UPDATE ON public.players
FOR EACH ROW
EXECUTE FUNCTION public.prevent_privilege_escalation();

-- 5) Keep updated_at fresh on common tables
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

-- 6) Apply match effects to ranking/points automatically
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

  -- Ranks snapshot (no change logic implemented)
  SELECT rank INTO w_rank FROM public.players WHERE id = NEW.winner_id;
  SELECT rank INTO l_rank FROM public.players WHERE id = NEW.loser_id;

  -- Log ranking deltas
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

-- 7) Unique player per user (safely)
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

-- 8) Try to set initial admin again for "Wall" if present
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


-- 1. New columns on banners
ALTER TABLE public.banners
  ADD COLUMN IF NOT EXISTS character_name varchar,
  ADD COLUMN IF NOT EXISTS unlock_type varchar NOT NULL DEFAULT 'manual';

COMMENT ON COLUMN public.banners.character_name IS 'When set, banner is exclusive to current TOP 1 player of this character in the character ranking.';
COMMENT ON COLUMN public.banners.unlock_type IS 'manual | achievement | event | code | character_top1';

CREATE INDEX IF NOT EXISTS idx_banners_character_name ON public.banners(character_name) WHERE character_name IS NOT NULL;

-- 2. Function: get banners a player can currently use
CREATE OR REPLACE FUNCTION public.get_player_available_banners(p_player_id uuid)
RETURNS TABLE (
  banner_id uuid,
  source text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  -- Banners manually unlocked (achievements / codes / events / admin grants)
  SELECT pb.banner_id, 'unlocked'::text AS source
  FROM public.player_banners pb
  WHERE pb.player_id = p_player_id

  UNION

  -- Character TOP 1 banners: player must be #1 in current_points among ranked players that have this character as favorite
  SELECT b.id AS banner_id, 'character_top1'::text AS source
  FROM public.banners b
  WHERE b.character_name IS NOT NULL
    AND b.is_available = true
    AND EXISTS (
      SELECT 1 FROM public.players p
      WHERE p.id = p_player_id
        AND p.is_ranked = true
        AND p.favorite_characters ? b.character_name
        AND p.current_points = (
          SELECT MAX(p2.current_points)
          FROM public.players p2
          WHERE p2.is_ranked = true
            AND p2.favorite_characters ? b.character_name
        )
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_player_available_banners(uuid) TO authenticated, anon;

-- 3. Trigger to prevent selecting an unauthorized banner
CREATE OR REPLACE FUNCTION public.validate_selected_banner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.selected_banner_id IS NULL THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.selected_banner_id IS NOT DISTINCT FROM OLD.selected_banner_id THEN
    RETURN NEW;
  END IF;
  -- Admins bypass
  IF auth.uid() IS NOT NULL AND public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.get_player_available_banners(NEW.id) g
    WHERE g.banner_id = NEW.selected_banner_id
  ) THEN
    RAISE EXCEPTION 'Você não possui acesso a este banner.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_selected_banner ON public.players;
CREATE TRIGGER trg_validate_selected_banner
BEFORE INSERT OR UPDATE OF selected_banner_id ON public.players
FOR EACH ROW
EXECUTE FUNCTION public.validate_selected_banner();

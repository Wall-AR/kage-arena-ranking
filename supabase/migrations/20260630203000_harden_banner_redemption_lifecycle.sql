-- Harden banner ownership:
-- - code rewards are permanent through player_banners
-- - character TOP 1 banners are dynamic and never become permanent
-- - selected TOP 1 banners are cleared when the player loses eligibility

CREATE OR REPLACE FUNCTION public.get_player_available_banners(p_player_id uuid)
RETURNS TABLE (
  banner_id uuid,
  source text
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  -- Permanent banners unlocked through codes, achievements, events, tournaments or admin grants.
  -- Character TOP 1 banners are intentionally excluded from this persistent source.
  SELECT pb.banner_id, 'unlocked'::text AS source
  FROM public.player_banners pb
  JOIN public.banners b ON b.id = pb.banner_id
  WHERE pb.player_id = p_player_id
    AND COALESCE(b.is_available, true) = true
    AND COALESCE(b.unlock_type, 'manual') <> 'character_top1'
    AND b.character_name IS NULL

  UNION

  -- Dynamic character banners: only the current single TOP 1 of that character can use it.
  SELECT b.id AS banner_id, 'character_top1'::text AS source
  FROM public.banners b
  WHERE b.character_name IS NOT NULL
    AND COALESCE(b.is_available, true) = true
    AND COALESCE(b.unlock_type, 'manual') = 'character_top1'
    AND p_player_id = (
      SELECT p2.id
      FROM public.players p2
      WHERE COALESCE(p2.is_ranked, false) = true
        AND p2.favorite_characters ? b.character_name
      ORDER BY
        COALESCE(p2.current_points, 0) DESC,
        COALESCE(p2.wins, 0) DESC,
        COALESCE(p2.losses, 0) ASC,
        p2.created_at ASC
      LIMIT 1
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_player_available_banners(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_player_available_banners(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.redeem_code(
  p_player_id uuid,
  p_code_text varchar
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_code record;
  v_code_text text := upper(trim(coalesce(p_code_text, '')));
  v_banner record;
  v_already_redeemed boolean := false;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Login necessario para resgatar codigo';
  END IF;

  IF v_code_text = '' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Informe um codigo para resgatar');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.players p
    WHERE p.id = p_player_id
      AND (p.user_id = auth.uid() OR public.is_admin(auth.uid()))
  ) THEN
    RAISE EXCEPTION 'Voce so pode resgatar codigos para o seu proprio perfil';
  END IF;

  SELECT *
  INTO v_code
  FROM public.redemption_codes rc
  WHERE upper(trim(rc.code)) = v_code_text
    AND COALESCE(rc.is_active, true) = true
    AND (rc.expires_at IS NULL OR rc.expires_at > now())
  ORDER BY
    CASE WHEN rc.code = v_code_text THEN 0 ELSE 1 END,
    rc.created_at ASC
  LIMIT 1;

  IF v_code.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Codigo invalido ou expirado');
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.redeemed_codes redeemed
    WHERE redeemed.player_id = p_player_id
      AND redeemed.code_id = v_code.id
  )
  INTO v_already_redeemed;

  IF v_already_redeemed IS NOT TRUE
    AND v_code.max_uses IS NOT NULL
    AND COALESCE(v_code.current_uses, 0) >= v_code.max_uses
  THEN
    RETURN jsonb_build_object('success', false, 'message', 'Este codigo atingiu o limite de resgates');
  END IF;

  IF v_code.banner_id IS NOT NULL THEN
    SELECT *
    INTO v_banner
    FROM public.banners b
    WHERE b.id = v_code.banner_id;

    IF v_banner.id IS NULL THEN
      RETURN jsonb_build_object('success', false, 'message', 'Banner do codigo nao encontrado');
    END IF;

    IF COALESCE(v_banner.unlock_type, 'manual') = 'character_top1'
      OR v_banner.character_name IS NOT NULL
    THEN
      RETURN jsonb_build_object('success', false, 'message', 'Banners TOP 1 nao podem ser resgatados por codigo');
    END IF;
  END IF;

  IF v_already_redeemed IS TRUE THEN
    -- Heal missing rewards from older versions while keeping the code one-time per player.
    IF v_code.banner_id IS NOT NULL THEN
      INSERT INTO public.player_banners (player_id, banner_id)
      VALUES (p_player_id, v_code.banner_id)
      ON CONFLICT DO NOTHING;
    END IF;

    IF v_code.achievement_id IS NOT NULL THEN
      INSERT INTO public.player_achievements (player_id, achievement_id)
      VALUES (p_player_id, v_code.achievement_id)
      ON CONFLICT DO NOTHING;
    END IF;

    RETURN jsonb_build_object(
      'success', true,
      'already_redeemed', true,
      'message', 'Codigo ja resgatado. As recompensas continuam disponiveis na sua colecao.',
      'banner_id', v_code.banner_id,
      'achievement_id', v_code.achievement_id,
      'banner_unlocked', false,
      'achievement_unlocked', false
    );
  END IF;

  INSERT INTO public.redeemed_codes (player_id, code_id)
  VALUES (p_player_id, v_code.id);

  UPDATE public.redemption_codes
  SET current_uses = COALESCE(current_uses, 0) + 1
  WHERE id = v_code.id;

  IF v_code.banner_id IS NOT NULL THEN
    INSERT INTO public.player_banners (player_id, banner_id)
    VALUES (p_player_id, v_code.banner_id)
    ON CONFLICT DO NOTHING;
  END IF;

  IF v_code.achievement_id IS NOT NULL THEN
    INSERT INTO public.player_achievements (player_id, achievement_id)
    VALUES (p_player_id, v_code.achievement_id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'already_redeemed', false,
    'message', 'Codigo resgatado com sucesso!',
    'banner_id', v_code.banner_id,
    'achievement_id', v_code.achievement_id,
    'banner_unlocked', v_code.banner_id IS NOT NULL,
    'achievement_unlocked', v_code.achievement_id IS NOT NULL
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.redeem_code(uuid, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_code(uuid, varchar) TO authenticated;

CREATE OR REPLACE FUNCTION public.clear_invalid_selected_character_banners()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count integer := 0;
BEGIN
  IF current_setting('app.kage_clearing_banners', true) = 'on' THEN
    RETURN 0;
  END IF;

  PERFORM set_config('app.kage_clearing_banners', 'on', true);

  UPDATE public.players p
  SET selected_banner_id = NULL
  FROM public.banners b
  WHERE p.selected_banner_id = b.id
    AND (
      COALESCE(b.unlock_type, 'manual') = 'character_top1'
      OR b.character_name IS NOT NULL
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.get_player_available_banners(p.id) available
      WHERE available.banner_id = p.selected_banner_id
    );

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.clear_invalid_selected_character_banners_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF current_setting('app.kage_clearing_banners', true) = 'on' THEN
    RETURN NULL;
  END IF;

  PERFORM public.clear_invalid_selected_character_banners();
  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.clear_invalid_selected_character_banners() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.clear_invalid_selected_character_banners_trigger() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_clear_invalid_selected_character_banners_after_player_rank ON public.players;
CREATE TRIGGER trg_clear_invalid_selected_character_banners_after_player_rank
AFTER UPDATE OF current_points, wins, losses, is_ranked, favorite_characters, selected_banner_id
ON public.players
FOR EACH STATEMENT
EXECUTE FUNCTION public.clear_invalid_selected_character_banners_trigger();

DROP TRIGGER IF EXISTS trg_clear_invalid_selected_character_banners_after_banner_update ON public.banners;
CREATE TRIGGER trg_clear_invalid_selected_character_banners_after_banner_update
AFTER UPDATE OF character_name, unlock_type, is_available
ON public.banners
FOR EACH STATEMENT
EXECUTE FUNCTION public.clear_invalid_selected_character_banners_trigger();

DROP TRIGGER IF EXISTS trg_clear_invalid_selected_character_banners_after_banner_insert ON public.banners;
CREATE TRIGGER trg_clear_invalid_selected_character_banners_after_banner_insert
AFTER INSERT
ON public.banners
FOR EACH STATEMENT
EXECUTE FUNCTION public.clear_invalid_selected_character_banners_trigger();

INSERT INTO public.achievements (name, display_name, description, icon, color, category)
VALUES (
  'bucha_elite',
  'Bucha de Elite',
  'Conquistado por membros fundadores da comunidade.',
  'award',
  'gold',
  'special'
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  category = EXCLUDED.category;

INSERT INTO public.banners (
  name,
  display_name,
  description,
  image_url,
  rarity,
  category,
  is_available,
  unlock_type,
  character_name
)
VALUES (
  'legacy_banner',
  'Eu Sou Bucha',
  'Banner legado comemorativo de lancamento do Kage Arena.',
  '/banners/eusoubucha.jpg',
  'rare',
  'event',
  true,
  'code',
  NULL
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  rarity = EXCLUDED.rarity,
  category = EXCLUDED.category,
  is_available = EXCLUDED.is_available,
  unlock_type = EXCLUDED.unlock_type,
  character_name = EXCLUDED.character_name;

DO $$
DECLARE
  v_banner_id uuid;
  v_achievement_id uuid;
  v_code_id uuid;
  v_duplicate record;
BEGIN
  SELECT id INTO v_banner_id
  FROM public.banners
  WHERE name = 'legacy_banner';

  SELECT id INTO v_achievement_id
  FROM public.achievements
  WHERE name = 'bucha_elite';

  SELECT id
  INTO v_code_id
  FROM public.redemption_codes
  WHERE upper(trim(code)) = 'EUSOUBUCHAD+'
  ORDER BY
    CASE WHEN code = 'EUSOUBUCHAD+' THEN 0 ELSE 1 END,
    created_at ASC
  LIMIT 1;

  IF v_code_id IS NULL THEN
    INSERT INTO public.redemption_codes (code, banner_id, achievement_id, max_uses, is_active)
    VALUES ('EUSOUBUCHAD+', v_banner_id, v_achievement_id, NULL, true)
    RETURNING id INTO v_code_id;
  ELSE
    UPDATE public.redemption_codes
    SET code = 'EUSOUBUCHAD+',
        banner_id = v_banner_id,
        achievement_id = v_achievement_id,
        max_uses = NULL,
        is_active = true
    WHERE id = v_code_id;
  END IF;

  FOR v_duplicate IN
    SELECT id
    FROM public.redemption_codes
    WHERE upper(trim(code)) = 'EUSOUBUCHAD+'
      AND id <> v_code_id
  LOOP
    INSERT INTO public.redeemed_codes (player_id, code_id, redeemed_at)
    SELECT player_id, v_code_id, min(redeemed_at)
    FROM public.redeemed_codes
    WHERE code_id = v_duplicate.id
    GROUP BY player_id
    ON CONFLICT (player_id, code_id) DO NOTHING;

    DELETE FROM public.redeemed_codes
    WHERE code_id = v_duplicate.id;

    DELETE FROM public.redemption_codes
    WHERE id = v_duplicate.id;
  END LOOP;
END;
$$;

CREATE INDEX IF NOT EXISTS redemption_codes_code_upper_trim_idx
  ON public.redemption_codes (upper(trim(code)));

SELECT public.clear_invalid_selected_character_banners();

NOTIFY pgrst, 'reload schema';

-- Harden public RPCs and normalize rank names.
-- Canonical ranks used by the app: Genin, Chunin, Jounin, Anbu, Sannin.

UPDATE public.players
SET
  rank = CASE rank
    WHEN 'Chunnin' THEN 'Chunin'
    WHEN 'Jounnin' THEN 'Jounin'
    WHEN 'Sanin' THEN 'Sannin'
    ELSE rank
  END,
  rank_level = CASE rank_level
    WHEN 'Chunnin' THEN 'Chunin'
    WHEN 'Jounnin' THEN 'Jounin'
    WHEN 'Sanin' THEN 'Sannin'
    ELSE rank_level
  END
WHERE rank IN ('Chunnin', 'Jounnin', 'Sanin')
   OR rank_level IN ('Chunnin', 'Jounnin', 'Sanin');

CREATE OR REPLACE FUNCTION public.get_initial_points_for_rank(rank_name varchar)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  CASE rank_name
    WHEN 'Genin' THEN RETURN 100;
    WHEN 'Chunin' THEN RETURN 200;
    WHEN 'Chunnin' THEN RETURN 200;
    WHEN 'Jounin' THEN RETURN 350;
    WHEN 'Jounnin' THEN RETURN 350;
    WHEN 'Anbu' THEN RETURN 450;
    WHEN 'Sannin' THEN RETURN 600;
    WHEN 'Sanin' THEN RETURN 600;
    ELSE RETURN 0;
  END CASE;
END;
$$;

CREATE OR REPLACE FUNCTION public.compute_rank_from_points(p_points int)
RETURNS varchar
LANGUAGE sql
IMMUTABLE
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT CASE
    WHEN p_points >= 600 THEN 'Sannin'
    WHEN p_points >= 450 THEN 'Anbu'
    WHEN p_points >= 350 THEN 'Jounin'
    WHEN p_points >= 200 THEN 'Chunin'
    WHEN p_points >= 100 THEN 'Genin'
    ELSE 'Unranked'
  END::varchar;
$$;

CREATE OR REPLACE FUNCTION public.can_update_profile_settings(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  last_update timestamptz;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Login necessário';
  END IF;

  IF p_user_id <> auth.uid() AND NOT public.is_moderator(auth.uid()) THEN
    RAISE EXCEPTION 'Sem permissão para consultar este perfil';
  END IF;

  SELECT p.last_profile_update INTO last_update
  FROM public.players p
  WHERE p.user_id = p_user_id;

  RETURN last_update IS NULL OR (now() - last_update) >= interval '33 days';
END;
$$;

CREATE OR REPLACE FUNCTION public.update_kage_titles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  top_player record;
  kage_titles text[] := ARRAY['Hokage', 'Kazekage', 'Mizukage', 'Raikage', 'Tsuchikage'];
  counter integer := 1;
BEGIN
  UPDATE public.players SET kage_title = NULL;

  FOR top_player IN
    SELECT id
    FROM public.players
    WHERE is_ranked = true
      AND user_id IS NOT NULL
    ORDER BY current_points DESC, wins DESC, losses ASC, created_at ASC
    LIMIT 5
  LOOP
    UPDATE public.players
    SET kage_title = kage_titles[counter]
    WHERE id = top_player.id;

    counter := counter + 1;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.redeem_code(
  p_player_id uuid,
  p_code_text varchar
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  v_code record;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Login necessário para resgatar código';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.players p
    WHERE p.id = p_player_id
      AND (p.user_id = auth.uid() OR public.is_admin(auth.uid()))
  ) THEN
    RAISE EXCEPTION 'Você só pode resgatar códigos para o seu próprio perfil';
  END IF;

  SELECT * INTO v_code
  FROM public.redemption_codes
  WHERE code = p_code_text
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR current_uses < max_uses);

  IF v_code.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Código inválido ou expirado');
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.redeemed_codes
    WHERE player_id = p_player_id
      AND code_id = v_code.id
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Código já resgatado');
  END IF;

  INSERT INTO public.redeemed_codes (player_id, code_id)
  VALUES (p_player_id, v_code.id);

  UPDATE public.redemption_codes
  SET current_uses = current_uses + 1
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
    'message', 'Código resgatado com sucesso!',
    'banner_id', v_code.banner_id,
    'achievement_id', v_code.achievement_id,
    'banner_unlocked', v_code.banner_id IS NOT NULL,
    'achievement_unlocked', v_code.achievement_id IS NOT NULL
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.advance_tournament_winner(p_match_id uuid, p_winner_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  v_match record;
  v_next record;
  v_caller_player_id uuid;
BEGIN
  SELECT p.id INTO v_caller_player_id
  FROM public.players p
  WHERE p.user_id = auth.uid();

  SELECT * INTO v_match
  FROM public.tournament_matches
  WHERE id = p_match_id;

  IF v_match IS NULL THEN
    RAISE EXCEPTION 'Partida de torneio não encontrada';
  END IF;

  IF p_winner_id NOT IN (v_match.player1_id, v_match.player2_id) THEN
    RAISE EXCEPTION 'Vencedor inválido para esta partida';
  END IF;

  IF NOT public.is_moderator(auth.uid()) AND NOT EXISTS (
    SELECT 1
    FROM public.tournament_participants tp
    WHERE tp.id IN (v_match.player1_id, v_match.player2_id)
      AND tp.player_id = v_caller_player_id
  ) THEN
    RAISE EXCEPTION 'Sem permissão para avançar esta partida';
  END IF;

  UPDATE public.tournament_participants
  SET current_match_id = v_match.next_match_id
  WHERE id = p_winner_id;

  IF v_match.next_match_id IS NULL THEN
    RETURN;
  END IF;

  IF v_match.bracket_position % 2 = 1 THEN
    UPDATE public.tournament_matches
    SET player1_id = p_winner_id
    WHERE id = v_match.next_match_id;
  ELSE
    UPDATE public.tournament_matches
    SET player2_id = p_winner_id
    WHERE id = v_match.next_match_id;
  END IF;

  SELECT * INTO v_next
  FROM public.tournament_matches
  WHERE id = v_match.next_match_id;

  IF v_next.status = 'bye' THEN
    UPDATE public.tournament_matches
    SET winner_id = COALESCE(v_next.player1_id, v_next.player2_id),
        status = 'completed',
        played_at = now()
    WHERE id = v_next.id;

    PERFORM public.advance_tournament_winner(v_next.id, COALESCE(v_next.player1_id, v_next.player2_id));
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_tournament_bracket(tournament_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  v_participants uuid[];
  v_count int;
  v_size int;
  v_rounds int;
  r int;
  i int;
  v_total_in_round int;
  v_prev_round_match_ids uuid[];
  v_curr_round_match_ids uuid[];
  v_new_match_id uuid;
  v_p1 uuid;
  v_p2 uuid;
  v_status text;
  v_winner uuid;
BEGIN
  IF NOT public.is_moderator(auth.uid()) THEN
    RAISE EXCEPTION 'Apenas moderadores podem gerar chaveamento';
  END IF;

  IF EXISTS (SELECT 1 FROM public.tournament_matches WHERE tournament_id = tournament_uuid) THEN
    RAISE EXCEPTION 'Chaveamento já foi gerado para este torneio';
  END IF;

  SELECT array_agg(id ORDER BY random()) INTO v_participants
  FROM public.tournament_participants
  WHERE tournament_id = tournament_uuid
    AND checked_in = true;

  v_count := COALESCE(array_length(v_participants, 1), 0);
  IF v_count < 2 THEN
    RAISE EXCEPTION 'Mínimo de 2 participantes confirmados com check-in';
  END IF;

  FOR i IN 1..v_count LOOP
    UPDATE public.tournament_participants
    SET seed = i
    WHERE id = v_participants[i];
  END LOOP;

  v_size := 1;
  WHILE v_size < v_count LOOP
    v_size := v_size * 2;
  END LOOP;
  v_rounds := CAST(log(2, v_size) AS int);
  v_prev_round_match_ids := ARRAY[]::uuid[];

  FOR r IN 1..v_rounds LOOP
    v_total_in_round := v_size / (2 ^ r)::int;
    v_curr_round_match_ids := ARRAY[]::uuid[];

    FOR i IN 1..v_total_in_round LOOP
      IF r = 1 THEN
        v_p1 := v_participants[(i - 1) * 2 + 1];
        v_p2 := v_participants[(i - 1) * 2 + 2];

        IF v_p1 IS NULL AND v_p2 IS NULL THEN
          v_status := 'pending';
          v_winner := NULL;
        ELSIF v_p1 IS NULL OR v_p2 IS NULL THEN
          v_status := 'bye';
          v_winner := COALESCE(v_p1, v_p2);
        ELSE
          v_status := 'pending';
          v_winner := NULL;
        END IF;
      ELSE
        v_p1 := NULL;
        v_p2 := NULL;
        v_status := 'pending';
        v_winner := NULL;
      END IF;

      INSERT INTO public.tournament_matches (
        tournament_id, round, match_number, player1_id, player2_id,
        status, winner_id, bracket_position, played_at
      )
      VALUES (
        tournament_uuid, r, i, v_p1, v_p2,
        v_status, v_winner, i, CASE WHEN v_status = 'bye' THEN now() ELSE NULL END
      )
      RETURNING id INTO v_new_match_id;

      v_curr_round_match_ids := v_curr_round_match_ids || v_new_match_id;
    END LOOP;

    IF array_length(v_prev_round_match_ids, 1) IS NOT NULL THEN
      FOR i IN 1..array_length(v_prev_round_match_ids, 1) LOOP
        UPDATE public.tournament_matches
        SET next_match_id = v_curr_round_match_ids[((i - 1) / 2) + 1]
        WHERE id = v_prev_round_match_ids[i];
      END LOOP;
    END IF;

    v_prev_round_match_ids := v_curr_round_match_ids;
  END LOOP;

  PERFORM public.advance_tournament_winner(m.id, m.winner_id)
  FROM public.tournament_matches m
  WHERE m.tournament_id = tournament_uuid
    AND m.round = 1
    AND m.status = 'bye'
    AND m.winner_id IS NOT NULL;

  UPDATE public.tournaments
  SET status = 'in_progress',
      current_round = 1
  WHERE id = tournament_uuid;
END;
$$;

CREATE OR REPLACE FUNCTION public.finalize_tournament(tournament_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  v_final record;
  v_max_round int;
BEGIN
  IF NOT public.is_moderator(auth.uid()) THEN
    RAISE EXCEPTION 'Apenas moderadores podem finalizar torneios';
  END IF;

  SELECT MAX(round) INTO v_max_round
  FROM public.tournament_matches
  WHERE tournament_id = tournament_uuid;

  IF v_max_round IS NULL THEN
    RAISE EXCEPTION 'Sem partidas para finalizar';
  END IF;

  SELECT * INTO v_final
  FROM public.tournament_matches
  WHERE tournament_id = tournament_uuid
    AND round = v_max_round
  LIMIT 1;

  IF v_final IS NULL OR v_final.status <> 'completed' OR v_final.winner_id IS NULL THEN
    RAISE EXCEPTION 'Final ainda não foi concluída';
  END IF;

  UPDATE public.tournament_participants
  SET final_position = 1
  WHERE id = v_final.winner_id
    AND tournament_id = tournament_uuid;

  UPDATE public.tournament_participants
  SET final_position = 2
  WHERE tournament_id = tournament_uuid
    AND id = CASE
      WHEN v_final.player1_id = v_final.winner_id THEN v_final.player2_id
      ELSE v_final.player1_id
    END
    AND id IS NOT NULL;

  IF v_max_round >= 2 THEN
    UPDATE public.tournament_participants
    SET final_position = 3
    WHERE tournament_id = tournament_uuid
      AND id IN (
        SELECT CASE
          WHEN m.player1_id = m.winner_id THEN m.player2_id
          ELSE m.player1_id
        END
        FROM public.tournament_matches m
        WHERE m.tournament_id = tournament_uuid
          AND m.round = v_max_round - 1
          AND m.status = 'completed'
          AND m.winner_id IS NOT NULL
      )
      AND final_position IS NULL;
  END IF;

  PERFORM public.distribute_tournament_rewards(tournament_uuid);

  UPDATE public.tournaments
  SET status = 'completed'
  WHERE id = tournament_uuid;
END;
$$;

REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_moderator(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_initial_points_for_rank(varchar) TO authenticated;
GRANT EXECUTE ON FUNCTION public.compute_rank_from_points(int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_update_profile_settings(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_code(uuid, varchar) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_kage_titles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_player_available_banners(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.challenge_check_in(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_challenge_result(uuid, uuid, jsonb, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_challenge_result(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.dispute_challenge_result(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_challenge(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_old_challenges() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.advance_tournament_winner(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_tournament_bracket(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_tournament(uuid) TO authenticated;

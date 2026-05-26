
-- Improve advance_tournament_winner: correct slot mapping + cascade BYEs
CREATE OR REPLACE FUNCTION public.advance_tournament_winner(p_match_id uuid, p_winner_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_match RECORD;
  v_next RECORD;
BEGIN
  SELECT * INTO v_match FROM tournament_matches WHERE id = p_match_id;
  IF v_match IS NULL THEN RETURN; END IF;

  UPDATE tournament_participants SET current_match_id = v_match.next_match_id WHERE id = p_winner_id;

  IF v_match.next_match_id IS NULL THEN RETURN; END IF;

  -- Odd bracket_position → player1 slot of next; even → player2 slot
  IF v_match.bracket_position % 2 = 1 THEN
    UPDATE tournament_matches SET player1_id = p_winner_id WHERE id = v_match.next_match_id;
  ELSE
    UPDATE tournament_matches SET player2_id = p_winner_id WHERE id = v_match.next_match_id;
  END IF;

  SELECT * INTO v_next FROM tournament_matches WHERE id = v_match.next_match_id;

  -- Auto-advance if next match is now a BYE (one side filled, other permanently empty because feeder was bye/null)
  IF v_next.status = 'bye' OR (v_next.player1_id IS NOT NULL AND v_next.player2_id IS NULL AND NOT EXISTS (
        SELECT 1 FROM tournament_matches m2 WHERE m2.next_match_id = v_next.id AND m2.id <> p_match_id AND m2.status NOT IN ('completed','bye')
    )) OR (v_next.player2_id IS NOT NULL AND v_next.player1_id IS NULL AND NOT EXISTS (
        SELECT 1 FROM tournament_matches m2 WHERE m2.next_match_id = v_next.id AND m2.id <> p_match_id AND m2.status NOT IN ('completed','bye')
    )) THEN
    -- Only auto-advance if this is round 1 BYE scenario (no feeder match for the empty slot)
    IF v_next.status = 'bye' THEN
      UPDATE tournament_matches SET winner_id = COALESCE(v_next.player1_id, v_next.player2_id), status='completed', played_at=now() WHERE id = v_next.id;
      PERFORM advance_tournament_winner(v_next.id, COALESCE(v_next.player1_id, v_next.player2_id));
    END IF;
  END IF;
END;
$$;

-- Generates a complete bracket for a tournament
CREATE OR REPLACE FUNCTION public.generate_tournament_bracket(tournament_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
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
  -- Block if already generated
  IF EXISTS (SELECT 1 FROM tournament_matches WHERE tournament_id = tournament_uuid) THEN
    RAISE EXCEPTION 'Chaveamento já foi gerado para este torneio';
  END IF;

  SELECT array_agg(id ORDER BY random()) INTO v_participants
  FROM tournament_participants
  WHERE tournament_id = tournament_uuid AND checked_in = true;

  v_count := COALESCE(array_length(v_participants, 1), 0);
  IF v_count < 2 THEN
    RAISE EXCEPTION 'Mínimo de 2 participantes confirmados (com check-in)';
  END IF;

  -- Assign seeds
  FOR i IN 1..v_count LOOP
    UPDATE tournament_participants SET seed = i WHERE id = v_participants[i];
  END LOOP;

  -- Next power of 2
  v_size := 1;
  WHILE v_size < v_count LOOP v_size := v_size * 2; END LOOP;
  v_rounds := CAST(log(2, v_size) AS int);

  -- Build rounds from the FINAL backwards so we can set next_match_id easily.
  -- We'll instead build forward and patch next_match_id afterwards.

  v_prev_round_match_ids := ARRAY[]::uuid[];

  FOR r IN 1..v_rounds LOOP
    v_total_in_round := v_size / (2 ^ r)::int;
    v_curr_round_match_ids := ARRAY[]::uuid[];
    FOR i IN 1..v_total_in_round LOOP
      IF r = 1 THEN
        v_p1 := v_participants[(i-1)*2 + 1];
        v_p2 := v_participants[(i-1)*2 + 2];
        IF v_p1 IS NULL AND v_p2 IS NULL THEN
          v_status := 'pending'; v_winner := NULL;
        ELSIF v_p1 IS NULL OR v_p2 IS NULL THEN
          v_status := 'bye';
          v_winner := COALESCE(v_p1, v_p2);
        ELSE
          v_status := 'pending'; v_winner := NULL;
        END IF;
      ELSE
        v_p1 := NULL; v_p2 := NULL; v_status := 'pending'; v_winner := NULL;
      END IF;

      INSERT INTO tournament_matches (tournament_id, round, match_number, player1_id, player2_id, status, winner_id, bracket_position, played_at)
      VALUES (tournament_uuid, r, i, v_p1, v_p2, v_status, v_winner, i, CASE WHEN v_status='bye' THEN now() ELSE NULL END)
      RETURNING id INTO v_new_match_id;

      v_curr_round_match_ids := v_curr_round_match_ids || v_new_match_id;
    END LOOP;

    -- Link previous round's matches to this round
    IF array_length(v_prev_round_match_ids, 1) IS NOT NULL THEN
      FOR i IN 1..array_length(v_prev_round_match_ids, 1) LOOP
        UPDATE tournament_matches
        SET next_match_id = v_curr_round_match_ids[((i-1)/2)+1]
        WHERE id = v_prev_round_match_ids[i];
      END LOOP;
    END IF;

    v_prev_round_match_ids := v_curr_round_match_ids;
  END LOOP;

  -- Cascade BYEs from round 1
  FOR i IN (
    SELECT id, winner_id FROM tournament_matches
    WHERE tournament_id = tournament_uuid AND round = 1 AND status = 'bye' AND winner_id IS NOT NULL
  ) LOOP
    -- can't loop record into int; rewrite
    NULL;
  END LOOP;

  PERFORM advance_tournament_winner(m.id, m.winner_id)
  FROM tournament_matches m
  WHERE m.tournament_id = tournament_uuid AND m.round = 1 AND m.status = 'bye' AND m.winner_id IS NOT NULL;

  UPDATE tournaments SET status = 'in_progress', current_round = 1 WHERE id = tournament_uuid;
END;
$$;

-- Finalize tournament: set final_position for 1st/2nd/3rd and distribute rewards
CREATE OR REPLACE FUNCTION public.finalize_tournament(tournament_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_final RECORD;
  v_max_round int;
BEGIN
  SELECT MAX(round) INTO v_max_round FROM tournament_matches WHERE tournament_id = tournament_uuid;
  IF v_max_round IS NULL THEN RAISE EXCEPTION 'Sem partidas para finalizar'; END IF;

  SELECT * INTO v_final FROM tournament_matches
    WHERE tournament_id = tournament_uuid AND round = v_max_round
    LIMIT 1;

  IF v_final IS NULL OR v_final.status <> 'completed' OR v_final.winner_id IS NULL THEN
    RAISE EXCEPTION 'Final ainda não foi concluída';
  END IF;

  -- 1st = winner of final
  UPDATE tournament_participants SET final_position = 1
    WHERE id = v_final.winner_id AND tournament_id = tournament_uuid;

  -- 2nd = loser of final
  UPDATE tournament_participants SET final_position = 2
    WHERE tournament_id = tournament_uuid
      AND id IN (
        SELECT CASE WHEN v_final.player1_id = v_final.winner_id THEN v_final.player2_id ELSE v_final.player1_id END
      )
      AND id IS NOT NULL;

  -- 3rd = semifinal losers (if exists)
  IF v_max_round >= 2 THEN
    UPDATE tournament_participants SET final_position = 3
      WHERE tournament_id = tournament_uuid
        AND id IN (
          SELECT CASE WHEN m.player1_id = m.winner_id THEN m.player2_id ELSE m.player1_id END
          FROM tournament_matches m
          WHERE m.tournament_id = tournament_uuid
            AND m.round = v_max_round - 1
            AND m.status = 'completed'
            AND m.winner_id IS NOT NULL
        )
        AND final_position IS NULL;
  END IF;

  PERFORM distribute_tournament_rewards(tournament_uuid);

  UPDATE tournaments SET status = 'completed' WHERE id = tournament_uuid;
END;
$$;

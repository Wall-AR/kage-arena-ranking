
-- ============ CHALLENGES: novas colunas ============
ALTER TABLE public.challenges
  ADD COLUMN IF NOT EXISTS challenger_checked_in_at timestamptz,
  ADD COLUMN IF NOT EXISTS challenged_checked_in_at timestamptz,
  ADD COLUMN IF NOT EXISTS reported_by uuid REFERENCES public.players(id),
  ADD COLUMN IF NOT EXISTS reported_winner_id uuid REFERENCES public.players(id),
  ADD COLUMN IF NOT EXISTS reported_rounds jsonb,
  ADD COLUMN IF NOT EXISTS reported_notes text,
  ADD COLUMN IF NOT EXISTS reported_evidence_url text,
  ADD COLUMN IF NOT EXISTS reported_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS dispute_reason text,
  ADD COLUMN IF NOT EXISTS disputed_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_by uuid REFERENCES public.players(id),
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS match_id uuid REFERENCES public.matches(id) ON DELETE SET NULL;

-- Backfill: usar checked_in_at antigo
UPDATE public.challenges
SET challenger_checked_in_at = COALESCE(challenger_checked_in_at, checked_in_at)
WHERE checked_in_at IS NOT NULL AND challenger_checked_in_at IS NULL;

-- Prevenir auto-desafio
ALTER TABLE public.challenges DROP CONSTRAINT IF EXISTS challenges_no_self;
ALTER TABLE public.challenges ADD CONSTRAINT challenges_no_self CHECK (challenger_id <> challenged_id);

-- Bloquear duplicidade de desafios ativos entre o mesmo par
CREATE UNIQUE INDEX IF NOT EXISTS uq_challenges_active_pair
  ON public.challenges (LEAST(challenger_id, challenged_id), GREATEST(challenger_id, challenged_id))
  WHERE status IN ('pending','accepted','reported','disputed');

-- ============ MATCHES: corrigir RLS ============
DROP POLICY IF EXISTS "Moderadores podem registrar partidas" ON public.matches;
CREATE POLICY "Participantes ou moderadores registram partidas"
ON public.matches FOR INSERT TO authenticated
WITH CHECK (
  public.is_moderator(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.players p
    WHERE p.user_id = auth.uid()
      AND (p.id = matches.winner_id OR p.id = matches.loser_id)
  )
);

DROP POLICY IF EXISTS "Moderadores podem inserir mudanças de ranking" ON public.ranking_changes;
CREATE POLICY "Sistema/mod insere mudanças de ranking"
ON public.ranking_changes FOR INSERT TO authenticated
WITH CHECK (
  public.is_moderator(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.players p
    WHERE p.user_id = auth.uid() AND p.id = ranking_changes.player_id
  )
);

-- ============ HELPERS ============
CREATE OR REPLACE FUNCTION public.compute_rank_from_points(p_points int)
RETURNS varchar
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_points >= 1500 THEN 'Sanin'
    WHEN p_points >= 1000 THEN 'Anbu'
    WHEN p_points >= 600  THEN 'Jounnin'
    WHEN p_points >= 300  THEN 'Chunnin'
    WHEN p_points >= 0    THEN 'Genin'
    ELSE 'Genin'
  END::varchar;
$$;

CREATE OR REPLACE FUNCTION public.notify_user(p_user_id uuid, p_type text, p_title text, p_message text, p_data jsonb DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_user_id IS NULL THEN RETURN; END IF;
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data);
END;
$$;

-- ============ CHECK-IN ============
CREATE OR REPLACE FUNCTION public.challenge_check_in(p_challenge_id uuid)
RETURNS public.challenges
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE
  v_c public.challenges;
  v_player_id uuid;
  v_other_user uuid;
BEGIN
  SELECT id INTO v_player_id FROM public.players WHERE user_id = auth.uid();
  IF v_player_id IS NULL THEN RAISE EXCEPTION 'Usuário sem perfil de jogador'; END IF;

  SELECT * INTO v_c FROM public.challenges WHERE id = p_challenge_id FOR UPDATE;
  IF v_c IS NULL THEN RAISE EXCEPTION 'Desafio não encontrado'; END IF;
  IF v_c.status <> 'accepted' THEN RAISE EXCEPTION 'Desafio não está aceito'; END IF;

  IF v_player_id = v_c.challenger_id THEN
    UPDATE public.challenges SET challenger_checked_in_at = now() WHERE id = p_challenge_id RETURNING * INTO v_c;
    SELECT user_id INTO v_other_user FROM public.players WHERE id = v_c.challenged_id;
  ELSIF v_player_id = v_c.challenged_id THEN
    UPDATE public.challenges SET challenged_checked_in_at = now() WHERE id = p_challenge_id RETURNING * INTO v_c;
    SELECT user_id INTO v_other_user FROM public.players WHERE id = v_c.challenger_id;
  ELSE
    RAISE EXCEPTION 'Você não é participante deste desafio';
  END IF;

  PERFORM public.notify_user(v_other_user, 'challenge_checkin',
    'Oponente fez check-in', 'Seu oponente está pronto. Faça check-in para começar.',
    jsonb_build_object('challenge_id', p_challenge_id));

  RETURN v_c;
END;
$$;

-- ============ REPORTAR RESULTADO ============
CREATE OR REPLACE FUNCTION public.report_challenge_result(
  p_challenge_id uuid,
  p_winner_id uuid,
  p_rounds jsonb,
  p_notes text DEFAULT NULL,
  p_evidence_url text DEFAULT NULL
) RETURNS public.challenges
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE
  v_c public.challenges;
  v_player_id uuid;
  v_other_user uuid;
BEGIN
  SELECT id INTO v_player_id FROM public.players WHERE user_id = auth.uid();
  IF v_player_id IS NULL THEN RAISE EXCEPTION 'Usuário sem perfil'; END IF;

  SELECT * INTO v_c FROM public.challenges WHERE id = p_challenge_id FOR UPDATE;
  IF v_c IS NULL THEN RAISE EXCEPTION 'Desafio não encontrado'; END IF;
  IF v_c.status <> 'accepted' THEN RAISE EXCEPTION 'Desafio não está em andamento'; END IF;
  IF v_player_id NOT IN (v_c.challenger_id, v_c.challenged_id) THEN
    RAISE EXCEPTION 'Você não é participante deste desafio';
  END IF;
  IF v_c.challenger_checked_in_at IS NULL OR v_c.challenged_checked_in_at IS NULL THEN
    RAISE EXCEPTION 'Ambos os jogadores devem fazer check-in antes de reportar';
  END IF;
  IF p_winner_id NOT IN (v_c.challenger_id, v_c.challenged_id) THEN
    RAISE EXCEPTION 'Vencedor inválido';
  END IF;

  UPDATE public.challenges SET
    status = 'reported',
    reported_by = v_player_id,
    reported_winner_id = p_winner_id,
    reported_rounds = p_rounds,
    reported_notes = p_notes,
    reported_evidence_url = p_evidence_url,
    reported_at = now()
  WHERE id = p_challenge_id
  RETURNING * INTO v_c;

  -- Notificar o outro jogador
  SELECT user_id INTO v_other_user FROM public.players
   WHERE id = CASE WHEN v_player_id = v_c.challenger_id THEN v_c.challenged_id ELSE v_c.challenger_id END;
  PERFORM public.notify_user(v_other_user, 'challenge_reported',
    'Resultado reportado', 'Seu oponente reportou o resultado. Confirme ou conteste.',
    jsonb_build_object('challenge_id', p_challenge_id));

  RETURN v_c;
END;
$$;

-- ============ CONFIRMAR RESULTADO (cria match + atualiza pontos/rank) ============
CREATE OR REPLACE FUNCTION public.confirm_challenge_result(p_challenge_id uuid)
RETURNS public.matches
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE
  v_c public.challenges;
  v_player_id uuid;
  v_winner public.players;
  v_loser public.players;
  v_loser_id uuid;
  v_match public.matches;
  v_w_change int;
  v_l_change int;
  v_w_new_points int;
  v_l_new_points int;
  v_w_old_rank varchar;
  v_l_old_rank varchar;
  v_w_new_rank varchar;
  v_l_new_rank varchar;
  v_w_streak int;
BEGIN
  SELECT id INTO v_player_id FROM public.players WHERE user_id = auth.uid();
  IF v_player_id IS NULL THEN RAISE EXCEPTION 'Usuário sem perfil'; END IF;

  SELECT * INTO v_c FROM public.challenges WHERE id = p_challenge_id FOR UPDATE;
  IF v_c IS NULL THEN RAISE EXCEPTION 'Desafio não encontrado'; END IF;
  IF v_c.status <> 'reported' THEN RAISE EXCEPTION 'Resultado não está aguardando confirmação'; END IF;
  IF v_player_id = v_c.reported_by THEN
    RAISE EXCEPTION 'Quem reportou não pode confirmar — aguarde o oponente';
  END IF;
  IF v_player_id NOT IN (v_c.challenger_id, v_c.challenged_id) THEN
    RAISE EXCEPTION 'Você não é participante deste desafio';
  END IF;

  v_loser_id := CASE WHEN v_c.reported_winner_id = v_c.challenger_id THEN v_c.challenged_id ELSE v_c.challenger_id END;

  SELECT * INTO v_winner FROM public.players WHERE id = v_c.reported_winner_id FOR UPDATE;
  SELECT * INTO v_loser  FROM public.players WHERE id = v_loser_id FOR UPDATE;

  -- Cálculo simples (rank-aware)
  v_w_change := 25;
  v_l_change := -20;
  v_w_new_points := GREATEST(0, COALESCE(v_winner.current_points,0) + v_w_change);
  v_l_new_points := GREATEST(0, COALESCE(v_loser.current_points,0)  + v_l_change);

  v_w_old_rank := COALESCE(v_winner.rank, 'Unranked');
  v_l_old_rank := COALESCE(v_loser.rank, 'Unranked');
  v_w_new_rank := CASE WHEN v_winner.is_ranked THEN public.compute_rank_from_points(v_w_new_points) ELSE v_w_old_rank END;
  v_l_new_rank := CASE WHEN v_loser.is_ranked  THEN public.compute_rank_from_points(v_l_new_points) ELSE v_l_old_rank END;

  -- Cria a partida
  INSERT INTO public.matches (challenge_id, winner_id, loser_id, rounds_data, winner_points_change, loser_points_change, match_notes, evidence_url)
  VALUES (p_challenge_id, v_winner.id, v_loser.id, v_c.reported_rounds, v_w_change, v_l_change, v_c.reported_notes, v_c.reported_evidence_url)
  RETURNING * INTO v_match;

  v_w_streak := COALESCE(v_winner.win_streak,0) + 1;
  UPDATE public.players SET
    current_points = v_w_new_points,
    points = GREATEST(COALESCE(points,0), v_w_new_points),
    wins = COALESCE(wins,0) + 1,
    win_streak = v_w_streak,
    rank = v_w_new_rank,
    last_match_date = now()
  WHERE id = v_winner.id;

  UPDATE public.players SET
    current_points = v_l_new_points,
    losses = COALESCE(losses,0) + 1,
    win_streak = 0,
    rank = v_l_new_rank,
    last_match_date = now()
  WHERE id = v_loser.id;

  INSERT INTO public.ranking_changes (player_id, old_points, new_points, match_id, change_reason, old_rank, new_rank)
  VALUES
    (v_winner.id, v_winner.current_points, v_w_new_points, v_match.id, 'match_victory', v_w_old_rank, v_w_new_rank),
    (v_loser.id,  v_loser.current_points,  v_l_new_points, v_match.id, 'match_defeat',  v_l_old_rank, v_l_new_rank);

  UPDATE public.challenges SET status='completed', confirmed_at = now(), match_id = v_match.id
   WHERE id = p_challenge_id;

  -- Atualiza Kages
  PERFORM public.update_kage_titles();

  -- Notificações
  PERFORM public.notify_user((SELECT user_id FROM public.players WHERE id = v_winner.id),
    'match_confirmed', 'Vitória confirmada!', 'Sua vitória foi registrada. +' || v_w_change || ' pts.',
    jsonb_build_object('challenge_id', p_challenge_id, 'match_id', v_match.id));
  PERFORM public.notify_user((SELECT user_id FROM public.players WHERE id = v_loser.id),
    'match_confirmed', 'Derrota registrada', 'A partida foi confirmada. ' || v_l_change || ' pts.',
    jsonb_build_object('challenge_id', p_challenge_id, 'match_id', v_match.id));

  IF v_w_new_rank <> v_w_old_rank THEN
    PERFORM public.notify_user((SELECT user_id FROM public.players WHERE id = v_winner.id),
      'rank_change', 'Promoção de Rank!', 'Você agora é ' || v_w_new_rank || '.',
      jsonb_build_object('old', v_w_old_rank, 'new', v_w_new_rank));
  END IF;
  IF v_l_new_rank <> v_l_old_rank THEN
    PERFORM public.notify_user((SELECT user_id FROM public.players WHERE id = v_loser.id),
      'rank_change', 'Mudança de Rank', 'Seu rank agora é ' || v_l_new_rank || '.',
      jsonb_build_object('old', v_l_old_rank, 'new', v_l_new_rank));
  END IF;

  RETURN v_match;
END;
$$;

-- ============ CONTESTAR RESULTADO ============
CREATE OR REPLACE FUNCTION public.dispute_challenge_result(p_challenge_id uuid, p_reason text)
RETURNS public.challenges
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE
  v_c public.challenges;
  v_player_id uuid;
BEGIN
  SELECT id INTO v_player_id FROM public.players WHERE user_id = auth.uid();
  IF v_player_id IS NULL THEN RAISE EXCEPTION 'Usuário sem perfil'; END IF;
  SELECT * INTO v_c FROM public.challenges WHERE id = p_challenge_id FOR UPDATE;
  IF v_c IS NULL THEN RAISE EXCEPTION 'Desafio não encontrado'; END IF;
  IF v_c.status <> 'reported' THEN RAISE EXCEPTION 'Desafio não pode ser contestado neste estado'; END IF;
  IF v_player_id NOT IN (v_c.challenger_id, v_c.challenged_id) OR v_player_id = v_c.reported_by THEN
    RAISE EXCEPTION 'Apenas o oponente pode contestar';
  END IF;

  UPDATE public.challenges SET status='disputed', dispute_reason = p_reason, disputed_at = now()
   WHERE id = p_challenge_id RETURNING * INTO v_c;

  -- Notifica moderadores
  PERFORM public.notify_user(p.user_id, 'challenge_dispute',
    'Disputa de resultado', 'Há um desafio em disputa que precisa de revisão.',
    jsonb_build_object('challenge_id', p_challenge_id))
  FROM public.players p WHERE p.is_moderator = true OR p.is_admin = true;

  RETURN v_c;
END;
$$;

-- ============ CANCELAR ============
CREATE OR REPLACE FUNCTION public.cancel_challenge(p_challenge_id uuid)
RETURNS public.challenges
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE v_c public.challenges; v_player_id uuid; v_other uuid;
BEGIN
  SELECT id INTO v_player_id FROM public.players WHERE user_id = auth.uid();
  SELECT * INTO v_c FROM public.challenges WHERE id = p_challenge_id FOR UPDATE;
  IF v_c IS NULL THEN RAISE EXCEPTION 'Desafio não encontrado'; END IF;
  IF v_c.status NOT IN ('pending','accepted') THEN RAISE EXCEPTION 'Não pode cancelar agora'; END IF;
  IF v_player_id NOT IN (v_c.challenger_id, v_c.challenged_id) THEN RAISE EXCEPTION 'Sem permissão'; END IF;

  UPDATE public.challenges SET status='cancelled', cancelled_by=v_player_id, cancelled_at=now()
   WHERE id=p_challenge_id RETURNING * INTO v_c;

  SELECT user_id INTO v_other FROM public.players
   WHERE id = CASE WHEN v_player_id = v_c.challenger_id THEN v_c.challenged_id ELSE v_c.challenger_id END;
  PERFORM public.notify_user(v_other, 'challenge_cancelled', 'Desafio cancelado',
    'O outro jogador cancelou o desafio.', jsonb_build_object('challenge_id', p_challenge_id));
  RETURN v_c;
END;
$$;

-- ============ EXPIRAR (chamável por qualquer cliente; é seguro pois só muda status de vencidos) ============
CREATE OR REPLACE FUNCTION public.expire_old_challenges()
RETURNS int
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE v_count int;
BEGIN
  WITH upd AS (
    UPDATE public.challenges
       SET status = 'expired'
     WHERE status = 'pending' AND expires_at < now()
     RETURNING id
  ) SELECT count(*) INTO v_count FROM upd;
  RETURN v_count;
END;
$$;

-- ============ GRANTS para chamada via PostgREST ============
GRANT EXECUTE ON FUNCTION public.challenge_check_in(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_challenge_result(uuid, uuid, jsonb, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_challenge_result(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.dispute_challenge_result(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_challenge(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_old_challenges() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.compute_rank_from_points(int) TO authenticated, anon;

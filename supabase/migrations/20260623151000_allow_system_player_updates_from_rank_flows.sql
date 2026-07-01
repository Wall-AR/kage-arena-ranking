create or replace function public.update_kage_titles()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  top_player record;
  kage_titles text[] := array['Hokage', 'Kazekage', 'Mizukage', 'Raikage', 'Tsuchikage'];
  counter integer := 1;
begin
  perform set_config('app.kage_system_update', 'on', true);

  update public.players
  set kage_title = null;

  for top_player in
    select id
    from public.players
    where is_ranked = true
      and user_id is not null
    order by current_points desc, wins desc, losses asc, created_at asc
    limit 5
  loop
    update public.players
    set kage_title = kage_titles[counter]
    where id = top_player.id;

    counter := counter + 1;
  end loop;
end;
$$;

create or replace function public.set_initial_admin(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not exists (select 1 from public.players where is_admin = true) then
    perform set_config('app.kage_system_update', 'on', true);

    update public.players
    set is_admin = true,
        is_moderator = true,
        role = 'admin'
    where user_id = target_user_id;
  end if;
end;
$$;

create or replace function public.confirm_challenge_result(p_challenge_id uuid)
returns public.matches
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
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
begin
  select id
  into v_player_id
  from public.players
  where user_id = auth.uid();

  if v_player_id is null then
    raise exception 'Usuario sem perfil';
  end if;

  select *
  into v_c
  from public.challenges
  where id = p_challenge_id
  for update;

  if v_c.id is null then
    raise exception 'Desafio nao encontrado';
  end if;

  if v_c.status <> 'reported' then
    raise exception 'Resultado nao esta aguardando confirmacao';
  end if;

  if v_player_id = v_c.reported_by then
    raise exception 'Quem reportou nao pode confirmar; aguarde o oponente';
  end if;

  if v_player_id not in (v_c.challenger_id, v_c.challenged_id) then
    raise exception 'Voce nao e participante deste desafio';
  end if;

  if v_c.reported_winner_id not in (v_c.challenger_id, v_c.challenged_id) then
    raise exception 'Vencedor reportado invalido';
  end if;

  v_loser_id := case
    when v_c.reported_winner_id = v_c.challenger_id then v_c.challenged_id
    else v_c.challenger_id
  end;

  select *
  into v_winner
  from public.players
  where id = v_c.reported_winner_id
  for update;

  select *
  into v_loser
  from public.players
  where id = v_loser_id
  for update;

  if coalesce(v_winner.is_ranked, false) is not true or coalesce(v_loser.is_ranked, false) is not true then
    raise exception 'Apenas jogadores rankeados podem confirmar partidas valendo pontos';
  end if;

  perform set_config('app.kage_system_update', 'on', true);

  v_w_change := 25;
  v_l_change := -20;
  v_w_new_points := greatest(0, coalesce(v_winner.current_points, 0) + v_w_change);
  v_l_new_points := greatest(0, coalesce(v_loser.current_points, 0) + v_l_change);

  v_w_old_rank := coalesce(v_winner.rank, 'Unranked');
  v_l_old_rank := coalesce(v_loser.rank, 'Unranked');
  v_w_new_rank := public.compute_rank_from_points(v_w_new_points);
  v_l_new_rank := public.compute_rank_from_points(v_l_new_points);

  insert into public.matches (
    challenge_id,
    winner_id,
    loser_id,
    rounds_data,
    winner_points_change,
    loser_points_change,
    match_notes,
    evidence_url
  )
  values (
    p_challenge_id,
    v_winner.id,
    v_loser.id,
    v_c.reported_rounds,
    v_w_change,
    v_l_change,
    v_c.reported_notes,
    v_c.reported_evidence_url
  )
  returning * into v_match;

  v_w_streak := coalesce(v_winner.win_streak, 0) + 1;

  update public.players
  set current_points = v_w_new_points,
      points = greatest(coalesce(points, 0), v_w_new_points),
      wins = coalesce(wins, 0) + 1,
      win_streak = v_w_streak,
      rank = v_w_new_rank,
      rank_level = v_w_new_rank,
      last_match_date = now()
  where id = v_winner.id;

  update public.players
  set current_points = v_l_new_points,
      losses = coalesce(losses, 0) + 1,
      win_streak = 0,
      rank = v_l_new_rank,
      rank_level = v_l_new_rank,
      last_match_date = now()
  where id = v_loser.id;

  insert into public.ranking_changes (
    player_id,
    old_points,
    new_points,
    match_id,
    change_reason,
    old_rank,
    new_rank
  )
  values
    (v_winner.id, v_winner.current_points, v_w_new_points, v_match.id, 'match_victory', v_w_old_rank, v_w_new_rank),
    (v_loser.id, v_loser.current_points, v_l_new_points, v_match.id, 'match_defeat', v_l_old_rank, v_l_new_rank);

  update public.challenges
  set status = 'completed',
      confirmed_at = now(),
      match_id = v_match.id
  where id = p_challenge_id;

  perform public.update_kage_titles();

  perform public.notify_user(
    (select user_id from public.players where id = v_winner.id),
    'match_confirmed',
    'Vitoria confirmada!',
    'Sua vitoria foi registrada. +' || v_w_change || ' pts.',
    jsonb_build_object('challenge_id', p_challenge_id, 'match_id', v_match.id)
  );

  perform public.notify_user(
    (select user_id from public.players where id = v_loser.id),
    'match_confirmed',
    'Derrota registrada',
    'A partida foi confirmada. ' || v_l_change || ' pts.',
    jsonb_build_object('challenge_id', p_challenge_id, 'match_id', v_match.id)
  );

  if v_w_new_rank <> v_w_old_rank then
    perform public.notify_user(
      (select user_id from public.players where id = v_winner.id),
      'rank_change',
      'Promocao de Rank!',
      'Voce agora e ' || v_w_new_rank || '.',
      jsonb_build_object('old', v_w_old_rank, 'new', v_w_new_rank)
    );
  end if;

  if v_l_new_rank <> v_l_old_rank then
    perform public.notify_user(
      (select user_id from public.players where id = v_loser.id),
      'rank_change',
      'Mudanca de Rank',
      'Seu rank agora e ' || v_l_new_rank || '.',
      jsonb_build_object('old', v_l_old_rank, 'new', v_l_new_rank)
    );
  end if;

  return v_match;
end;
$$;

create or replace function public.distribute_tournament_rewards(tournament_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  participant record;
  reward record;
  v_new_points int;
begin
  perform set_config('app.kage_system_update', 'on', true);

  for participant in
    select tp.player_id, tp.final_position
    from public.tournament_participants tp
    where tp.tournament_id = tournament_uuid
      and tp.final_position is not null
  loop
    for reward in
      select *
      from public.tournament_rewards
      where tournament_id = tournament_uuid
        and position = participant.final_position
    loop
      if coalesce(reward.points_reward, 0) > 0 then
        select greatest(0, coalesce(current_points, 0) + reward.points_reward)
        into v_new_points
        from public.players
        where id = participant.player_id;

        update public.players
        set current_points = v_new_points,
            points = greatest(coalesce(points, 0), v_new_points),
            rank = public.compute_rank_from_points(v_new_points),
            rank_level = public.compute_rank_from_points(v_new_points)
        where id = participant.player_id
          and is_ranked = true;
      end if;

      if reward.banner_id is not null then
        insert into public.player_banners (player_id, banner_id)
        values (participant.player_id, reward.banner_id)
        on conflict do nothing;
      end if;

      if reward.achievement_id is not null then
        insert into public.player_achievements (player_id, achievement_id)
        values (participant.player_id, reward.achievement_id)
        on conflict do nothing;
      end if;
    end loop;
  end loop;

  perform public.update_kage_titles();
end;
$$;

grant execute on function public.update_kage_titles() to authenticated;
grant execute on function public.confirm_challenge_result(uuid) to authenticated;
grant execute on function public.distribute_tournament_rewards(uuid) to authenticated;

notify pgrst, 'reload schema';

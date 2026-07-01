-- Balance ranked points and add moderator-approved tournament requests.

create or replace function public.get_rank_floor(rank_name varchar)
returns integer
language sql
immutable
set search_path = public, pg_temp
as $$
  select case lower(regexp_replace(trim(coalesce(rank_name, '')), '\s+', '', 'g'))
    when 'genin' then 100
    when 'chunin' then 250
    when 'chunnin' then 250
    when 'jounin' then 450
    when 'jounnin' then 450
    when 'anbu' then 700
    when 'sannin' then 1000
    when 'sanin' then 1000
    else 0
  end;
$$;

create or replace function public.get_rank_weight(rank_name varchar)
returns integer
language sql
immutable
set search_path = public, pg_temp
as $$
  select case lower(regexp_replace(trim(coalesce(rank_name, '')), '\s+', '', 'g'))
    when 'genin' then 1
    when 'chunin' then 2
    when 'chunnin' then 2
    when 'jounin' then 3
    when 'jounnin' then 3
    when 'anbu' then 4
    when 'sannin' then 5
    when 'sanin' then 5
    when 'kage' then 6
    else 0
  end;
$$;

create or replace function public.get_initial_points_for_rank(rank_name varchar)
returns integer
language sql
immutable
set search_path = public, pg_temp
as $$
  select public.get_rank_floor(rank_name);
$$;

create or replace function public.compute_rank_from_points(p_points int)
returns varchar
language sql
immutable
set search_path = public, pg_temp
as $$
  select case
    when coalesce(p_points, 0) >= 1000 then 'Sannin'
    when coalesce(p_points, 0) >= 700 then 'Anbu'
    when coalesce(p_points, 0) >= 450 then 'Jounin'
    when coalesce(p_points, 0) >= 250 then 'Chunin'
    when coalesce(p_points, 0) >= 100 then 'Genin'
    else 'Unranked'
  end::varchar;
$$;

create or replace function public.calculate_match_point_delta(
  p_winner_points int,
  p_loser_points int,
  p_recent_pair_matches int default 0
)
returns jsonb
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  v_expected numeric;
  v_multiplier numeric := 1.0;
  v_winner_gain int;
  v_loser_loss int;
begin
  v_expected := 1 / (1 + power(10::numeric, ((coalesce(p_loser_points, 0) - coalesce(p_winner_points, 0))::numeric / 400)));

  v_winner_gain := greatest(12, least(56, round(12 + (44 * (1 - v_expected)))::int));
  v_loser_loss := greatest(8, least(48, round(8 + (40 * (1 - v_expected)))::int));

  if coalesce(p_recent_pair_matches, 0) >= 4 then
    v_multiplier := 0.35;
  elsif coalesce(p_recent_pair_matches, 0) >= 2 then
    v_multiplier := 0.60;
  end if;

  v_winner_gain := greatest(4, round(v_winner_gain * v_multiplier)::int);
  v_loser_loss := greatest(2, round(v_loser_loss * v_multiplier)::int);

  return jsonb_build_object(
    'winner_points', v_winner_gain,
    'loser_points', -v_loser_loss,
    'expected_winner_score', round(v_expected, 4),
    'repeat_multiplier', v_multiplier
  );
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
  v_delta jsonb;
  v_recent_pair_matches int;
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

  select count(*)
  into v_recent_pair_matches
  from public.matches m
  where m.played_at >= now() - interval '7 days'
    and (
      (m.winner_id = v_winner.id and m.loser_id = v_loser.id)
      or (m.winner_id = v_loser.id and m.loser_id = v_winner.id)
    );

  v_delta := public.calculate_match_point_delta(
    coalesce(v_winner.current_points, 0),
    coalesce(v_loser.current_points, 0),
    v_recent_pair_matches
  );

  v_w_change := (v_delta ->> 'winner_points')::int;
  v_l_change := (v_delta ->> 'loser_points')::int;
  v_w_new_points := greatest(public.get_rank_floor('Genin'), coalesce(v_winner.current_points, 0) + v_w_change);
  v_l_new_points := greatest(public.get_rank_floor('Genin'), coalesce(v_loser.current_points, 0) + v_l_change);

  v_w_old_rank := coalesce(v_winner.rank, 'Unranked');
  v_l_old_rank := coalesce(v_loser.rank, 'Unranked');
  v_w_new_rank := public.compute_rank_from_points(v_w_new_points);
  v_l_new_rank := public.compute_rank_from_points(v_l_new_points);

  perform set_config('app.kage_system_update', 'on', true);

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
    v_winner.user_id,
    'match_confirmed',
    'Vitoria confirmada!',
    'Sua vitoria foi registrada. +' || v_w_change || ' pts.',
    jsonb_build_object('challenge_id', p_challenge_id, 'match_id', v_match.id, 'balance', v_delta)
  );

  perform public.notify_user(
    v_loser.user_id,
    'match_confirmed',
    'Derrota registrada',
    'A partida foi confirmada. ' || v_l_change || ' pts.',
    jsonb_build_object('challenge_id', p_challenge_id, 'match_id', v_match.id, 'balance', v_delta)
  );

  if v_w_new_rank <> v_w_old_rank then
    perform public.notify_user(
      v_winner.user_id,
      'rank_change',
      'Promocao de Rank!',
      'Voce agora e ' || v_w_new_rank || '.',
      jsonb_build_object('old', v_w_old_rank, 'new', v_w_new_rank)
    );
  end if;

  if v_l_new_rank <> v_l_old_rank then
    perform public.notify_user(
      v_loser.user_id,
      'rank_change',
      'Mudanca de Rank',
      'Seu rank agora e ' || v_l_new_rank || '.',
      jsonb_build_object('old', v_l_old_rank, 'new', v_l_new_rank)
    );
  end if;

  return v_match;
end;
$$;

alter table public.tournament_matches
  add column if not exists player1_character text,
  add column if not exists player2_character text;

drop index if exists public.idx_one_active_tournament_per_creator;
create unique index idx_one_active_tournament_per_creator
  on public.tournaments(created_by)
  where created_by is not null
    and status in ('pending_approval', 'registration', 'check_in', 'in_progress', 'active', 'ongoing');

alter table public.tournaments
  drop constraint if exists tournaments_status_check,
  add constraint tournaments_status_check
  check (status in (
    'pending_approval',
    'registration',
    'check_in',
    'in_progress',
    'completed',
    'cancelled',
    'rejected',
    'active',
    'ongoing'
  ));

create or replace function public.create_tournament_request(
  p_name text,
  p_description text,
  p_image_url text,
  p_tournament_type text,
  p_max_participants integer,
  p_registration_start timestamptz,
  p_registration_end timestamptz,
  p_tournament_start timestamptz,
  p_check_in_start timestamptz,
  p_check_in_end timestamptz,
  p_min_rank text,
  p_max_rank text,
  p_require_top_character boolean,
  p_required_character text,
  p_rules_text text
)
returns public.tournaments
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_creator uuid := auth.uid();
  v_tournament public.tournaments;
  v_status text;
  v_check_in_start timestamptz;
  v_check_in_end timestamptz;
  v_min_rank text := nullif(trim(coalesce(p_min_rank, '')), '');
  v_max_rank text := nullif(trim(coalesce(p_max_rank, '')), '');
  v_moderator record;
begin
  if v_creator is null then
    raise exception 'Login necessario para criar torneio';
  end if;

  if length(trim(coalesce(p_name, ''))) < 3 then
    raise exception 'Nome do torneio deve ter pelo menos 3 caracteres';
  end if;

  if coalesce(p_max_participants, 0) not in (8, 16, 32, 64) then
    raise exception 'Quantidade de participantes invalida';
  end if;

  if p_registration_start is null or p_registration_end is null or p_tournament_start is null then
    raise exception 'Datas de inscricao e inicio sao obrigatorias';
  end if;

  if p_registration_end <= p_registration_start then
    raise exception 'Fim das inscricoes precisa ser depois do inicio';
  end if;

  if p_tournament_start <= p_registration_end then
    raise exception 'Inicio do torneio precisa ser depois do fim das inscricoes';
  end if;

  v_check_in_start := p_check_in_start;
  v_check_in_end := p_check_in_end;

  if v_check_in_start is null and v_check_in_end is null then
    v_check_in_start := greatest(p_registration_end, p_tournament_start - interval '30 minutes');
    v_check_in_end := p_tournament_start;
  end if;

  if (v_check_in_start is null) <> (v_check_in_end is null) then
    raise exception 'Informe inicio e fim do check-in';
  end if;

  if v_check_in_start is not null then
    if v_check_in_end <= v_check_in_start then
      raise exception 'Fim do check-in precisa ser depois do inicio';
    end if;

    if v_check_in_end > p_tournament_start then
      raise exception 'Check-in deve terminar ate o inicio do torneio';
    end if;
  end if;

  if public.get_rank_weight(v_min_rank) > 0
    and public.get_rank_weight(v_max_rank) > 0
    and public.get_rank_weight(v_min_rank) > public.get_rank_weight(v_max_rank)
  then
    raise exception 'Rank minimo nao pode ser maior que rank maximo';
  end if;

  if exists (
    select 1
    from public.tournaments t
    where t.created_by = v_creator
      and t.status in ('pending_approval', 'registration', 'check_in', 'in_progress', 'active', 'ongoing')
  ) then
    raise exception 'Voce ja tem um torneio ativo ou aguardando aprovacao';
  end if;

  v_status := case
    when public.is_moderator(v_creator) then 'registration'
    else 'pending_approval'
  end;

  insert into public.tournaments (
    name,
    description,
    image_url,
    tournament_type,
    max_participants,
    registration_start,
    registration_end,
    tournament_start,
    check_in_start,
    check_in_end,
    min_rank,
    max_rank,
    require_top_character,
    required_character,
    rules_text,
    created_by,
    status
  )
  values (
    trim(p_name),
    nullif(trim(coalesce(p_description, '')), ''),
    nullif(trim(coalesce(p_image_url, '')), ''),
    coalesce(nullif(trim(p_tournament_type), ''), 'single_elimination'),
    p_max_participants,
    p_registration_start,
    p_registration_end,
    p_tournament_start,
    v_check_in_start,
    v_check_in_end,
    v_min_rank,
    v_max_rank,
    coalesce(p_require_top_character, false),
    case when coalesce(p_require_top_character, false) then nullif(trim(coalesce(p_required_character, '')), '') else null end,
    nullif(trim(coalesce(p_rules_text, '')), ''),
    v_creator,
    v_status
  )
  returning * into v_tournament;

  if v_status = 'pending_approval' then
    for v_moderator in
      select p.user_id
      from public.players p
      where (p.is_moderator = true or p.is_admin = true)
        and p.user_id is not null
    loop
      perform public.notify_user(
        v_moderator.user_id,
        'tournament_approval',
        'Novo torneio aguardando aprovacao',
        'Um jogador enviou o torneio "' || v_tournament.name || '" para analise.',
        jsonb_build_object('tournament_id', v_tournament.id)
      );
    end loop;
  end if;

  return v_tournament;
end;
$$;

create or replace function public.approve_tournament(p_tournament_id uuid)
returns public.tournaments
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_tournament public.tournaments;
begin
  if not public.is_moderator(auth.uid()) then
    raise exception 'Apenas moderadores podem aprovar torneios';
  end if;

  select *
  into v_tournament
  from public.tournaments
  where id = p_tournament_id
  for update;

  if v_tournament.id is null then
    raise exception 'Torneio nao encontrado';
  end if;

  if v_tournament.status <> 'pending_approval' then
    raise exception 'Este torneio nao esta aguardando aprovacao';
  end if;

  update public.tournaments
  set status = 'registration'
  where id = p_tournament_id
  returning * into v_tournament;

  perform public.notify_user(
    v_tournament.created_by,
    'tournament_approved',
    'Torneio aprovado!',
    'Seu torneio "' || v_tournament.name || '" foi aprovado e abriu inscricoes.',
    jsonb_build_object('tournament_id', v_tournament.id)
  );

  return v_tournament;
end;
$$;

create or replace function public.reject_tournament(p_tournament_id uuid, p_reason text default null)
returns public.tournaments
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_tournament public.tournaments;
begin
  if not public.is_moderator(auth.uid()) then
    raise exception 'Apenas moderadores podem recusar torneios';
  end if;

  select *
  into v_tournament
  from public.tournaments
  where id = p_tournament_id
  for update;

  if v_tournament.id is null then
    raise exception 'Torneio nao encontrado';
  end if;

  if v_tournament.status not in ('pending_approval', 'registration') then
    raise exception 'Este torneio nao pode ser recusado neste status';
  end if;

  update public.tournaments
  set status = 'rejected'
  where id = p_tournament_id
  returning * into v_tournament;

  perform public.notify_user(
    v_tournament.created_by,
    'tournament_rejected',
    'Torneio recusado',
    'Seu torneio "' || v_tournament.name || '" foi recusado.' ||
      case when nullif(trim(coalesce(p_reason, '')), '') is not null then ' Motivo: ' || trim(p_reason) else '' end,
    jsonb_build_object('tournament_id', v_tournament.id, 'reason', p_reason)
  );

  return v_tournament;
end;
$$;

create or replace function public.validate_tournament_registration()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_tournament public.tournaments;
  v_player public.players;
  v_participant_count int;
  v_player_weight int;
begin
  select *
  into v_tournament
  from public.tournaments
  where id = new.tournament_id
  for update;

  if v_tournament.id is null then
    raise exception 'Torneio nao encontrado';
  end if;

  select *
  into v_player
  from public.players
  where id = new.player_id;

  if v_player.id is null then
    raise exception 'Jogador nao encontrado';
  end if;

  if auth.uid() is not null and not public.is_moderator(auth.uid()) and v_player.user_id <> auth.uid() then
    raise exception 'Voce so pode inscrever seu proprio jogador';
  end if;

  if coalesce(v_player.is_ranked, false) is not true then
    raise exception 'Apenas jogadores avaliados e rankeados podem entrar em torneios';
  end if;

  if v_tournament.status <> 'registration' then
    raise exception 'Inscricoes nao estao abertas para este torneio';
  end if;

  if now() < v_tournament.registration_start or now() > v_tournament.registration_end then
    raise exception 'Fora do periodo de inscricoes';
  end if;

  select count(*)
  into v_participant_count
  from public.tournament_participants tp
  where tp.tournament_id = new.tournament_id;

  if v_participant_count >= coalesce(v_tournament.max_participants, 32) then
    raise exception 'Torneio ja esta cheio';
  end if;

  v_player_weight := public.get_rank_weight(v_player.rank);
  if v_player.kage_title is not null then
    v_player_weight := greatest(v_player_weight, public.get_rank_weight('Kage'));
  end if;

  if public.get_rank_weight(v_tournament.min_rank) > 0
    and v_player_weight < public.get_rank_weight(v_tournament.min_rank)
  then
    raise exception 'Seu rank esta abaixo do minimo exigido';
  end if;

  if public.get_rank_weight(v_tournament.max_rank) > 0
    and v_player_weight > public.get_rank_weight(v_tournament.max_rank)
  then
    raise exception 'Seu rank esta acima do maximo permitido';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_tournament_registration on public.tournament_participants;
create trigger trg_validate_tournament_registration
before insert on public.tournament_participants
for each row execute function public.validate_tournament_registration();

create or replace function public.validate_tournament_check_in()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_tournament public.tournaments;
begin
  if coalesce(new.checked_in, false) is not true or coalesce(old.checked_in, false) is true then
    return new;
  end if;

  select *
  into v_tournament
  from public.tournaments
  where id = new.tournament_id;

  if v_tournament.status <> 'check_in' and not public.is_moderator(auth.uid()) then
    raise exception 'Check-in ainda nao esta aberto';
  end if;

  if not public.is_moderator(auth.uid()) then
    if v_tournament.check_in_start is null or v_tournament.check_in_end is null then
      raise exception 'Este torneio nao possui janela de check-in';
    end if;

    if now() < v_tournament.check_in_start or now() > v_tournament.check_in_end then
      raise exception 'Fora do periodo de check-in';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_tournament_check_in on public.tournament_participants;
create trigger trg_validate_tournament_check_in
before update of checked_in on public.tournament_participants
for each row execute function public.validate_tournament_check_in();

drop policy if exists "Tournaments visible" on public.tournaments;
drop policy if exists "Torneios sao visiveis por todos" on public.tournaments;
drop policy if exists "Torneios são visíveis por todos" on public.tournaments;

create policy "Tournaments visible"
on public.tournaments
for select
using (
  status not in ('pending_approval', 'rejected')
  or created_by = auth.uid()
  or public.is_moderator(auth.uid())
);

update public.players
set rank = public.compute_rank_from_points(current_points),
    rank_level = public.compute_rank_from_points(current_points)
where is_ranked = true
  and (
    rank is distinct from public.compute_rank_from_points(current_points)
    or rank_level is distinct from public.compute_rank_from_points(current_points)
  );

select public.update_kage_titles();

grant execute on function public.get_rank_floor(varchar) to anon, authenticated;
grant execute on function public.get_rank_weight(varchar) to anon, authenticated;
grant execute on function public.get_initial_points_for_rank(varchar) to authenticated;
grant execute on function public.compute_rank_from_points(integer) to anon, authenticated;
grant execute on function public.calculate_match_point_delta(integer, integer, integer) to anon, authenticated;
grant execute on function public.create_tournament_request(
  text, text, text, text, integer, timestamptz, timestamptz, timestamptz,
  timestamptz, timestamptz, text, text, boolean, text, text
) to authenticated;
grant execute on function public.approve_tournament(uuid) to authenticated;
grant execute on function public.reject_tournament(uuid, text) to authenticated;
grant execute on function public.confirm_challenge_result(uuid) to authenticated;

notify pgrst, 'reload schema';

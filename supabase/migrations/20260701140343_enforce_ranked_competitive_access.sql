-- Keep newly registered, unranked accounts out of competitive flows until
-- a moderator publishes their evaluation result.

drop policy if exists "Players create challenges" on public.challenges;
create policy "Players create challenges"
on public.challenges
for insert
to authenticated
with check (
  challenger_id <> challenged_id
  and coalesce(status, 'pending') = 'pending'
  and exists (
    select 1
    from public.players p
    where p.id = challenges.challenger_id
      and p.user_id = (select auth.uid())
      and coalesce(p.is_ranked, false) is true
  )
  and exists (
    select 1
    from public.players p
    where p.id = challenges.challenged_id
      and coalesce(p.is_ranked, false) is true
  )
);

drop policy if exists "Participants or mods insert matches" on public.matches;
create policy "Participants or mods insert matches"
on public.matches
for insert
to authenticated
with check (
  public.is_moderator((select auth.uid()))
  or (
    winner_id <> loser_id
    and exists (
      select 1
      from public.players actor
      where actor.user_id = (select auth.uid())
        and actor.id in (matches.winner_id, matches.loser_id)
        and coalesce(actor.is_ranked, false) is true
    )
    and exists (
      select 1
      from public.players winner
      where winner.id = matches.winner_id
        and coalesce(winner.is_ranked, false) is true
    )
    and exists (
      select 1
      from public.players loser
      where loser.id = matches.loser_id
        and coalesce(loser.is_ranked, false) is true
    )
  )
);

drop policy if exists "Players register tournament" on public.tournament_participants;
create policy "Players register tournament"
on public.tournament_participants
for insert
to authenticated
with check (
  exists (
    select 1
    from public.players p
    where p.id = tournament_participants.player_id
      and p.user_id = (select auth.uid())
      and coalesce(p.is_ranked, false) is true
  )
);

create or replace function public.challenge_check_in(p_challenge_id uuid)
returns public.challenges
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_c public.challenges;
  v_player_id uuid;
  v_other_user uuid;
begin
  select id into v_player_id from public.players where user_id = auth.uid();
  if v_player_id is null then raise exception 'Usuario sem perfil de jogador'; end if;

  select * into v_c from public.challenges where id = p_challenge_id for update;
  if not found then raise exception 'Desafio nao encontrado'; end if;

  if not exists (
    select 1
    from public.players challenger
    join public.players challenged on challenged.id = v_c.challenged_id
    where challenger.id = v_c.challenger_id
      and coalesce(challenger.is_ranked, false) is true
      and coalesce(challenged.is_ranked, false) is true
  ) then
    raise exception 'Apenas jogadores avaliados e rankeados podem iniciar desafios';
  end if;

  if v_c.status <> 'accepted' then raise exception 'Desafio nao esta aceito'; end if;

  if v_player_id = v_c.challenger_id then
    update public.challenges set challenger_checked_in_at = now() where id = p_challenge_id returning * into v_c;
    select user_id into v_other_user from public.players where id = v_c.challenged_id;
  elsif v_player_id = v_c.challenged_id then
    update public.challenges set challenged_checked_in_at = now() where id = p_challenge_id returning * into v_c;
    select user_id into v_other_user from public.players where id = v_c.challenger_id;
  else
    raise exception 'Voce nao e participante deste desafio';
  end if;

  perform public.notify_user(
    v_other_user,
    'challenge_checkin',
    'Oponente fez check-in',
    'Seu oponente esta pronto. Faca check-in para comecar.',
    jsonb_build_object('challenge_id', p_challenge_id)
  );

  return v_c;
end;
$$;

create or replace function public.report_challenge_result(
  p_challenge_id uuid,
  p_winner_id uuid,
  p_rounds jsonb,
  p_notes text default null,
  p_evidence_url text default null
)
returns public.challenges
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_c public.challenges;
  v_player_id uuid;
  v_other_user uuid;
begin
  select id into v_player_id from public.players where user_id = auth.uid();
  if v_player_id is null then raise exception 'Usuario sem perfil'; end if;

  select * into v_c from public.challenges where id = p_challenge_id for update;
  if not found then raise exception 'Desafio nao encontrado'; end if;

  if not exists (
    select 1
    from public.players challenger
    join public.players challenged on challenged.id = v_c.challenged_id
    where challenger.id = v_c.challenger_id
      and coalesce(challenger.is_ranked, false) is true
      and coalesce(challenged.is_ranked, false) is true
  ) then
    raise exception 'Apenas jogadores avaliados e rankeados podem reportar partidas';
  end if;

  if v_c.status <> 'accepted' then raise exception 'Desafio nao esta em andamento'; end if;
  if v_player_id not in (v_c.challenger_id, v_c.challenged_id) then raise exception 'Voce nao e participante deste desafio'; end if;
  if v_c.challenger_checked_in_at is null or v_c.challenged_checked_in_at is null then raise exception 'Ambos os jogadores devem fazer check-in antes de reportar'; end if;
  if p_winner_id not in (v_c.challenger_id, v_c.challenged_id) then raise exception 'Vencedor invalido'; end if;

  update public.challenges
  set status = 'reported',
      reported_by = v_player_id,
      reported_winner_id = p_winner_id,
      reported_rounds = p_rounds,
      reported_notes = p_notes,
      reported_evidence_url = p_evidence_url,
      reported_at = now()
  where id = p_challenge_id
  returning * into v_c;

  select user_id into v_other_user
  from public.players
  where id = case when v_player_id = v_c.challenger_id then v_c.challenged_id else v_c.challenger_id end;

  perform public.notify_user(
    v_other_user,
    'challenge_reported',
    'Resultado reportado',
    'Seu oponente reportou o resultado. Confirme ou conteste.',
    jsonb_build_object('challenge_id', p_challenge_id)
  );

  return v_c;
end;
$$;

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
  v_creator_profile public.players;
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

  select * into v_creator_profile from public.ensure_player_profile();

  if not (coalesce(v_creator_profile.is_moderator, false) or coalesce(v_creator_profile.is_admin, false))
    and coalesce(v_creator_profile.is_ranked, false) is not true
  then
    raise exception 'Solicite e conclua sua avaliacao antes de criar torneios';
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
    when coalesce(v_creator_profile.is_moderator, false) or coalesce(v_creator_profile.is_admin, false) then 'registration'
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

notify pgrst, 'reload schema';

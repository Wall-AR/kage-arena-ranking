create unique index if not exists uq_evaluations_one_active_per_player
on public.evaluations (player_id)
where status in ('pending', 'accepted');

create unique index if not exists uq_evaluation_results_evaluation_id
on public.evaluation_results (evaluation_id);

create index if not exists idx_evaluations_player_status_created
on public.evaluations (player_id, status, created_at desc);

create index if not exists idx_evaluations_evaluator_status_created
on public.evaluations (evaluator_id, status, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_name text;
begin
  v_name := nullif(trim(coalesce(
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'full_name',
    split_part(new.email, '@', 1),
    'Ninja'
  )), '');

  insert into public.players (
    user_id,
    name,
    rank,
    rank_level,
    points,
    current_points,
    wins,
    losses,
    win_streak,
    is_ranked,
    is_admin,
    is_moderator,
    role,
    ninja_phrase,
    favorite_characters,
    selected_achievements,
    privacy_settings
  )
  values (
    new.id,
    coalesce(v_name, 'Ninja'),
    'Unranked',
    'Unranked',
    0,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    'player',
    'Novo ninja em treinamento.',
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.protect_player_integrity()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_is_admin boolean;
begin
  if auth.uid() is null or current_setting('app.kage_system_update', true) = 'on' then
    return new;
  end if;

  select coalesce(p.is_admin, false)
  into v_is_admin
  from public.players p
  where p.user_id = auth.uid()
  limit 1;

  if tg_op = 'INSERT' then
    if new.user_id is distinct from auth.uid() and coalesce(v_is_admin, false) is not true then
      raise exception 'Sem permissao para criar perfil para outro usuario';
    end if;

    new.rank := 'Unranked';
    new.rank_level := 'Unranked';
    new.points := 0;
    new.current_points := 0;
    new.wins := 0;
    new.losses := 0;
    new.win_streak := 0;
    new.is_ranked := false;
    new.is_admin := false;
    new.is_moderator := false;
    new.role := 'player';
    new.kage_title := null;
    new.tutor_id := null;
    return new;
  end if;

  if coalesce(v_is_admin, false) is true then
    return new;
  end if;

  if old.user_id is distinct from auth.uid() then
    raise exception 'Sem permissao para alterar este perfil';
  end if;

  if new.user_id is distinct from old.user_id
    or new.is_admin is distinct from old.is_admin
    or new.is_moderator is distinct from old.is_moderator
    or new.role is distinct from old.role
    or new.is_ranked is distinct from old.is_ranked
    or new.rank is distinct from old.rank
    or new.rank_level is distinct from old.rank_level
    or new.points is distinct from old.points
    or new.current_points is distinct from old.current_points
    or new.wins is distinct from old.wins
    or new.losses is distinct from old.losses
    or new.win_streak is distinct from old.win_streak
    or new.kage_title is distinct from old.kage_title
    or new.tutor_id is distinct from old.tutor_id
    or new.immunity_until is distinct from old.immunity_until
    or new.last_match_date is distinct from old.last_match_date
    or new.promotion_series_active is distinct from old.promotion_series_active
    or new.promotion_series_wins is distinct from old.promotion_series_wins
    or new.promotion_series_losses is distinct from old.promotion_series_losses
    or new.last_promotion_attempt is distinct from old.last_promotion_attempt
  then
    raise exception 'Campos de ranking, cargo e avaliacao so podem ser alterados pelo sistema ou administracao';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prevent_privilege_escalation on public.players;
drop trigger if exists players_prevent_privilege_escalation on public.players;
drop function if exists public.prevent_privilege_escalation();

drop trigger if exists trg_protect_player_integrity on public.players;
create trigger trg_protect_player_integrity
before insert or update on public.players
for each row execute function public.protect_player_integrity();

create or replace function public.ensure_player_profile()
returns public.players
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user auth.users;
  v_player public.players;
  v_name text;
begin
  if auth.uid() is null then
    raise exception 'Usuario nao autenticado';
  end if;

  select *
  into v_player
  from public.players
  where user_id = auth.uid()
  limit 1;

  if v_player.id is not null then
    return v_player;
  end if;

  select *
  into v_user
  from auth.users
  where id = auth.uid()
  limit 1;

  v_name := nullif(trim(coalesce(
    v_user.raw_user_meta_data ->> 'name',
    v_user.raw_user_meta_data ->> 'full_name',
    split_part(v_user.email, '@', 1),
    'Ninja'
  )), '');

  perform set_config('app.kage_system_update', 'on', true);

  insert into public.players (
    user_id,
    name,
    rank,
    rank_level,
    points,
    current_points,
    wins,
    losses,
    win_streak,
    is_ranked,
    is_admin,
    is_moderator,
    role,
    ninja_phrase,
    favorite_characters,
    selected_achievements,
    privacy_settings
  )
  values (
    auth.uid(),
    coalesce(v_name, 'Ninja'),
    'Unranked',
    'Unranked',
    0,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    'player',
    'Novo ninja em treinamento.',
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb
  )
  returning * into v_player;

  return v_player;
end;
$$;

create or replace function public.request_evaluation(p_message text)
returns public.evaluations
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_player public.players;
  v_evaluation public.evaluations;
  v_last_created_at timestamptz;
begin
  select * into v_player from public.ensure_player_profile();

  if coalesce(v_player.is_ranked, false) is true then
    raise exception 'Jogador ja esta rankeado';
  end if;

  if length(trim(coalesce(p_message, ''))) < 10 then
    raise exception 'Mensagem deve ter pelo menos 10 caracteres';
  end if;

  if exists (
    select 1
    from public.evaluations e
    where e.player_id = v_player.id
      and e.status in ('pending', 'accepted')
  ) then
    raise exception 'Ja existe uma avaliacao pendente ou em andamento';
  end if;

  select max(created_at)
  into v_last_created_at
  from public.evaluations
  where player_id = v_player.id;

  if v_last_created_at is not null and v_last_created_at > now() - interval '90 days' then
    raise exception 'Aguarde 90 dias para solicitar uma nova avaliacao';
  end if;

  insert into public.evaluations (player_id, request_message, status)
  values (v_player.id, trim(p_message), 'pending')
  returning * into v_evaluation;

  insert into public.notifications (user_id, type, title, message, data)
  select
    p.user_id,
    'evaluation_requested',
    'Nova solicitacao de avaliacao',
    v_player.name || ' solicitou uma avaliacao de rank.',
    jsonb_build_object('evaluation_id', v_evaluation.id, 'player_id', v_player.id)
  from public.players p
  where (coalesce(p.is_moderator, false) = true or coalesce(p.is_admin, false) = true)
    and p.user_id is not null;

  return v_evaluation;
end;
$$;

create or replace function public.accept_evaluation(p_evaluation_id uuid)
returns public.evaluations
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_evaluator public.players;
  v_evaluation public.evaluations;
  v_player public.players;
begin
  select *
  into v_evaluator
  from public.players
  where user_id = auth.uid()
  limit 1;

  if v_evaluator.id is null or (coalesce(v_evaluator.is_moderator, false) is not true and coalesce(v_evaluator.is_admin, false) is not true) then
    raise exception 'Apenas moderadores podem aceitar avaliacoes';
  end if;

  select *
  into v_evaluation
  from public.evaluations
  where id = p_evaluation_id
  for update;

  if v_evaluation.id is null then
    raise exception 'Avaliacao nao encontrada';
  end if;

  if v_evaluation.player_id = v_evaluator.id then
    raise exception 'Voce nao pode aceitar sua propria avaliacao';
  end if;

  if v_evaluation.status <> 'pending' or v_evaluation.evaluator_id is not null then
    raise exception 'Avaliacao nao esta pendente';
  end if;

  perform set_config('app.kage_system_update', 'on', true);

  update public.evaluations
  set status = 'accepted',
      evaluator_id = v_evaluator.id,
      updated_at = now()
  where id = p_evaluation_id
  returning * into v_evaluation;

  update public.players
  set tutor_id = v_evaluator.id
  where id = v_evaluation.player_id
  returning * into v_player;

  if v_player.user_id is not null then
    insert into public.notifications (user_id, type, title, message, data)
    values (
      v_player.user_id,
      'evaluation_accepted',
      'Avaliacao aceita',
      v_evaluator.name || ' aceitou sua avaliacao.',
      jsonb_build_object('evaluation_id', v_evaluation.id, 'evaluator_id', v_evaluator.id)
    );
  end if;

  return v_evaluation;
end;
$$;

create or replace function public.publish_evaluation_result(
  p_evaluation_id uuid,
  p_scores jsonb,
  p_initial_rank varchar,
  p_summary text,
  p_tip_1 text,
  p_tip_2 text,
  p_tip_3 text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_evaluator public.players;
  v_evaluation public.evaluations;
  v_player public.players;
  v_rank varchar;
  v_initial_points int;
  v_key text;
  v_score numeric;
  v_score_keys text[] := array[
    'pin_score',
    'defense_score',
    'aerial_score',
    'kunai_score',
    'timing_score',
    'resource_score',
    'dash_score',
    'general_score'
  ];
begin
  select *
  into v_evaluator
  from public.players
  where user_id = auth.uid()
  limit 1;

  if v_evaluator.id is null or (coalesce(v_evaluator.is_moderator, false) is not true and coalesce(v_evaluator.is_admin, false) is not true) then
    raise exception 'Apenas moderadores podem publicar avaliacoes';
  end if;

  select *
  into v_evaluation
  from public.evaluations
  where id = p_evaluation_id
  for update;

  if v_evaluation.id is null then
    raise exception 'Avaliacao nao encontrada';
  end if;

  if v_evaluation.status <> 'accepted' then
    raise exception 'Avaliacao precisa estar aceita antes da publicacao';
  end if;

  if coalesce(v_evaluator.is_admin, false) is not true and v_evaluation.evaluator_id <> v_evaluator.id then
    raise exception 'Apenas o avaliador responsavel pode publicar este resultado';
  end if;

  if exists (select 1 from public.evaluation_results where evaluation_id = p_evaluation_id) then
    raise exception 'Resultado desta avaliacao ja foi publicado';
  end if;

  v_rank := case lower(regexp_replace(trim(coalesce(p_initial_rank, '')), '\s+', '', 'g'))
    when 'genin' then 'Genin'
    when 'chunin' then 'Chunin'
    when 'chunnin' then 'Chunin'
    when 'jounin' then 'Jounin'
    when 'jounnin' then 'Jounin'
    when 'anbu' then 'Anbu'
    when 'sannin' then 'Sannin'
    when 'sanin' then 'Sannin'
    else null
  end;

  if v_rank is null then
    raise exception 'Rank inicial invalido';
  end if;

  foreach v_key in array v_score_keys loop
    if p_scores is null or not (p_scores ? v_key) then
      raise exception 'Pontuacao ausente: %', v_key;
    end if;

    v_score := (p_scores ->> v_key)::numeric;

    if v_score < 0 or v_score > 10 then
      raise exception 'Pontuacao % deve estar entre 0 e 10', v_key;
    end if;
  end loop;

  if length(trim(coalesce(p_summary, ''))) < 10 then
    raise exception 'Resumo da avaliacao deve ter pelo menos 10 caracteres';
  end if;

  if length(trim(coalesce(p_tip_1, ''))) = 0
    or length(trim(coalesce(p_tip_2, ''))) = 0
    or length(trim(coalesce(p_tip_3, ''))) = 0
  then
    raise exception 'As tres dicas sao obrigatorias';
  end if;

  v_initial_points := public.get_initial_points_for_rank(v_rank);

  perform set_config('app.kage_system_update', 'on', true);

  insert into public.evaluation_results (
    evaluation_id,
    evaluator_id,
    player_id,
    pin_score,
    defense_score,
    aerial_score,
    kunai_score,
    timing_score,
    resource_score,
    dash_score,
    general_score,
    initial_rank,
    initial_points,
    evaluation_summary,
    tip_1,
    tip_2,
    tip_3
  )
  values (
    v_evaluation.id,
    v_evaluator.id,
    v_evaluation.player_id,
    (p_scores ->> 'pin_score')::numeric,
    (p_scores ->> 'defense_score')::numeric,
    (p_scores ->> 'aerial_score')::numeric,
    (p_scores ->> 'kunai_score')::numeric,
    (p_scores ->> 'timing_score')::numeric,
    (p_scores ->> 'resource_score')::numeric,
    (p_scores ->> 'dash_score')::numeric,
    (p_scores ->> 'general_score')::numeric,
    v_rank,
    v_initial_points,
    trim(p_summary),
    trim(p_tip_1),
    trim(p_tip_2),
    trim(p_tip_3)
  );

  update public.evaluations
  set status = 'completed',
      evaluated_at = now(),
      evaluator_id = v_evaluator.id,
      initial_rank = v_rank,
      pin_score = (p_scores ->> 'pin_score')::numeric,
      defense_score = (p_scores ->> 'defense_score')::numeric,
      aerial_score = (p_scores ->> 'aerial_score')::numeric,
      kunai_score = (p_scores ->> 'kunai_score')::numeric,
      timing_score = (p_scores ->> 'timing_score')::numeric,
      resource_score = (p_scores ->> 'resource_score')::numeric,
      dash_score = (p_scores ->> 'dash_score')::numeric,
      general_score = (p_scores ->> 'general_score')::numeric,
      tips = trim(p_tip_1) || E'\n\n' || trim(p_tip_2) || E'\n\n' || trim(p_tip_3),
      comments = trim(p_summary),
      updated_at = now()
  where id = v_evaluation.id;

  update public.players
  set is_ranked = true,
      rank = v_rank,
      rank_level = v_rank,
      points = v_initial_points,
      current_points = v_initial_points,
      tutor_id = v_evaluator.id
  where id = v_evaluation.player_id
  returning * into v_player;

  insert into public.ranking_changes (
    player_id,
    old_rank,
    new_rank,
    old_points,
    new_points,
    change_reason,
    evaluation_id
  )
  values (
    v_evaluation.player_id,
    'Unranked',
    v_rank,
    0,
    v_initial_points,
    'evaluation',
    v_evaluation.id
  );

  perform public.update_kage_titles();

  if v_player.user_id is not null then
    insert into public.notifications (user_id, type, title, message, data)
    values (
      v_player.user_id,
      'evaluation_completed',
      'Resultado de avaliacao publicado',
      'Sua avaliacao foi publicada. Rank inicial: ' || v_rank || '.',
      jsonb_build_object('evaluation_id', v_evaluation.id, 'rank', v_rank, 'points', v_initial_points)
    );
  end if;

  return jsonb_build_object(
    'success', true,
    'evaluation_id', v_evaluation.id,
    'player_id', v_evaluation.player_id,
    'initial_rank', v_rank,
    'initial_points', v_initial_points
  );
end;
$$;

revoke execute on function public.ensure_player_profile() from PUBLIC, anon;
revoke execute on function public.request_evaluation(text) from PUBLIC, anon;
revoke execute on function public.accept_evaluation(uuid) from PUBLIC, anon;
revoke execute on function public.publish_evaluation_result(uuid, jsonb, varchar, text, text, text, text) from PUBLIC, anon;

grant execute on function public.ensure_player_profile() to authenticated;
grant execute on function public.request_evaluation(text) to authenticated;
grant execute on function public.accept_evaluation(uuid) to authenticated;
grant execute on function public.publish_evaluation_result(uuid, jsonb, varchar, text, text, text, text) to authenticated;

notify pgrst, 'reload schema';

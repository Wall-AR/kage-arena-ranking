drop function if exists public.seed_academy_moves_batch(jsonb);

drop function if exists public.can_update_profile_settings(uuid);

create or replace function public.can_update_profile_settings(user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
declare
  last_update timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Login necessario';
  end if;

  if user_id <> auth.uid() and not public.is_moderator(auth.uid()) then
    raise exception 'Sem permissao para consultar este perfil';
  end if;

  select p.last_profile_update into last_update
  from public.players p
  where p.user_id = can_update_profile_settings.user_id;

  return last_update is null or (now() - last_update) >= interval '33 days';
end;
$$;

create or replace function public.get_initial_points_for_rank(rank_name varchar)
returns integer
language sql
immutable
security invoker
set search_path = 'public', 'pg_temp'
as $$
  select case rank_name
    when 'Genin' then 100
    when 'Chunin' then 200
    when 'Chunnin' then 200
    when 'Jounin' then 350
    when 'Jounnin' then 350
    when 'Anbu' then 450
    when 'Sannin' then 600
    when 'Sanin' then 600
    else 0
  end;
$$;

create or replace function public.update_kage_titles()
returns void
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
declare
  top_player record;
  kage_titles text[] := array['Hokage', 'Kazekage', 'Mizukage', 'Raikage', 'Tsuchikage'];
  counter integer := 1;
begin
  if auth.uid() is null or not public.is_moderator(auth.uid()) then
    raise exception 'Apenas moderadores podem recalcular titulos Kage';
  end if;

  update public.players set kage_title = null;

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

revoke execute on all functions in schema public from public, anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from public;
alter default privileges for role postgres in schema public revoke execute on functions from anon;
alter default privileges for role postgres in schema public revoke execute on functions from authenticated;

grant execute on function public.is_admin(uuid) to anon, authenticated;
grant execute on function public.is_moderator(uuid) to anon, authenticated;
grant execute on function public.compute_rank_from_points(integer) to anon, authenticated;
grant execute on function public.get_initial_points_for_rank(varchar) to authenticated;
grant execute on function public.get_player_available_banners(uuid) to anon, authenticated;
grant execute on function public.can_update_profile_settings(uuid) to authenticated;
grant execute on function public.redeem_code(uuid, varchar) to authenticated;
grant execute on function public.update_kage_titles() to authenticated;
grant execute on function public.challenge_check_in(uuid) to authenticated;
grant execute on function public.report_challenge_result(uuid, uuid, jsonb, text, text) to authenticated;
grant execute on function public.confirm_challenge_result(uuid) to authenticated;
grant execute on function public.dispute_challenge_result(uuid, text) to authenticated;
grant execute on function public.cancel_challenge(uuid) to authenticated;
grant execute on function public.expire_old_challenges() to anon, authenticated;
grant execute on function public.advance_tournament_winner(uuid, uuid) to authenticated;
grant execute on function public.generate_tournament_bracket(uuid) to authenticated;
grant execute on function public.finalize_tournament(uuid) to authenticated;

drop policy if exists "Tournament images are public" on storage.objects;
drop policy if exists "Avatars are public" on storage.objects;

notify pgrst, 'reload schema';

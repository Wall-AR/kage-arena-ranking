create or replace function public.is_admin(user_uuid uuid)
returns boolean
language sql
stable
security invoker
set search_path = 'public', 'pg_temp'
as $$
  select coalesce((select p.is_admin from public.players p where p.user_id = user_uuid limit 1), false);
$$;

create or replace function public.is_moderator(user_uuid uuid)
returns boolean
language sql
stable
security invoker
set search_path = 'public', 'pg_temp'
as $$
  select coalesce((select p.is_moderator or p.is_admin from public.players p where p.user_id = user_uuid limit 1), false);
$$;

create or replace function public.get_player_available_banners(p_player_id uuid)
returns table(banner_id uuid, source text)
language plpgsql
stable
security invoker
set search_path = 'public', 'pg_temp'
as $$
begin
  return query
  select pb.banner_id, 'unlocked'::text
  from public.player_banners pb
  where pb.player_id = p_player_id
  union
  select b.id, 'character_top1'::text
  from public.banners b
  where b.character_name is not null
    and b.is_available = true
    and exists (
      select 1
      from public.players p
      where p.id = p_player_id
        and p.is_ranked = true
        and p.favorite_characters ? b.character_name
        and p.current_points = (
          select max(p2.current_points)
          from public.players p2
          where p2.is_ranked = true
            and p2.favorite_characters ? b.character_name
        )
    );
end;
$$;

revoke execute on function public.get_player_available_banners(uuid) from anon;
revoke execute on function public.expire_old_challenges() from anon;

grant execute on function public.is_admin(uuid) to anon, authenticated;
grant execute on function public.is_moderator(uuid) to anon, authenticated;
grant execute on function public.get_player_available_banners(uuid) to authenticated;
grant execute on function public.expire_old_challenges() to authenticated;

notify pgrst, 'reload schema';

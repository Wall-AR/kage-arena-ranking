create or replace function public.can_update_profile_settings(user_id uuid)
returns boolean
language plpgsql
security invoker
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

grant execute on function public.can_update_profile_settings(uuid) to authenticated;

notify pgrst, 'reload schema';

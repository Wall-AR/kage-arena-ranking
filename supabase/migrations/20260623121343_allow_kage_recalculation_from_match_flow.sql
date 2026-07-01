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

grant execute on function public.update_kage_titles() to authenticated;

notify pgrst, 'reload schema';

revoke execute on function public.handle_new_user() from PUBLIC, anon, authenticated;
revoke execute on function public.protect_player_integrity() from PUBLIC, anon, authenticated;
revoke execute on function public.set_initial_admin(uuid) from PUBLIC, anon, authenticated;
revoke execute on function public.distribute_tournament_rewards(uuid) from PUBLIC, anon, authenticated;

notify pgrst, 'reload schema';

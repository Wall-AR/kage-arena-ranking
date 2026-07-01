revoke execute on function public.validate_tournament_match_update() from public, anon, authenticated;

notify pgrst, 'reload schema';

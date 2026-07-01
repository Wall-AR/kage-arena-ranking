-- Restrict tournament RPCs so anonymous visitors cannot call privileged
-- SECURITY DEFINER functions through the REST API.

REVOKE EXECUTE ON FUNCTION public.create_tournament_request(
  text,
  text,
  text,
  text,
  integer,
  timestamptz,
  timestamptz,
  timestamptz,
  timestamptz,
  timestamptz,
  text,
  text,
  boolean,
  text,
  text
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_tournament_request(
  text,
  text,
  text,
  text,
  integer,
  timestamptz,
  timestamptz,
  timestamptz,
  timestamptz,
  timestamptz,
  text,
  text,
  boolean,
  text,
  text
) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.approve_tournament(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_tournament(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.reject_tournament(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reject_tournament(uuid, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.validate_tournament_registration() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_tournament_check_in() FROM PUBLIC;

NOTIFY pgrst, 'reload schema';

-- Corrigir função sem search_path definido (security warning)
CREATE OR REPLACE FUNCTION public.get_initial_points_for_rank(rank_name VARCHAR)
RETURNS INTEGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  CASE rank_name
    WHEN 'Genin' THEN RETURN 100;
    WHEN 'Chunnin' THEN RETURN 200;
    WHEN 'Jounnin' THEN RETURN 350;
    WHEN 'Anbu' THEN RETURN 450;
    WHEN 'Sanin' THEN RETURN 600;
    ELSE RETURN 100;
  END CASE;
END;
$$;
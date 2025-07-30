-- Corrigir funções com search_path para segurança
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

-- Corrigir função de atualização de títulos Kage
CREATE OR REPLACE FUNCTION public.update_kage_titles()
RETURNS VOID 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  top_players RECORD;
  kage_titles TEXT[] := ARRAY['Hokage', 'Kazekage', 'Mizukage', 'Raikage', 'Tsuchikage'];
  counter INTEGER := 1;
BEGIN
  -- Limpar títulos Kage existentes
  UPDATE public.players SET kage_title = NULL;
  
  -- Atribuir títulos aos top 5
  FOR top_players IN 
    SELECT id FROM public.players 
    WHERE is_ranked = true 
    ORDER BY current_points DESC, wins DESC 
    LIMIT 5
  LOOP
    UPDATE public.players 
    SET kage_title = kage_titles[counter]
    WHERE id = top_players.id;
    
    counter := counter + 1;
  END LOOP;
END;
$$;
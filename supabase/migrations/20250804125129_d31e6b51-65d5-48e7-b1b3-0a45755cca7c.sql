-- Limpar dados de teste e garantir que apenas usuários reais existam
-- Remover players sem user_id válido
DELETE FROM players WHERE user_id IS NULL;

-- Atualizar função para garantir dados corretos
CREATE OR REPLACE FUNCTION public.update_kage_titles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $function$
DECLARE
  top_players RECORD;
  kage_titles TEXT[] := ARRAY['Hokage', 'Kazekage', 'Mizukage', 'Raikage', 'Tsuchikage'];
  counter INTEGER := 1;
BEGIN
  -- Limpar títulos Kage existentes
  UPDATE public.players SET kage_title = NULL;
  
  -- Atribuir títulos aos top 5 APENAS jogadores rankeados
  FOR top_players IN 
    SELECT id FROM public.players 
    WHERE is_ranked = true AND user_id IS NOT NULL
    ORDER BY current_points DESC, wins DESC 
    LIMIT 5
  LOOP
    UPDATE public.players 
    SET kage_title = kage_titles[counter]
    WHERE id = top_players.id;
    
    counter := counter + 1;
  END LOOP;
END;
$function$;

-- Executar atualização de títulos
SELECT update_kage_titles();
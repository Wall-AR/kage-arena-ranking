-- Corrigir ranks dos jogadores rankeados que estão com rank inconsistente
UPDATE public.players 
SET 
  rank = CASE 
    WHEN is_admin = true OR is_moderator = true THEN 'Jounin'
    ELSE 'Genin'
  END,
  rank_level = CASE 
    WHEN is_admin = true OR is_moderator = true THEN 'Jounin'
    ELSE 'Genin'
  END
WHERE is_ranked = true AND rank = 'Unranked';
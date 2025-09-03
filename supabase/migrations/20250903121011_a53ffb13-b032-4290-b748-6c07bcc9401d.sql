-- Promover explicitamente o jogador "Wall" a admin/moderador
UPDATE public.players
SET is_admin = true,
    is_moderator = true,
    role = 'admin'
WHERE id IN (
  SELECT id FROM public.players
  WHERE lower(name) = lower('Wall')
    AND user_id IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 1
);

-- Garantir consistência: se já rankeado, manter
-- (nenhuma ação adicional aqui)

-- Recalcular títulos Kage após mudanças
SELECT public.update_kage_titles();
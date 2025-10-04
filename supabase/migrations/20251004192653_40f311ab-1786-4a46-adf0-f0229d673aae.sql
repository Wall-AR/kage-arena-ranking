-- Adicionar banners padrão ao sistema (sem ON CONFLICT primeiro)
INSERT INTO banners (name, display_name, description, image_url, unlock_condition, unlock_description, is_default)
SELECT 'default', 'Padrão', 'Banner padrão para todos os jogadores', '', 'default', 'Disponível para todos', true
WHERE NOT EXISTS (SELECT 1 FROM banners WHERE name = 'default');

INSERT INTO banners (name, display_name, description, image_url, unlock_condition, unlock_description, is_default)
SELECT 'legacy', 'Legado', 'Para os jogadores que estiveram desde o início', '', 'event_launch', 'Jogadores do evento de lançamento', false
WHERE NOT EXISTS (SELECT 1 FROM banners WHERE name = 'legacy');

INSERT INTO banners (name, display_name, description, image_url, unlock_condition, unlock_description, is_default)
SELECT 'first_contribution', 'Toma uns trocados', 'Primeira contribuição ao sistema', '', 'contribution_1', 'Realize sua primeira contribuição', false
WHERE NOT EXISTS (SELECT 1 FROM banners WHERE name = 'first_contribution');

INSERT INTO banners (name, display_name, description, image_url, unlock_condition, unlock_description, is_default)
SELECT 'golden_supporter', 'Ishalá, muito Ouro', 'Cinco contribuições realizadas', '', 'contribution_5', 'Realize 5 contribuições', false
WHERE NOT EXISTS (SELECT 1 FROM banners WHERE name = 'golden_supporter');

-- Adicionar unique constraint se não existir
ALTER TABLE player_banners DROP CONSTRAINT IF EXISTS player_banners_player_id_banner_id_key;
ALTER TABLE player_banners ADD CONSTRAINT player_banners_player_id_banner_id_key UNIQUE (player_id, banner_id);

-- Adicionar banner padrão para todos os jogadores existentes
INSERT INTO player_banners (player_id, banner_id)
SELECT 
  p.id,
  b.id
FROM players p
CROSS JOIN banners b
WHERE b.is_default = true
  AND NOT EXISTS (
    SELECT 1 FROM player_banners pb 
    WHERE pb.player_id = p.id AND pb.banner_id = b.id
  );
-- Definir usuário atual como admin
UPDATE players 
SET is_admin = true, is_moderator = true, role = 'admin'
WHERE user_id = 'f6b9a503-d83d-4ea9-bb08-e10cbdafde93';
-- Promover o usuário wallace.flavio.rodrigues@gmail.com a administrador
UPDATE public.players 
SET 
  is_admin = true, 
  is_moderator = true, 
  role = 'admin'
WHERE user_id = '3afcabff-3b47-4e3c-b596-ff64c9f32fdb';
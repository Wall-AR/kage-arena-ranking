-- Corrigir usuário admin para o ID correto
UPDATE players 
SET is_admin = true, is_moderator = true, role = 'admin'
WHERE user_id = '3afcabff-3b47-4e3c-b596-ff64c9f32fdb';

-- Verificar se o usuário existe na tabela players
INSERT INTO players (
  user_id, 
  name, 
  rank, 
  rank_level,
  points, 
  current_points,
  wins, 
  losses, 
  win_streak,
  is_ranked, 
  is_moderator,
  is_admin,
  role,
  created_at,
  updated_at
)
SELECT 
  '3afcabff-3b47-4e3c-b596-ff64c9f32fdb',
  'Admin User',
  'Kage',
  'Kage',
  1000,
  1000,
  0,
  0,
  0,
  true,
  true,
  true,
  'admin',
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM players WHERE user_id = '3afcabff-3b47-4e3c-b596-ff64c9f32fdb'
);
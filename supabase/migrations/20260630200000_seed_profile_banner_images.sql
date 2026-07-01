-- Seed profile/ranking banner images served by the web app from /public/banners.

INSERT INTO public.banners (
  name,
  display_name,
  description,
  image_url,
  rarity,
  category,
  is_available,
  unlock_type,
  character_name
)
VALUES
  (
    'legacy_banner',
    'Eu Sou Bucha',
    'Banner legado comemorativo de lancamento do Kage Arena.',
    '/banners/eusoubucha.jpg',
    'rare',
    'event',
    true,
    'code',
    NULL
  ),
  (
    'top_deidara',
    'TOP 1 - Deidara',
    'Banner exclusivo para o atual TOP 1 no ranking de Deidara.',
    '/banners/deidara.jpg',
    'legendary',
    'character',
    true,
    'character_top1',
    'Deidara'
  ),
  (
    'top_might_guy',
    'TOP 1 - Might Guy',
    'Banner exclusivo para o atual TOP 1 no ranking de Might Guy.',
    '/banners/might-guy.jpg',
    'legendary',
    'character',
    true,
    'character_top1',
    'Might Guy'
  ),
  (
    'top_itachi_uchiha',
    'TOP 1 - Itachi Uchiha',
    'Banner exclusivo para o atual TOP 1 no ranking de Itachi Uchiha.',
    '/banners/itachi-uchiha.jpg',
    'legendary',
    'character',
    true,
    'character_top1',
    'Itachi Uchiha'
  ),
  (
    'top_kisame_hoshigaki',
    'TOP 1 - Kisame Hoshigaki',
    'Banner exclusivo para o atual TOP 1 no ranking de Kisame Hoshigaki.',
    '/banners/kisame-hoshigaki.jpg',
    'legendary',
    'character',
    true,
    'character_top1',
    'Kisame Hoshigaki'
  ),
  (
    'top_rock_lee',
    'TOP 1 - Rock Lee',
    'Banner exclusivo para o atual TOP 1 no ranking de Rock Lee.',
    '/banners/rock-lee.jpg',
    'legendary',
    'character',
    true,
    'character_top1',
    'Rock Lee'
  ),
  (
    'top_rock_lee_shippuden',
    'TOP 1 - Rock Lee Shippuden',
    'Banner exclusivo para o atual TOP 1 no ranking de Rock Lee Shippuden.',
    '/banners/rock-lee-shippuden.jpg',
    'legendary',
    'character',
    true,
    'character_top1',
    'Rock Lee Shippūden'
  ),
  (
    'top_naruto_uzumaki',
    'TOP 1 - Naruto Uzumaki',
    'Banner exclusivo para o atual TOP 1 no ranking de Naruto Uzumaki.',
    '/banners/naruto-uzumaki.jpg',
    'legendary',
    'character',
    true,
    'character_top1',
    'Naruto Uzumaki'
  ),
  (
    'top_naruto_shippuden',
    'TOP 1 - Naruto Shippuden',
    'Banner exclusivo para o atual TOP 1 no ranking de Naruto Shippuden.',
    '/banners/naruto-shippuden.jpg',
    'legendary',
    'character',
    true,
    'character_top1',
    'Naruto Shippūden'
  ),
  (
    'top_neji_hyuuga',
    'TOP 1 - Neji Hyuuga',
    'Banner exclusivo para o atual TOP 1 no ranking de Neji Hyuuga.',
    '/banners/neji-hyuuga.jpg',
    'legendary',
    'character',
    true,
    'character_top1',
    'Neji Hyuuga'
  ),
  (
    'top_neji_hyuuga_shippuden',
    'TOP 1 - Neji Hyuuga Shippuden',
    'Banner exclusivo para o atual TOP 1 no ranking de Neji Hyuuga Shippuden.',
    '/banners/neji-hyuuga-shippuden.jpg',
    'legendary',
    'character',
    true,
    'character_top1',
    'Neji Hyuuga Shippūden'
  ),
  (
    'top_shikamaru_nara_shippuden',
    'TOP 1 - Shikamaru Nara Shippuden',
    'Banner exclusivo para o atual TOP 1 no ranking de Shikamaru Nara Shippuden.',
    '/banners/shikamaru-nara-shippuden.jpg',
    'legendary',
    'character',
    true,
    'character_top1',
    'Shikamaru Nara Shippūden'
  ),
  (
    'top_temari',
    'TOP 1 - Temari',
    'Banner exclusivo para o atual TOP 1 no ranking de Temari.',
    '/banners/temari.jpg',
    'legendary',
    'character',
    true,
    'character_top1',
    'Temari'
  ),
  (
    'top_temari_shippuden',
    'TOP 1 - Temari Shippuden',
    'Banner exclusivo para o atual TOP 1 no ranking de Temari Shippuden.',
    '/banners/temari-shippuden.jpg',
    'legendary',
    'character',
    true,
    'character_top1',
    'Temari Shippūden'
  ),
  (
    'top_tsunade',
    'TOP 1 - Tsunade',
    'Banner exclusivo para o atual TOP 1 no ranking de Tsunade.',
    '/banners/tsunade.jpg',
    'legendary',
    'character',
    true,
    'character_top1',
    'Tsunade'
  )
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  rarity = EXCLUDED.rarity,
  category = EXCLUDED.category,
  is_available = EXCLUDED.is_available,
  unlock_type = EXCLUDED.unlock_type,
  character_name = EXCLUDED.character_name;

INSERT INTO public.achievements (name, display_name, description, icon, color, category)
VALUES (
  'bucha_elite',
  'Bucha de Elite',
  'Conquistado por membros fundadores da comunidade.',
  'award',
  'gold',
  'special'
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  category = EXCLUDED.category;

INSERT INTO public.redemption_codes (code, banner_id, achievement_id, max_uses, is_active)
SELECT 'EUSOUBUCHAD+', b.id, a.id, NULL, true
FROM public.banners b
CROSS JOIN public.achievements a
WHERE b.name = 'legacy_banner'
  AND a.name = 'bucha_elite'
ON CONFLICT (code) DO UPDATE SET
  banner_id = EXCLUDED.banner_id,
  achievement_id = EXCLUDED.achievement_id,
  max_uses = EXCLUDED.max_uses,
  is_active = EXCLUDED.is_active;

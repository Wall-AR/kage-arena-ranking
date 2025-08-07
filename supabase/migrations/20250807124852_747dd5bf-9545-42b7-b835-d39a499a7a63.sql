-- Corrigir função com search path e implementar sistema admin funcional
DROP FUNCTION IF EXISTS public.set_initial_admin(uuid);

-- Função corrigida com search path seguro
CREATE OR REPLACE FUNCTION public.set_initial_admin(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Apenas permite definir o primeiro admin se não houver nenhum admin ainda
  IF NOT EXISTS (SELECT 1 FROM public.players WHERE is_admin = true) THEN
    UPDATE public.players 
    SET is_admin = true, is_moderator = true, role = 'admin'
    WHERE user_id = target_user_id;
  END IF;
END;
$$;

-- Criar função para criar as imagens dos personagens favoritos
CREATE TABLE IF NOT EXISTS public.character_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_name TEXT NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir URLs das imagens dos personagens (placeholder - serão substituídas por imagens reais)
INSERT INTO public.character_images (character_name, image_url) VALUES
('Naruto Uzumaki', '/characters/naruto.jpg'),
('Naruto Shippūden', '/characters/naruto-shippuden.jpg'),
('Sasuke Uchiha', '/characters/sasuke.jpg'),
('Sasuke Shippūden', '/characters/sasuke-shippuden.jpg'),
('Sakura Haruno', '/characters/sakura.jpg'),
('Sakura Haruno Shippūden', '/characters/sakura-shippuden.jpg'),
('Kakashi Hatake', '/characters/kakashi.jpg'),
('Rock Lee', '/characters/rock-lee.jpg'),
('Rock Lee Modo Punho Zonzo', '/characters/rock-lee-drunk.jpg'),
('Rock Lee Shippūden', '/characters/rock-lee-shippuden.jpg'),
('Neji Hyuuga', '/characters/neji.jpg'),
('Neji Hyuuga Shippūden', '/characters/neji-shippuden.jpg'),
('Tenten', '/characters/tenten.jpg'),
('Tenten Shippūden', '/characters/tenten-shippuden.jpg'),
('Might Guy', '/characters/might-guy.jpg'),
('Shikamaru Nara', '/characters/shikamaru.jpg'),
('Shikamaru Nara Shippūden', '/characters/shikamaru-shippuden.jpg'),
('Chouji Akimichi', '/characters/chouji.jpg'),
('Chouji Akimichi Shippūden', '/characters/chouji-shippuden.jpg'),
('Ino Yamanaka', '/characters/ino.jpg'),
('Ino Yamanaka Shippūden', '/characters/ino-shippuden.jpg'),
('Asuma Sarutobi', '/characters/asuma.jpg'),
('Shino Aburame', '/characters/shino.jpg'),
('Shino Aburame Shippūden', '/characters/shino-shippuden.jpg'),
('Kiba Inuzuka', '/characters/kiba.jpg'),
('Kiba Inuzuka Shippūden', '/characters/kiba-shippuden.jpg'),
('Hinata Hyuuga', '/characters/hinata.jpg'),
('Hinata Hyuuga Shippūden', '/characters/hinata-shippuden.jpg'),
('Kurenai Yuuhi', '/characters/kurenai.jpg'),
('Gaara', '/characters/gaara.jpg'),
('Gaara Shippūden', '/characters/gaara-shippuden.jpg'),
('Kankurou', '/characters/kankurou.jpg'),
('Kankurou Shippūden', '/characters/kankurou-shippuden.jpg'),
('Temari', '/characters/temari.jpg'),
('Temari Shippūden', '/characters/temari-shippuden.jpg'),
('Vovó Chiyo', '/characters/chiyo.jpg'),
('Vovó Chiyo Taijutsu', '/characters/chiyo-taijutsu.jpg'),
('Vovó Chiyo Mestre das Marionetes', '/characters/chiyo-puppet.jpg'),
('Itachi Uchiha', '/characters/itachi.jpg'),
('Kisame Hoshigaki', '/characters/kisame.jpg'),
('Deidara', '/characters/deidara.jpg'),
('Sasori', '/characters/sasori.jpg'),
('Hiruko', '/characters/hiruko.jpg'),
('Terceiro Kazekage', '/characters/third-kazekage.jpg'),
('Sai', '/characters/sai.jpg'),
('Yamato', '/characters/yamato.jpg'),
('Jiraiya', '/characters/jiraiya.jpg'),
('Tsunade', '/characters/tsunade.jpg'),
('Shizune', '/characters/shizune.jpg'),
('Orochimaru', '/characters/orochimaru.jpg'),
('Kabuto Yakushi', '/characters/kabuto.jpg'),
('Jiroubou', '/characters/jiroubou.jpg'),
('Kidoumaru', '/characters/kidoumaru.jpg'),
('Sakon e Ukon', '/characters/sakon-ukon.jpg'),
('Tayuya', '/characters/tayuya.jpg'),
('Kimimaro', '/characters/kimimaro.jpg'),
('Hashirama Senju', '/characters/hashirama.jpg'),
('Tobirama Senju', '/characters/tobirama.jpg'),
('Hiruzen Sarutobi', '/characters/hiruzen.jpg'),
('Minato Namikaze', '/characters/minato.jpg'),
('Hanabi Hyuuga', '/characters/hanabi.jpg'),
('Konohamaru', '/characters/konohamaru.jpg'),
('Anko Mitarashi', '/characters/anko.jpg'),
('Haku', '/characters/haku.jpg'),
('Zabuza Momochi', '/characters/zabuza.jpg')
ON CONFLICT (character_name) DO NOTHING;

-- Habilitar RLS na tabela de imagens
ALTER TABLE public.character_images ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura das imagens por todos
CREATE POLICY "character_images_select_policy" 
ON public.character_images 
FOR SELECT 
USING (true);
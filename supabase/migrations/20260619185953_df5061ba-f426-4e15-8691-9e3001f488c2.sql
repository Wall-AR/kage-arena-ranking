
-- ============= ACADEMY SYSTEM =============

-- 1) Characters (master) — additional rich data for academy pages
CREATE TABLE public.academy_characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug varchar NOT NULL UNIQUE,
  name varchar NOT NULL,
  tier varchar NOT NULL DEFAULT 'B',
  image_url text NOT NULL,
  image_lv2_url text,
  short_description text,
  full_description text,
  playstyle text,
  difficulty varchar DEFAULT 'medium', -- easy | medium | hard | expert
  attributes jsonb NOT NULL DEFAULT '{"strength":5,"speed":5,"technique":5,"defense":5,"mobility":5,"versatility":5}'::jsonb,
  strengths text[] NOT NULL DEFAULT '{}',
  weaknesses text[] NOT NULL DEFAULT '{}',
  favorable_against text[] NOT NULL DEFAULT '{}',
  unfavorable_against text[] NOT NULL DEFAULT '{}',
  recommended_for text,
  is_published boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.academy_characters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academy_characters TO authenticated;
GRANT ALL ON public.academy_characters TO service_role;
ALTER TABLE public.academy_characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published academy characters"
  ON public.academy_characters FOR SELECT
  USING (is_published = true OR public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));
CREATE POLICY "Admins/mods can insert academy characters"
  ON public.academy_characters FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));
CREATE POLICY "Admins/mods can update academy characters"
  ON public.academy_characters FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));
CREATE POLICY "Admins can delete academy characters"
  ON public.academy_characters FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE INDEX idx_academy_characters_slug ON public.academy_characters(slug);
CREATE INDEX idx_academy_characters_tier ON public.academy_characters(tier);

-- 2) Moves / abilities per character
CREATE TABLE public.academy_character_moves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL REFERENCES public.academy_characters(id) ON DELETE CASCADE,
  name varchar NOT NULL,
  move_type varchar NOT NULL DEFAULT 'special',
  command varchar, -- ex: "↓→ + Quadrado"
  video_url text,
  thumbnail_url text,
  description text NOT NULL,
  damage_rating integer DEFAULT 5 CHECK (damage_rating BETWEEN 1 AND 10),
  difficulty varchar DEFAULT 'medium',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.academy_character_moves TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academy_character_moves TO authenticated;
GRANT ALL ON public.academy_character_moves TO service_role;
ALTER TABLE public.academy_character_moves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view moves" ON public.academy_character_moves FOR SELECT USING (true);
CREATE POLICY "Admins/mods manage moves" ON public.academy_character_moves FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));
CREATE INDEX idx_academy_moves_character ON public.academy_character_moves(character_id);

-- 3) Combos per character
CREATE TABLE public.academy_character_combos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL REFERENCES public.academy_characters(id) ON DELETE CASCADE,
  name varchar NOT NULL,
  inputs text NOT NULL, -- "□ □ □ → △ → Rasengan"
  difficulty varchar NOT NULL DEFAULT 'medium', -- easy | medium | hard | expert
  damage_estimate varchar, -- "~45%"
  video_url text,
  situation text, -- "Corner / Midscreen / Punish"
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.academy_character_combos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academy_character_combos TO authenticated;
GRANT ALL ON public.academy_character_combos TO service_role;
ALTER TABLE public.academy_character_combos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view combos" ON public.academy_character_combos FOR SELECT USING (true);
CREATE POLICY "Admins/mods manage combos" ON public.academy_character_combos FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));
CREATE INDEX idx_academy_combos_character ON public.academy_character_combos(character_id);

-- 4) Academy topics (mecânicas do jogo, fundamentos, etc.)
CREATE TABLE public.academy_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug varchar NOT NULL UNIQUE,
  title varchar NOT NULL,
  category varchar NOT NULL DEFAULT 'mechanics', -- mechanics | basics | advanced | strategy | meta
  icon varchar,
  summary text,
  content text NOT NULL,
  video_url text,
  is_pinned boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.academy_topics TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academy_topics TO authenticated;
GRANT ALL ON public.academy_topics TO service_role;
ALTER TABLE public.academy_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published topics" ON public.academy_topics FOR SELECT
  USING (is_published = true OR public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));
CREATE POLICY "Admins/mods manage topics" ON public.academy_topics FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));
CREATE INDEX idx_academy_topics_category ON public.academy_topics(category);

-- 5) Commented matches (partidas comentadas)
CREATE TABLE public.academy_commented_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  player_a_name varchar,
  player_b_name varchar,
  character_a varchar,
  character_b varchar,
  winner varchar, -- 'a' | 'b' | null
  commentator varchar,
  tier varchar, -- nivel didatico: iniciante/intermediario/avancado
  tags text[] NOT NULL DEFAULT '{}',
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  views_count integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.academy_commented_matches TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academy_commented_matches TO authenticated;
GRANT ALL ON public.academy_commented_matches TO service_role;
ALTER TABLE public.academy_commented_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published commented matches" ON public.academy_commented_matches FOR SELECT
  USING (is_published = true OR public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));
CREATE POLICY "Admins/mods manage commented matches" ON public.academy_commented_matches FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) OR public.is_moderator(auth.uid()));

-- updated_at triggers
CREATE TRIGGER trg_academy_characters_updated BEFORE UPDATE ON public.academy_characters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_academy_moves_updated BEFORE UPDATE ON public.academy_character_moves
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_academy_combos_updated BEFORE UPDATE ON public.academy_character_combos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_academy_topics_updated BEFORE UPDATE ON public.academy_topics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_academy_cmatches_updated BEFORE UPDATE ON public.academy_commented_matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

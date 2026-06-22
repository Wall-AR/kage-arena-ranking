
ALTER TABLE public.academy_character_moves ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.players(id) ON DELETE SET NULL;
ALTER TABLE public.academy_character_combos ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.players(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.academy_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_type text NOT NULL CHECK (card_type IN ('move','combo')),
  card_id uuid NOT NULL,
  reaction_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, card_type, card_id)
);

CREATE INDEX IF NOT EXISTS idx_academy_reactions_card ON public.academy_reactions(card_type, card_id);

GRANT SELECT ON public.academy_reactions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academy_reactions TO authenticated;
GRANT ALL ON public.academy_reactions TO service_role;

ALTER TABLE public.academy_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions" ON public.academy_reactions FOR SELECT USING (true);
CREATE POLICY "Users insert own reactions" ON public.academy_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reactions" ON public.academy_reactions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own reactions" ON public.academy_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

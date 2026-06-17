
-- Drop old per-type uniqueness so a user has only ONE reaction per message
ALTER TABLE public.forum_reactions DROP CONSTRAINT IF EXISTS forum_reactions_user_id_topic_id_reaction_type_key;
ALTER TABLE public.forum_reactions DROP CONSTRAINT IF EXISTS forum_reactions_user_id_reply_id_reaction_type_key;

-- One reaction per user per topic / per reply
CREATE UNIQUE INDEX IF NOT EXISTS forum_reactions_user_topic_uniq
  ON public.forum_reactions (user_id, topic_id) WHERE topic_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS forum_reactions_user_reply_uniq
  ON public.forum_reactions (user_id, reply_id) WHERE reply_id IS NOT NULL;

-- Restrict reaction_type to ninja set
ALTER TABLE public.forum_reactions DROP CONSTRAINT IF EXISTS forum_reactions_reaction_type_check;
ALTER TABLE public.forum_reactions
  ADD CONSTRAINT forum_reactions_reaction_type_check
  CHECK (reaction_type IN ('shuriken','hype','fire','laugh','dislike','rasengan','sharingan','heart'));

-- Allow users to UPDATE their own reaction (so we can switch types in one call)
DROP POLICY IF EXISTS "Usuários podem atualizar suas reações" ON public.forum_reactions;
CREATE POLICY "Usuários podem atualizar suas reações"
  ON public.forum_reactions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.players p WHERE p.id = forum_reactions.user_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.players p WHERE p.id = forum_reactions.user_id AND p.user_id = auth.uid()));

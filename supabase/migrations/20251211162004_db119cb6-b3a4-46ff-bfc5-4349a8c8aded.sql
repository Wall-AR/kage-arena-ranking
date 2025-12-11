
-- Create forum categories table
CREATE TABLE public.forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR NOT NULL DEFAULT 'MessageSquare',
  color VARCHAR NOT NULL DEFAULT 'orange',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum topics table
CREATE TABLE public.forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  last_reply_at TIMESTAMP WITH TIME ZONE,
  last_reply_by UUID REFERENCES public.players(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum replies table
CREATE TABLE public.forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum reactions table (likes)
CREATE TABLE public.forum_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  reaction_type VARCHAR NOT NULL DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, topic_id, reaction_type),
  UNIQUE(user_id, reply_id, reaction_type),
  CHECK (topic_id IS NOT NULL OR reply_id IS NOT NULL)
);

-- Enable RLS
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_reactions ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Categorias visíveis por todos" ON public.forum_categories
FOR SELECT USING (true);

CREATE POLICY "Moderadores podem gerenciar categorias" ON public.forum_categories
FOR ALL USING (is_moderator(auth.uid()));

-- Topics policies
CREATE POLICY "Tópicos visíveis por todos" ON public.forum_topics
FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem criar tópicos" ON public.forum_topics
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM players WHERE id = author_id AND user_id = auth.uid())
);

CREATE POLICY "Autores podem editar seus tópicos" ON public.forum_topics
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM players WHERE id = author_id AND user_id = auth.uid())
  OR is_moderator(auth.uid())
);

CREATE POLICY "Moderadores podem deletar tópicos" ON public.forum_topics
FOR DELETE USING (is_moderator(auth.uid()));

CREATE POLICY "Autores podem deletar seus tópicos" ON public.forum_topics
FOR DELETE USING (
  EXISTS (SELECT 1 FROM players WHERE id = author_id AND user_id = auth.uid())
);

-- Replies policies
CREATE POLICY "Respostas visíveis por todos" ON public.forum_replies
FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem criar respostas" ON public.forum_replies
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM players WHERE id = author_id AND user_id = auth.uid())
);

CREATE POLICY "Autores podem editar suas respostas" ON public.forum_replies
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM players WHERE id = author_id AND user_id = auth.uid())
  OR is_moderator(auth.uid())
);

CREATE POLICY "Moderadores podem deletar respostas" ON public.forum_replies
FOR DELETE USING (is_moderator(auth.uid()));

CREATE POLICY "Autores podem deletar suas respostas" ON public.forum_replies
FOR DELETE USING (
  EXISTS (SELECT 1 FROM players WHERE id = author_id AND user_id = auth.uid())
);

-- Reactions policies
CREATE POLICY "Reações visíveis por todos" ON public.forum_reactions
FOR SELECT USING (true);

CREATE POLICY "Usuários podem reagir" ON public.forum_reactions
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM players WHERE id = user_id AND user_id = auth.uid())
);

CREATE POLICY "Usuários podem remover suas reações" ON public.forum_reactions
FOR DELETE USING (
  EXISTS (SELECT 1 FROM players WHERE id = user_id AND user_id = auth.uid())
);

-- Function to update topic reply count and last reply
CREATE OR REPLACE FUNCTION public.update_topic_reply_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_topics
    SET replies_count = replies_count + 1,
        last_reply_at = NEW.created_at,
        last_reply_by = NEW.author_id
    WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_topics
    SET replies_count = GREATEST(0, replies_count - 1)
    WHERE id = OLD.topic_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for reply stats
CREATE TRIGGER update_topic_reply_stats_trigger
AFTER INSERT OR DELETE ON public.forum_replies
FOR EACH ROW EXECUTE FUNCTION public.update_topic_reply_stats();

-- Insert default categories
INSERT INTO public.forum_categories (name, slug, description, icon, color, display_order) VALUES
('Geral', 'geral', 'Discussões gerais sobre o jogo e a comunidade', 'MessageSquare', 'orange', 1),
('Estratégias', 'estrategias', 'Compartilhe e discuta estratégias de jogo', 'Target', 'red', 2),
('Personagens', 'personagens', 'Discussões sobre personagens específicos', 'Users', 'blue', 3),
('Torneios', 'torneios', 'Organize e discuta sobre torneios', 'Trophy', 'yellow', 4),
('Bugs & Suporte', 'bugs-suporte', 'Reporte bugs e peça ajuda técnica', 'AlertTriangle', 'purple', 5),
('Off-Topic', 'off-topic', 'Conversa livre fora do tema principal', 'Coffee', 'green', 6);

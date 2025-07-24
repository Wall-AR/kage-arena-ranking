-- Criar tabelas para o sistema Kage Arena

-- Tabela de jogadores/usuários
CREATE TABLE public.players (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    rank VARCHAR(20) DEFAULT 'Unranked',
    points INTEGER DEFAULT 1000,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    win_streak INTEGER DEFAULT 0,
    is_ranked BOOLEAN DEFAULT FALSE,
    is_moderator BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    ninja_phrase TEXT DEFAULT 'Esse é o meu jeito ninja de ser!',
    favorite_characters JSONB DEFAULT '[]',
    privacy_settings JSONB DEFAULT '{"evaluation_visibility": "all"}',
    tutor_id UUID REFERENCES public.players(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_match_date DATE,
    immunity_until DATE
);

-- Tabela de avaliações
CREATE TABLE public.evaluations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
    evaluator_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed
    request_message TEXT,
    pin_score FLOAT CHECK (pin_score >= 0 AND pin_score <= 10),
    defense_score FLOAT CHECK (defense_score >= 0 AND defense_score <= 10),
    aerial_score FLOAT CHECK (aerial_score >= 0 AND aerial_score <= 10),
    kunai_score FLOAT CHECK (kunai_score >= 0 AND kunai_score <= 10),
    timing_score FLOAT CHECK (timing_score >= 0 AND timing_score <= 10),
    resource_score FLOAT CHECK (resource_score >= 0 AND resource_score <= 10),
    dash_score FLOAT CHECK (dash_score >= 0 AND dash_score <= 10),
    general_score FLOAT CHECK (general_score >= 0 AND general_score <= 10),
    tips TEXT,
    comments TEXT,
    initial_rank VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    evaluated_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de desafios
CREATE TABLE public.challenges (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    challenger_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
    challenged_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined, completed, expired
    match_type VARCHAR(20) DEFAULT 'FT5', -- FT5, FT7, FT10
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '3 days'),
    accepted_at TIMESTAMP WITH TIME ZONE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de partidas/resultados
CREATE TABLE public.matches (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE SET NULL,
    winner_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
    loser_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
    rounds_data JSONB, -- dados das rodadas, personagens usados, etc
    match_notes TEXT,
    evidence_url TEXT,
    winner_points_change INTEGER,
    loser_points_change INTEGER,
    played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de torneios
CREATE TABLE public.tournaments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    tournament_type VARCHAR(20) DEFAULT 'single_elimination', -- single_elimination, double_elimination, round_robin
    max_participants INTEGER DEFAULT 32,
    registration_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    registration_end TIMESTAMP WITH TIME ZONE NOT NULL,
    tournament_start TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'registration', -- registration, ongoing, completed, cancelled
    winner_id UUID REFERENCES public.players(id),
    prize_description TEXT,
    created_by UUID REFERENCES public.players(id) ON DELETE SET NULL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de participantes em torneios
CREATE TABLE public.tournament_participants (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
    registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    eliminated_at TIMESTAMP WITH TIME ZONE,
    final_position INTEGER,
    UNIQUE(tournament_id, player_id)
);

-- Habilitar RLS
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;

-- Políticas para players
CREATE POLICY "Players são visíveis por todos" ON public.players FOR SELECT USING (true);
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.players FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir seu próprio perfil" ON public.players FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para evaluations
CREATE POLICY "Avaliações são visíveis baseado na privacidade" ON public.evaluations FOR SELECT USING (true);
CREATE POLICY "Jogadores podem criar pedidos de avaliação" ON public.evaluations FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.players WHERE id = player_id AND user_id = auth.uid()));
CREATE POLICY "Moderadores podem atualizar avaliações" ON public.evaluations FOR UPDATE USING (EXISTS (SELECT 1 FROM public.players WHERE id = evaluator_id AND user_id = auth.uid() AND is_moderator = true));

-- Políticas para challenges
CREATE POLICY "Desafios são visíveis por participantes" ON public.challenges FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.players WHERE id = challenger_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.players WHERE id = challenged_id AND user_id = auth.uid())
);
CREATE POLICY "Jogadores podem criar desafios" ON public.challenges FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.players WHERE id = challenger_id AND user_id = auth.uid())
);
CREATE POLICY "Participantes podem atualizar desafios" ON public.challenges FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.players WHERE id = challenger_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.players WHERE id = challenged_id AND user_id = auth.uid())
);

-- Políticas para matches
CREATE POLICY "Partidas são visíveis por todos" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Participantes podem reportar resultados" ON public.matches FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.players WHERE id = winner_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.players WHERE id = loser_id AND user_id = auth.uid())
);

-- Políticas para tournaments
CREATE POLICY "Torneios são visíveis por todos" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Moderadores podem criar torneios" ON public.tournaments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.players WHERE id = created_by AND user_id = auth.uid() AND is_moderator = true)
);
CREATE POLICY "Criadores podem atualizar torneios" ON public.tournaments FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.players WHERE id = created_by AND user_id = auth.uid())
);

-- Políticas para tournament_participants
CREATE POLICY "Participações são visíveis por todos" ON public.tournament_participants FOR SELECT USING (true);
CREATE POLICY "Jogadores podem se inscrever" ON public.tournament_participants FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.players WHERE id = player_id AND user_id = auth.uid())
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON public.evaluations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON public.tournaments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
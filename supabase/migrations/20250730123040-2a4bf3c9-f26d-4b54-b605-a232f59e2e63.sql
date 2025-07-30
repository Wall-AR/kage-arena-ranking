-- Adicionar campos necessários na tabela players para o sistema de ranking
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS current_points INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS rank_level VARCHAR DEFAULT 'Unranked',
ADD COLUMN IF NOT EXISTS kage_title VARCHAR DEFAULT NULL,
ADD COLUMN IF NOT EXISTS promotion_series_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS promotion_series_wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS promotion_series_losses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_promotion_attempt DATE DEFAULT NULL;

-- Atualizar valores existentes de rank para rank_level
UPDATE public.players SET rank_level = rank WHERE rank IS NOT NULL;

-- Criar tabela para gerenciar avaliações completas
CREATE TABLE IF NOT EXISTS public.evaluation_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluation_id UUID NOT NULL REFERENCES public.evaluations(id),
  evaluator_id UUID NOT NULL,
  player_id UUID NOT NULL,
  
  -- Scores das 8 habilidades
  pin_score DECIMAL(3,1) CHECK (pin_score >= 0 AND pin_score <= 10),
  defense_score DECIMAL(3,1) CHECK (defense_score >= 0 AND defense_score <= 10),
  aerial_score DECIMAL(3,1) CHECK (aerial_score >= 0 AND aerial_score <= 10),
  kunai_score DECIMAL(3,1) CHECK (kunai_score >= 0 AND kunai_score <= 10),
  timing_score DECIMAL(3,1) CHECK (timing_score >= 0 AND timing_score <= 10),
  resource_score DECIMAL(3,1) CHECK (resource_score >= 0 AND resource_score <= 10),
  dash_score DECIMAL(3,1) CHECK (dash_score >= 0 AND dash_score <= 10),
  general_score DECIMAL(3,1) CHECK (general_score >= 0 AND general_score <= 10),
  
  -- Ranking inicial decidido pelo avaliador
  initial_rank VARCHAR NOT NULL,
  initial_points INTEGER NOT NULL,
  
  -- Resumo e dicas do avaliador
  evaluation_summary TEXT NOT NULL,
  tip_1 TEXT NOT NULL,
  tip_2 TEXT NOT NULL,
  tip_3 TEXT NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.evaluation_results ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para evaluation_results
CREATE POLICY "Resultados visíveis por participantes"
ON public.evaluation_results
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM players 
    WHERE (players.id = evaluation_results.player_id AND players.user_id = auth.uid())
  ) OR
  EXISTS (
    SELECT 1 FROM players 
    WHERE (players.id = evaluation_results.evaluator_id AND players.user_id = auth.uid())
  )
);

CREATE POLICY "Avaliadores podem inserir resultados"
ON public.evaluation_results
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM players 
    WHERE (players.id = evaluation_results.evaluator_id AND players.user_id = auth.uid() AND players.is_moderator = true)
  )
);

-- Criar tabela para histórico de mudanças de ranking
CREATE TABLE IF NOT EXISTS public.ranking_changes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL,
  old_rank VARCHAR,
  new_rank VARCHAR,
  old_points INTEGER,
  new_points INTEGER,
  change_reason VARCHAR NOT NULL, -- 'evaluation', 'match_win', 'match_loss', 'promotion_series'
  match_id UUID DEFAULT NULL,
  evaluation_id UUID DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.ranking_changes ENABLE ROW LEVEL SECURITY;

-- Política RLS para ranking_changes
CREATE POLICY "Mudanças de ranking visíveis por todos"
ON public.ranking_changes
FOR SELECT
USING (true);

-- Função para calcular pontos iniciais por rank
CREATE OR REPLACE FUNCTION public.get_initial_points_for_rank(rank_name VARCHAR)
RETURNS INTEGER AS $$
BEGIN
  CASE rank_name
    WHEN 'Genin' THEN RETURN 100;
    WHEN 'Chunnin' THEN RETURN 200;
    WHEN 'Jounnin' THEN RETURN 350;
    WHEN 'Anbu' THEN RETURN 450;
    WHEN 'Sanin' THEN RETURN 600;
    ELSE RETURN 100;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar títulos Kage (top 5)
CREATE OR REPLACE FUNCTION public.update_kage_titles()
RETURNS VOID AS $$
DECLARE
  top_players RECORD;
  kage_titles TEXT[] := ARRAY['Hokage', 'Kazekage', 'Mizukage', 'Raikage', 'Tsuchikage'];
  counter INTEGER := 1;
BEGIN
  -- Limpar títulos Kage existentes
  UPDATE public.players SET kage_title = NULL;
  
  -- Atribuir títulos aos top 5
  FOR top_players IN 
    SELECT id FROM public.players 
    WHERE is_ranked = true 
    ORDER BY current_points DESC, wins DESC 
    LIMIT 5
  LOOP
    UPDATE public.players 
    SET kage_title = kage_titles[counter]
    WHERE id = top_players.id;
    
    counter := counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_evaluation_results_updated_at
BEFORE UPDATE ON public.evaluation_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Atualizar pontos dos jogadores existentes baseado no rank
UPDATE public.players 
SET current_points = CASE 
  WHEN rank = 'Genin' THEN 100
  WHEN rank = 'Chunnin' THEN 200
  WHEN rank = 'Jounnin' THEN 350
  WHEN rank = 'Anbu' THEN 450
  WHEN rank = 'Sanin' THEN 600
  ELSE points
END
WHERE rank IS NOT NULL;
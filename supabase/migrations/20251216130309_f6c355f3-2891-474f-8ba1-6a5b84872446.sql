-- Add dispute/contestation table for tournament matches
CREATE TABLE public.tournament_disputes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.tournament_matches(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES public.players(id),
  dispute_reason TEXT NOT NULL,
  evidence_url TEXT,
  status VARCHAR NOT NULL DEFAULT 'pending', -- pending, resolved, dismissed
  resolution_notes TEXT,
  resolved_by UUID REFERENCES public.players(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tournament_disputes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for disputes
CREATE POLICY "Disputas são visíveis por participantes e moderadores"
ON public.tournament_disputes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tournament_matches tm
    JOIN tournament_participants tp ON (tp.id = tm.player1_id OR tp.id = tm.player2_id)
    JOIN players p ON p.id = tp.player_id
    WHERE tm.id = tournament_disputes.match_id AND p.user_id = auth.uid()
  )
  OR is_moderator(auth.uid())
);

CREATE POLICY "Participantes podem criar disputas"
ON public.tournament_disputes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM players WHERE id = tournament_disputes.reported_by AND user_id = auth.uid()
  )
);

CREATE POLICY "Moderadores podem atualizar disputas"
ON public.tournament_disputes
FOR UPDATE
USING (is_moderator(auth.uid()));

-- Add result confirmation fields to tournament_matches
ALTER TABLE public.tournament_matches 
ADD COLUMN IF NOT EXISTS reported_by UUID REFERENCES public.tournament_participants(id),
ADD COLUMN IF NOT EXISTS reported_winner_id UUID REFERENCES public.tournament_participants(id),
ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES public.tournament_participants(id),
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_disputed BOOLEAN DEFAULT false;

-- Create function to advance winner to next match
CREATE OR REPLACE FUNCTION public.advance_tournament_winner(
  p_match_id UUID,
  p_winner_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_match RECORD;
  v_next_match RECORD;
  v_slot INT;
BEGIN
  -- Get current match info
  SELECT * INTO v_match FROM tournament_matches WHERE id = p_match_id;
  
  IF v_match.next_match_id IS NOT NULL THEN
    -- Determine which slot (player1 or player2) in next match
    SELECT * INTO v_next_match FROM tournament_matches WHERE id = v_match.next_match_id;
    
    -- Find the slot based on bracket position
    IF v_match.bracket_position % 2 = 0 THEN
      UPDATE tournament_matches 
      SET player1_id = p_winner_id 
      WHERE id = v_match.next_match_id;
    ELSE
      UPDATE tournament_matches 
      SET player2_id = p_winner_id 
      WHERE id = v_match.next_match_id;
    END IF;
  END IF;
  
  -- Update winner's current match
  UPDATE tournament_participants 
  SET current_match_id = v_match.next_match_id 
  WHERE id = p_winner_id;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_tournament_disputes_updated_at
BEFORE UPDATE ON public.tournament_disputes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
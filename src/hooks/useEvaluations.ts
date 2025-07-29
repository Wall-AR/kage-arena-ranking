import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Evaluation {
  id: string;
  player_id: string;
  evaluator_id: string | null;
  status: string;
  request_message: string | null;
  created_at: string;
  players?: {
    id: string;
    name: string;
    avatar_url: string | null;
    rank: string;
    points: number;
    wins: number;
    losses: number;
    win_streak: number;
    is_ranked: boolean;
  };
}

export const useEvaluations = () => {
  const queryClient = useQueryClient();

  const { data: pendingEvaluations = [], isLoading: loading } = useQuery({
    queryKey: ['pending-evaluations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evaluations')
        .select(`
          *,
          players!evaluations_player_id_fkey(
            id,
            name,
            avatar_url,
            rank,
            points,
            wins,
            losses,
            win_streak,
            is_ranked
          )
        `)
        .eq('status', 'pending')
        .is('evaluator_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const acceptEvaluationMutation = useMutation({
    mutationFn: async ({ evaluationId, evaluatorId }: { evaluationId: string; evaluatorId: string }) => {
      // Atualizar a avaliação
      const { error: evalError } = await supabase
        .from('evaluations')
        .update({ 
          evaluator_id: evaluatorId,
          status: 'accepted'
        })
        .eq('id', evaluationId);

      if (evalError) throw evalError;

      // Buscar dados da avaliação para atualizar o tutor do jogador
      const { data: evaluation, error: getError } = await supabase
        .from('evaluations')
        .select('player_id')
        .eq('id', evaluationId)
        .single();

      if (getError) throw getError;

      // Atualizar o tutor do jogador
      const { error: playerError } = await supabase
        .from('players')
        .update({ tutor_id: evaluatorId })
        .eq('id', evaluation.player_id);

      if (playerError) throw playerError;

      return { evaluationId, evaluatorId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-evaluations'] });
      queryClient.invalidateQueries({ queryKey: ['player-profile'] });
    }
  });

  const acceptEvaluation = async (evaluationId: string, evaluatorId: string) => {
    return acceptEvaluationMutation.mutateAsync({ evaluationId, evaluatorId });
  };

  return {
    pendingEvaluations,
    loading,
    acceptEvaluation,
    isAccepting: acceptEvaluationMutation.isPending
  };
};
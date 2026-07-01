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
    queryKey: ["pending-evaluations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluations")
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
        .eq("status", "pending")
        .is("evaluator_id", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Evaluation[];
    }
  });

  const { data: acceptedEvaluations = [], isLoading: loadingAccepted } = useQuery({
    queryKey: ["accepted-evaluations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: currentPlayer } = await supabase
        .from("players")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!currentPlayer) return [];

      const { data, error } = await supabase
        .from("evaluations")
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
        .eq("status", "accepted")
        .eq("evaluator_id", currentPlayer.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Evaluation[];
    }
  });

  const acceptEvaluationMutation = useMutation({
    mutationFn: async ({ evaluationId, evaluatorId }: { evaluationId: string; evaluatorId: string }) => {
      const { error } = await supabase.rpc("accept_evaluation", {
        p_evaluation_id: evaluationId
      });

      if (error) throw error;
      return { evaluationId, evaluatorId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-evaluations"] });
      queryClient.invalidateQueries({ queryKey: ["accepted-evaluations"] });
      queryClient.invalidateQueries({ queryKey: ["player-profile"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  const acceptEvaluation = async (evaluationId: string, evaluatorId: string) => {
    return acceptEvaluationMutation.mutateAsync({ evaluationId, evaluatorId });
  };

  return {
    pendingEvaluations,
    acceptedEvaluations,
    loading,
    loadingAccepted,
    acceptEvaluation,
    isAccepting: acceptEvaluationMutation.isPending
  };
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface MatchReportInput {
  challengeId: string;
  winnerId: string;
  rounds: { round: number; winner: string }[];
  notes?: string;
  evidenceUrl?: string;
}

export const useMatches = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const reportMatch = useMutation({
    mutationFn: async (input: MatchReportInput) => {
      const { error } = await supabase.rpc("report_challenge_result", {
        p_challenge_id: input.challengeId,
        p_winner_id: input.winnerId,
        p_rounds: input.rounds,
        p_notes: input.notes ?? null,
        p_evidence_url: input.evidenceUrl ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Resultado reportado!",
        description: "Aguardando confirmação do oponente para validar.",
      });
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (e: Error) =>
      toast({ title: "Erro ao reportar", description: e.message, variant: "destructive" }),
  });

  return {
    reportMatch: reportMatch.mutate,
    isReporting: reportMatch.isPending,
  };
};

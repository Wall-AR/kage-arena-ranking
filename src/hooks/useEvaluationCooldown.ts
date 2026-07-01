import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useEvaluationCooldown = (playerId: string | undefined) => {
  return useQuery({
    queryKey: ['evaluation-cooldown', playerId],
    queryFn: async () => {
      if (!playerId) return { canRequest: true, nextRequestDate: null, reason: null as string | null };

      // Buscar a última avaliação do jogador
      const { data: lastEvaluation, error } = await supabase
        .from('evaluations')
        .select('created_at, status')
        .eq('player_id', playerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (!lastEvaluation) {
        return { canRequest: true, nextRequestDate: null, reason: null as string | null };
      }

      if (['pending', 'accepted'].includes(lastEvaluation.status || '')) {
        return {
          canRequest: false,
          nextRequestDate: null,
          lastRequestDate: lastEvaluation.created_at,
          activeStatus: lastEvaluation.status,
          reason: 'active'
        };
      }

      const lastRequestDate = new Date(lastEvaluation.created_at);
      const nextRequestDate = new Date(lastRequestDate);
      nextRequestDate.setDate(nextRequestDate.getDate() + 90);

      const canRequest = new Date() >= nextRequestDate;

      return {
        canRequest,
        nextRequestDate: nextRequestDate.toISOString(),
        lastRequestDate: lastRequestDate.toISOString(),
        reason: canRequest ? null : 'cooldown'
      };
    },
    enabled: !!playerId
  });
};

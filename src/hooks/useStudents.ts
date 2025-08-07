import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useStudents = (evaluatorId?: string) => {
  return useQuery({
    queryKey: ['students', evaluatorId],
    queryFn: async () => {
      if (!evaluatorId) throw new Error('Evaluator ID is required');
      
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          evaluations:evaluations!player_id(
            id,
            status,
            created_at,
            evaluated_at,
            pin_score,
            defense_score,
            aerial_score,
            kunai_score,
            timing_score,
            resource_score,
            dash_score,
            general_score,
            tips
          )
        `)
        .eq('tutor_id', evaluatorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!evaluatorId
  });
};

export const useEvaluationHistory = (evaluatorId?: string) => {
  return useQuery({
    queryKey: ['evaluation-history', evaluatorId],
    queryFn: async () => {
      if (!evaluatorId) throw new Error('Evaluator ID is required');
      
      const { data, error } = await supabase
        .from('evaluations')
        .select(`
          *,
          players:player_id(name, avatar_url, rank)
        `)
        .eq('evaluator_id', evaluatorId)
        .eq('status', 'completed')
        .order('evaluated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!evaluatorId
  });
};
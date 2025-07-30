import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useStudents = (evaluatorId?: string) => {
  return useQuery({
    queryKey: ['students', evaluatorId],
    queryFn: async () => {
      if (!evaluatorId) return [];
      
      const { data, error } = await supabase
        .from('players')
        .select(`
          id,
          name,
          avatar_url,
          rank_level,
          current_points,
          wins,
          losses,
          is_ranked,
          created_at,
          evaluations:evaluations!evaluations_player_id_fkey(
            id,
            status,
            created_at,
            evaluated_at,
            initial_rank,
            pin_score,
            defense_score,
            aerial_score,
            kunai_score,
            timing_score,
            resource_score,
            dash_score,
            general_score,
            tips,
            comments
          )
        `)
        .eq('tutor_id', evaluatorId)
        .eq('is_ranked', true)
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
      if (!evaluatorId) return [];
      
      const { data, error } = await supabase
        .from('evaluation_results')
        .select(`
          *,
          evaluations:evaluation_id(
            id,
            created_at,
            player_id
          ),
          players:player_id(
            id,
            name,
            avatar_url,
            rank_level,
            current_points
          )
        `)
        .eq('evaluator_id', evaluatorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!evaluatorId
  });
};
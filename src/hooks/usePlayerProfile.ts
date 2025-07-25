import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePlayerProfile = (userId?: string) => {
  return useQuery({
    queryKey: ['player-profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      
      const { data: player, error } = await supabase
        .from('players')
        .select(`
          *,
          evaluations:evaluations(
            *,
            evaluator:evaluator_id(name, avatar_url, ninja_phrase)
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return player;
    },
    enabled: !!userId
  });
};

export const useCreatePlayer = () => {
  return async (userData: { name: string; user_id: string }) => {
    const { data, error } = await supabase
      .from('players')
      .insert(userData)
      .select()
      .single();

    if (error) throw error;
    return data;
  };
};
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePlayerProfile = (id?: string) => {
  return useQuery({
    queryKey: ['player-profile', id],
    queryFn: async () => {
      if (!id) throw new Error('User or Player ID is required');
      
      const { data: player, error } = await supabase
        .from('players')
        .select(`
          *,
          evaluations:evaluations(
            *,
            evaluator:evaluator_id(name, avatar_url, ninja_phrase)
          )
        `)
        .or(`user_id.eq.${id},id.eq.${id}`)
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return player;
    },
    enabled: !!id
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
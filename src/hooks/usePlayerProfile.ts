import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const usePlayerProfile = (id?: string) => {
  return useQuery({
    queryKey: ['player-profile', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data: player, error } = await supabase
        .from('players')
        .select(`
          *,
          evaluations:evaluations!evaluations_player_id_fkey(
            *,
            evaluator:players!evaluations_evaluator_id_fkey(name, avatar_url, ninja_phrase)
          )
        `)
        .or(`user_id.eq.${id},id.eq.${id}`)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar player profile:', error);
        throw error;
      }

      if (!player) {
        const { data: { user } } = await supabase.auth.getUser();

        if (user?.id === id) {
          const { data: ensuredPlayer, error: ensureError } = await supabase
            .rpc("ensure_player_profile");

          if (ensureError) {
            console.error('Erro ao criar player profile:', ensureError);
            throw ensureError;
          }

          return ensuredPlayer as Tables<"players">;
        }
      }

      return player;
    },
    enabled: !!id
  });
};

export const useCreatePlayer = () => {
  return async (userData: { name: string; user_id: string }) => {
    const { data, error } = await supabase.rpc("ensure_player_profile");

    if (error) throw error;
    const ensuredPlayer = data as Tables<"players">;

    if (userData.name && ensuredPlayer?.name !== userData.name) {
      const { data: updatedPlayer, error: updateError } = await supabase
        .from("players")
        .update({ name: userData.name })
        .eq("user_id", userData.user_id)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedPlayer;
    }

    return ensuredPlayer;
  };
};

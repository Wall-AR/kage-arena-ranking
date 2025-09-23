import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProfileCooldown = (userId?: string) => {
  return useQuery({
    queryKey: ['profile-cooldown', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data: canUpdate, error: canUpdateError } = await supabase
        .rpc('can_update_profile_settings', { user_id: userId });
      
      if (canUpdateError) throw canUpdateError;
      
      // Buscar última atualização para calcular próxima data disponível
      const { data: player, error } = await supabase
        .from('players')
        .select('last_profile_update')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      let nextUpdateDate = null;
      if (player?.last_profile_update && !canUpdate) {
        const lastUpdate = new Date(player.last_profile_update);
        nextUpdateDate = new Date(lastUpdate.getTime() + (33 * 24 * 60 * 60 * 1000)); // 33 dias
      }
      
      return {
        canUpdate,
        lastUpdate: player?.last_profile_update,
        nextUpdateDate
      };
    },
    enabled: !!userId
  });
};
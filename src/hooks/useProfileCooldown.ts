import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProfileCooldown = (userId?: string) => {
  return useQuery({
    queryKey: ['profile-cooldown', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      console.log('🔍 Verificando cooldown para userId:', userId);
      
      const { data: canUpdate, error: canUpdateError } = await supabase
        .rpc('can_update_profile_settings', { user_id: userId });
      
      console.log('✅ can_update_profile_settings resultado:', { canUpdate, error: canUpdateError });
      
      if (canUpdateError) {
        console.error('❌ Erro ao verificar cooldown:', canUpdateError);
        throw canUpdateError;
      }
      
      // Buscar última atualização para calcular próxima data disponível
      const { data: player, error } = await supabase
        .from('players')
        .select('last_profile_update')
        .eq('user_id', userId)
        .single();
      
      console.log('📊 Player data:', { player, error });
      
      if (error) {
        console.error('❌ Erro ao buscar player:', error);
        throw error;
      }
      
      let nextUpdateDate = null;
      if (player?.last_profile_update && !canUpdate) {
        const lastUpdate = new Date(player.last_profile_update);
        nextUpdateDate = new Date(lastUpdate.getTime() + (33 * 24 * 60 * 60 * 1000)); // 33 dias
        console.log('📅 Próxima atualização:', nextUpdateDate);
      }
      
      const result = {
        canUpdate: canUpdate ?? true, // Se null, permitir atualização
        lastUpdate: player?.last_profile_update,
        nextUpdateDate
      };
      
      console.log('🎯 Resultado final:', result);
      
      return result;
    },
    enabled: !!userId
  });
};
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useBanners = () => {
  return useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });
};

export const usePlayerBanners = (playerId?: string) => {
  return useQuery({
    queryKey: ['player-banners', playerId],
    queryFn: async () => {
      if (!playerId) return [];

      const { data, error } = await supabase
        .from('player_banners')
        .select(`*, banner:banners(*)`)
        .eq('player_id', playerId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!playerId
  });
};

/**
 * Retorna IDs dos banners que o jogador pode usar atualmente:
 * - desbloqueados manualmente (conquistas/códigos/eventos)
 * - banners de personagem em que ele é TOP 1 no momento
 */
export const useAvailableBanners = (playerId?: string) => {
  return useQuery({
    queryKey: ['available-banners', playerId],
    queryFn: async () => {
      if (!playerId) return [] as Array<{ banner_id: string; source: string }>;
      const { data, error } = await supabase.rpc('get_player_available_banners', {
        p_player_id: playerId,
      });
      if (error) throw error;
      return (data || []) as Array<{ banner_id: string; source: string }>;
    },
    enabled: !!playerId,
    staleTime: 1000 * 60, // 1 min
  });
};

export const useSelectBanner = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ playerId, bannerId }: { playerId: string; bannerId: string | null }) => {
      const { data, error } = await supabase
        .from('players')
        .update({ selected_banner_id: bannerId })
        .eq('id', playerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentPlayer'] });
      queryClient.invalidateQueries({ queryKey: ['ranked-players'] });
      queryClient.invalidateQueries({ queryKey: ['top-players'] });
      queryClient.invalidateQueries({ queryKey: ['banner-image'] });
      toast({
        title: "Banner atualizado!",
        description: "Seu banner foi alterado com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error('Error selecting banner:', error);
      toast({
        title: "Erro ao selecionar banner",
        description: error?.message || "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  });
};

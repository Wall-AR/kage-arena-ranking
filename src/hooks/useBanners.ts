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
        .select(`
          *,
          banner:banners(*)
        `)
        .eq('player_id', playerId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!playerId
  });
};

export const useSelectBanner = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ playerId, bannerId }: { playerId: string; bannerId: string }) => {
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
      toast({
        title: "Banner atualizado!",
        description: "Seu banner foi alterado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error selecting banner:', error);
      toast({
        title: "Erro ao selecionar banner",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  });
};

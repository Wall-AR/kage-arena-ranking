import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: "trophy" | "medal" | "star" | "crown" | "shield" | "fire" | "target" | "zap" | "award";
  color: "gold" | "silver" | "bronze" | "primary" | "accent" | "success" | "warning" | "destructive";
}

export const useAchievements = () => {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });
};

export const usePlayerAchievements = (playerId?: string) => {
  return useQuery({
    queryKey: ['player-achievements', playerId],
    queryFn: async () => {
      if (!playerId) return [];
      
      const { data, error } = await supabase
        .from('player_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('player_id', playerId)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!playerId
  });
};

export const useRedeemCode = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ playerId, code }: { playerId: string; code: string }) => {
      const { data, error } = await supabase.rpc('redeem_code', {
        p_player_id: playerId,
        p_code: code
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['player-achievements'] });
        queryClient.invalidateQueries({ queryKey: ['player-banners'] });
        
        let message = data.message;
        if (data.banner_unlocked && data.achievement_unlocked) {
          message += ' Você desbloqueou um novo banner e uma conquista!';
        } else if (data.banner_unlocked) {
          message += ' Você desbloqueou um novo banner!';
        } else if (data.achievement_unlocked) {
          message += ' Você desbloqueou uma nova conquista!';
        }
        
        toast({
          title: "Código resgatado!",
          description: message,
        });
      } else {
        toast({
          title: "Erro ao resgatar código",
          description: data.message,
          variant: "destructive"
        });
      }
    },
    onError: (error) => {
      console.error('Error redeeming code:', error);
      toast({
        title: "Erro ao resgatar código",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  });
};

export const useUpdateDisplayedAchievements = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      playerId, 
      achievementIds 
    }: { 
      playerId: string; 
      achievementIds: string[];
    }) => {
      // Primeiro, remover todos os displays
      await supabase
        .from('player_achievements')
        .update({ is_displayed: false, display_order: null })
        .eq('player_id', playerId);

      // Depois, marcar os selecionados
      if (achievementIds.length > 0) {
        const updates = achievementIds.map((id, index) => 
          supabase
            .from('player_achievements')
            .update({ is_displayed: true, display_order: index })
            .eq('player_id', playerId)
            .eq('achievement_id', id)
        );

        await Promise.all(updates);
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-achievements'] });
      queryClient.invalidateQueries({ queryKey: ['player-profile'] });
      toast({
        title: "Conquistas atualizadas!",
        description: "Suas conquistas foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error updating achievements:', error);
      toast({
        title: "Erro ao atualizar conquistas",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  });
};

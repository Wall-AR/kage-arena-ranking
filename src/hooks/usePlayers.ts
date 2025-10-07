import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Achievement } from "@/hooks/useAchievements";

export interface Player {
  id: string;
  name: string;
  rank: string;
  position?: number;
  points: number;
  current_points: number;
  wins: number;
  losses: number;
  win_streak: number;
  winRate?: number;
  lastMatch?: string;
  favoriteCharacters?: string[];
  achievements?: string[];
  selected_achievements?: Achievement[];
  isImmune?: boolean;
  avatar?: string;
  avatar_url?: string;
  user_id: string;
  is_ranked: boolean;
  is_moderator: boolean;
  is_admin: boolean;
  role: string;
  kage_title?: string;
  ninja_phrase?: string;
  rank_level?: string;
  selected_banner_id?: string | null;
}

// Hook para buscar todos os players rankeados
export const useRankedPlayers = () => {
  return useQuery({
    queryKey: ['ranked-players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('is_ranked', true)
        .order('current_points', { ascending: false });
      
      if (error) throw error;
      
      return data?.map((player, index) => ({
        ...player,
        position: index + 1,
        winRate: player.wins + player.losses > 0 ? 
          Number(((player.wins / (player.wins + player.losses)) * 100).toFixed(1)) : 0,
        lastMatch: player.last_match_date || "Nunca",
        favoriteCharacters: Array.isArray(player.favorite_characters) ? 
          player.favorite_characters.filter(char => typeof char === 'string') : [],
        achievements: [],
        selected_achievements: Array.isArray(player.selected_achievements) ? 
          player.selected_achievements as unknown as Achievement[] : [],
        isImmune: player.immunity_until ? new Date(player.immunity_until) > new Date() : false,
        avatar: player.avatar_url || "/placeholder.svg"
      })) || [];
    }
  });
};

// Hook para buscar top players (usado na homepage)
export const useTopPlayers = (limit: number = 3) => {
  return useQuery({
    queryKey: ['top-players', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('is_ranked', true)
        .order('current_points', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return data?.map((player, index) => ({
        ...player,
        position: index + 1,
        winRate: player.wins + player.losses > 0 ? 
          Number(((player.wins / (player.wins + player.losses)) * 100).toFixed(1)) : 0,
        lastMatch: player.last_match_date || "Nunca",
        favoriteCharacters: Array.isArray(player.favorite_characters) ? 
          player.favorite_characters.filter(char => typeof char === 'string') : [],
        achievements: [],
        selected_achievements: Array.isArray(player.selected_achievements) ? 
          player.selected_achievements as unknown as Achievement[] : [],
        isImmune: player.immunity_until ? new Date(player.immunity_until) > new Date() : false,
        avatar: player.avatar_url || "/placeholder.svg"
      })) || [];
    }
  });
};

// Hook para atualizar role do player (admin apenas)
export const useUpdatePlayerRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ playerId, role }: { playerId: string, role: 'admin' | 'moderator' | 'player' }) => {
      const updates: any = { role };
      
      if (role === 'admin') {
        updates.is_admin = true;
        updates.is_moderator = true;
      } else if (role === 'moderator') {
        updates.is_admin = false;
        updates.is_moderator = true;
      } else {
        updates.is_admin = false;
        updates.is_moderator = false;
      }

      const { error } = await supabase
        .from('players')
        .update(updates)
        .eq('id', playerId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Cargo atualizado!",
        description: `Jogador agora é ${variables.role === 'admin' ? 'Administrador' : variables.role === 'moderator' ? 'Avaliador' : 'Jogador'}.`,
      });
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['ranked-players'] });
      queryClient.invalidateQueries({ queryKey: ['top-players'] });
    },
    onError: (error) => {
      console.error('Error updating player role:', error);
      toast({
        title: "Erro ao atualizar cargo",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  });
};
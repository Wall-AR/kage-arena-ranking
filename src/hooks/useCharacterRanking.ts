import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCharacterRanking = () => {
  return useQuery({
    queryKey: ['character-ranking'],
    queryFn: async () => {
      const { data: players, error } = await supabase
        .from('players')
        .select('id, favorite_characters, current_points, name')
        .eq('is_ranked', true)
        .order('current_points', { ascending: false });

      if (error) throw error;

      // Criar ranking por personagem
      const characterRankings: Record<string, Array<{
        playerId: string;
        playerName: string;
        points: number;
        position: number;
      }>> = {};

      players?.forEach((player, playerIndex) => {
        const favoriteChars = Array.isArray(player.favorite_characters) 
          ? player.favorite_characters 
          : [];
        
        favoriteChars.forEach((character: string) => {
          if (!characterRankings[character]) {
            characterRankings[character] = [];
          }
          
          characterRankings[character].push({
            playerId: player.id,
            playerName: player.name,
            points: player.current_points || 0,
            position: playerIndex + 1
          });
        });
      });

      // Ordenar cada ranking de personagem por pontos (maior para menor)
      Object.keys(characterRankings).forEach(character => {
        characterRankings[character].sort((a, b) => b.points - a.points);
        // Adicionar posição no ranking do personagem
        characterRankings[character].forEach((entry, index) => {
          entry.position = index + 1;
        });
      });

      return characterRankings;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const getPlayerCharacterRanking = (
  characterRankings: Record<string, any[]>, 
  playerId: string, 
  character: string
) => {
  const ranking = characterRankings[character];
  if (!ranking) return null;
  
  const playerEntry = ranking.find(entry => entry.playerId === playerId);
  return playerEntry ? playerEntry.position : null;
};
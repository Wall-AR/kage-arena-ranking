import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCharacterImages = () => {
  return useQuery({
    queryKey: ['character-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('character_images')
        .select('*')
        .order('character_name');

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
};

export const getCharacterImageUrl = (characterName: string, characterImages: any[] = []) => {
  const character = characterImages.find(char => char.character_name === characterName);
  // Fallback para placeholder enquanto não temos as imagens reais
  return character?.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${characterName}`;
};
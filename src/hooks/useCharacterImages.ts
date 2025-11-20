import { useQuery } from "@tanstack/react-query";

export const useCharacterImages = () => {
  return useQuery({
    queryKey: ['character-images'],
    queryFn: async () => {
      // Retornar array vazio já que a tabela character_images não existe mais
      return [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
};

export const getCharacterImageUrl = (characterName: string, characterImages: any[] = []) => {
  const character = characterImages.find(char => char.character_name === characterName);
  // Fallback para placeholder enquanto não temos as imagens reais
  return character?.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${characterName}`;
};
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useProfileUpdate = () => {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateProfile = useMutation({
    mutationFn: async (data: {
      playerId: string;
      updates: {
        name?: string;
        ninja_phrase?: string;
        avatar_url?: string;
        favorite_characters?: string[];
        privacy_settings?: any;
      };
    }) => {
      const { error } = await supabase
        .from('players')
        .update(data.updates)
        .eq('id', data.playerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-profile'] });
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  });

  const uploadAvatar = async (file: File, userId: string): Promise<string> => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Remove arquivo anterior se existir
      await supabase.storage.from('avatars').remove([fileName]);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return publicUrl;
    } finally {
      setUploading(false);
    }
  };

  return {
    updateProfile: updateProfile.mutate,
    isUpdating: updateProfile.isPending,
    uploadAvatar,
    uploading
  };
};

// Lista de personagens do jogo
export const NARUTO_CHARACTERS = [
  "Naruto Uzumaki",
  "Sasuke Uchiha", 
  "Sakura Haruno",
  "Kakashi Hatake",
  "Rock Lee",
  "Neji Hyuga",
  "Tenten",
  "Might Guy",
  "Gaara",
  "Temari",
  "Kankuro",
  "Itachi Uchiha",
  "Kisame Hoshigaki",
  "Deidara",
  "Sasori",
  "Hidan",
  "Kakuzu",
  "Pain/Nagato",
  "Konan",
  "Orochimaru",
  "Kabuto Yakushi",
  "Jiraiya",
  "Tsunade",
  "Minato Namikaze",
  "Kushina Uzumaki",
  "Hashirama Senju",
  "Tobirama Senju",
  "Madara Uchiha",
  "Obito Uchiha",
  "Zetsu",
  "Kaguya Otsutsuki",
  "Shikamaru Nara",
  "Ino Yamanaka",
  "Choji Akimichi",
  "Asuma Sarutobi",
  "Kurenai Yuhi",
  "Hinata Hyuga",
  "Kiba Inuzuka",
  "Shino Aburame",
  "Killer Bee",
  "A (Raikage)",
  "Onoki",
  "Mei Terumi"
];
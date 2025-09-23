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
      userId: string;
      updates: {
        ninja_phrase?: string;
        avatar_url?: string;
        favorite_characters?: string[];
        privacy_settings?: any;
        updateProfileSettings?: boolean; // Flag para indicar se está atualizando frase/personagens
        last_profile_update?: string;
      };
    }) => {
      // Se está atualizando configurações de perfil, verificar cooldown
      if (data.updates.updateProfileSettings) {
        const { data: canUpdate, error: canUpdateError } = await supabase
          .rpc('can_update_profile_settings', { user_id: data.userId });
        
        if (canUpdateError) throw canUpdateError;
        if (!canUpdate) {
          throw new Error('Você só pode alterar essas configurações uma vez a cada 33 dias.');
        }
        
        // Atualizar com timestamp
        const updateData = { ...data.updates };
        delete updateData.updateProfileSettings;
        updateData.last_profile_update = new Date().toISOString();
        
        const { data: result, error } = await supabase
          .from('players')
          .update(updateData)
          .eq('user_id', data.userId)
          .select()
          .single();
        
        if (error) throw error;
        return result;
      } else {
        // Atualização normal (sem cooldown)
        const updateData = { ...data.updates };
        delete updateData.updateProfileSettings;
        
        const { data: result, error } = await supabase
          .from('players')
          .update(updateData)
          .eq('user_id', data.userId)
          .select()
          .single();
        
        if (error) throw error;
        return result;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['player-profile', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['currentPlayer', variables.userId] });
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : "Tente novamente em alguns instantes.";
      toast({
        title: "Erro ao atualizar perfil",
        description: errorMessage,
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

// Lista completa de personagens do jogo - 84 personagens
export const NARUTO_CHARACTERS = [
  "Naruto Uzumaki",
  "Naruto Shippūden",  
  "Sasuke Uchiha",
  "Sasuke Shippūden",
  "Sakura Haruno",
  "Sakura Haruno Shippūden", 
  "Kakashi Hatake", 
  "Rock Lee",
  "Rock Lee Modo Punho Zonzo",
  "Rock Lee Shippūden",  
  "Neji Hyuuga", 
  "Neji Hyuuga Shippūden", 
  "Tenten Shippūden",
  "Tenten",
  "Might Guy", 
  "Shikamaru Nara",  
  "Shikamaru Nara Shippūden",
  "Chouji Akimichi",
  "Chouji Akimichi Shippūden", 
  "Ino Yamanaka",
  "Ino Yamanaka Shippūden",  
  "Asuma Sarutobi", 
  "Shino Aburame", 
  "Shino Aburame Shippūden",
  "Kiba Inuzuka",
  "Kiba Inuzuka Shippūden", 
  "Hinata Hyuuga",
  "Hinata Hyuuga Shippūden",  
  "Kurenai Yuuhi", 
  "Gaara",
  "Gaara Shippūden",  
  "Kankurou",
  "Kankurou Shippūden",  
  "Temari",
  "Temari Shippūden", 
  "Vovó Chiyo",
  "Vovó Chiyo Taijutsu",
  "Vovó Chiyo Mestre das Marionetes",
  "Itachi Uchiha", 
  "Kisame Hoshigaki",
  "Deidara",
  "Sasori",
  "Hiruko", 
  "Terceiro Kazekage", 
  "Sai", 
  "Yamato", 
  "Jiraiya", 
  "Tsunade", 
  "Shizune", 
  "Orochimaru", 
  "Kabuto Yakushi", 
  "Jiroubou", 
  "Kidoumaru",  
  "Sakon e Ukon", 
  "Tayuya",
  "Kimimaro",
  "Hashirama Senju",
  "Tobirama Senju", 
  "Hiruzen Sarutobi", 
  "Minato Namikaze", 
  "Hanabi Hyuuga",
  "Konohamaru",
  "Anko Mitarashi", 
  "Haku", 
  "Zabuza Momochi"
];
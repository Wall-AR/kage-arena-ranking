import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfileUpdate } from "@/hooks/useProfile";

interface AvatarUploadProps {
  currentAvatar: string;
  playerName: string;
  userId: string;
  playerId: string;
  onAvatarUpdate: (url: string) => void;
}

export const AvatarUpload = ({ 
  currentAvatar, 
  playerName, 
  userId, 
  playerId,
  onAvatarUpdate 
}: AvatarUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { uploadAvatar, uploading, updateProfile } = useProfileUpdate();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive"
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive"
      });
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload da imagem
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    try {
      const avatarUrl = await uploadAvatar(file, userId);
      
      // Atualizar o perfil com a nova URL do avatar
      updateProfile({
        playerId,
        updates: { avatar_url: avatarUrl }
      });

      onAvatarUpdate(avatarUrl);
      setPreview(null);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload da imagem.",
        variant: "destructive"
      });
      setPreview(null);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="w-24 h-24 ring-4 ring-primary/20">
          <AvatarImage 
            src={preview || currentAvatar} 
            alt={playerName}
          />
          <AvatarFallback className="text-2xl font-bold bg-primary/20 text-primary">
            {playerName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        {uploading && (
          <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Alterar Avatar
          </>
        )}
      </Button>
    </div>
  );
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Target, Flame, Shield, Settings, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfileHeaderProps {
  player: {
    name: string;
    rank: string;
    points: number;
    avatar?: string;
    avatar_url?: string;
    ninjaPhrase: string;
    achievements: string[];
    isRanked: boolean;
    isAdmin?: boolean;
    isModerator?: boolean;
    role?: string;
    wins?: number;
    losses?: number;
    winStreak?: number;
    selected_banner_id?: string | null;
    kage_title?: string | null;
    current_points?: number;
    win_streak?: number;
  };
  rankColor: string;
  onRequestEvaluation?: () => void;
}

export const ProfileHeader = ({ player, rankColor, onRequestEvaluation }: ProfileHeaderProps) => {
  const { data: bannerUrl } = useQuery({
    queryKey: ['banner-image', player.selected_banner_id],
    queryFn: async () => {
      if (!player.selected_banner_id) return null;
      
      const { data: banner } = await supabase
        .from('banners')
        .select('image_url')
        .eq('id', player.selected_banner_id)
        .single();
      
      return banner?.image_url || null;
    },
    enabled: !!player.selected_banner_id
  });

  const getAchievementIcon = (achievement: string) => {
    const icons = {
      'champion': Trophy,
      'undefeated': Target,
      'veteran': Shield,
      'streak': Flame
    };
    return icons[achievement as keyof typeof icons] || Trophy;
  };

  return (
    <Card className="relative overflow-hidden border-border/50 mb-8">
      {/* Banner de Fundo */}
      <div className="absolute inset-0">
        {bannerUrl ? (
          <img 
            src={bannerUrl} 
            alt="Profile banner" 
            className="w-full h-full object-cover opacity-40"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className={cn(
                "w-24 h-24 ring-4 transition-all duration-300 hover:scale-105",
                !player.isRanked ? "ring-muted/30 grayscale" : `ring-${rankColor}/60`
              )}>
                <AvatarImage 
                  src={player.avatar_url || player.avatar || "/placeholder.svg"} 
                  alt={player.name} 
                  className="object-cover"
                />
                <AvatarFallback className={cn(
                  "text-2xl font-bold transition-all duration-300",
                  !player.isRanked 
                    ? "bg-muted/20 text-muted-foreground" 
                    : `bg-${rankColor}/20 text-${rankColor}`
                )}>
                  {player.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              {!player.isRanked && (
                <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-muted rounded-full animate-pulse" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="font-ninja text-3xl font-bold text-foreground transition-all duration-300 hover:text-accent">
                  {player.name}
                </h1>
                {player.kage_title && (
                  <Badge className="bg-ninja-kage/20 text-ninja-kage border-ninja-kage/30">
                    {player.kage_title}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-3 mb-3">
                {/* Ranking e Classe */}
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className={cn(
                    "text-base px-3 py-1 font-bold transition-all duration-300",
                    !player.isRanked 
                      ? "bg-muted/20 text-muted-foreground border-muted/30" 
                      : `bg-${rankColor}/20 text-${rankColor} border-${rankColor}/30`
                  )}>
                    {player.isRanked ? player.rank : "Não Rankeado"}
                  </Badge>
                  
                  {/* Separador e tipo de usuário */}
                  {player.isRanked && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className={cn(
                        "text-sm font-medium",
                        player.isAdmin 
                          ? "text-destructive" 
                          : player.isModerator 
                            ? "text-accent" 
                            : "text-foreground"
                      )}>
                        {player.isAdmin 
                          ? "Admin" 
                          : player.isModerator 
                            ? "Moderador" 
                            : "Jogador"}
                      </span>
                    </>
                  )}
                </div>
                
                {/* Badges adicionais para destaque */}
                {player.isAdmin && (
                  <Badge variant="destructive" className="text-xs px-2 py-0.5">
                    <Shield className="w-3 h-3 mr-1" />
                    ADMIN
                  </Badge>
                )}
                
                {player.isModerator && !player.isAdmin && (
                  <Badge variant="outline" className="text-xs border-accent text-accent px-2 py-0.5">
                    <Settings className="w-3 h-3 mr-1" />
                    MOD
                  </Badge>
                )}
              </div>
              
              <p className={cn(
                "italic text-sm leading-relaxed transition-all duration-300 max-w-md",
                !player.isRanked ? "text-muted-foreground/60" : "text-muted-foreground"
              )}>
                "{player.ninjaPhrase}"
              </p>
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <div className={cn(
              "text-4xl font-ninja font-bold mb-1 transition-all duration-300",
              !player.isRanked ? "text-muted-foreground/50" : "text-accent"
            )}>
              {player.isRanked ? (player.current_points || player.points) : "???"}
            </div>
            <div className="text-sm text-muted-foreground mb-2">pontos</div>
            
            {/* Informações adicionais para jogadores rankeados */}
            {player.isRanked && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-3 h-3" />
                  <span>{player.wins}V - {player.losses}D</span>
                </div>
                {(player.win_streak || player.winStreak || 0) > 0 && (
                  <div className="flex items-center space-x-2 text-accent">
                    <Flame className="w-3 h-3" />
                    <span>{player.win_streak || player.winStreak} vitórias seguidas</span>
                  </div>
                )}
              </div>
            )}
            
            {!player.isRanked && onRequestEvaluation && (
              <Button 
                onClick={onRequestEvaluation}
                className="mt-4 bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-white shadow-ninja"
              >
                <Star className="w-4 h-4 mr-2" />
                Solicitar Avaliação
              </Button>
            )}
          </div>
        </div>

        {/* Conquistas */}
        {player.isRanked && player.achievements && player.achievements.length > 0 && (
          <div className="flex items-center space-x-2 mt-6">
            <span className="text-sm text-muted-foreground mr-2">Conquistas:</span>
            {player.achievements.map((achievement, index) => {
              const Icon = getAchievementIcon(achievement);
              return (
                <div key={index} className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110",
                  `bg-${rankColor}/20 text-${rankColor}`
                )}>
                  <Icon className="w-4 h-4" />
                </div>
              );
            })}
          </div>
        )}

        {/* Overlay para jogadores não rankeados */}
        {!player.isRanked && (
          <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] rounded-xl flex items-center justify-center pointer-events-none z-20">
            <div className="text-center text-muted-foreground/80">
              <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold">Perfil na Sombra</p>
              <p className="text-sm">Solicite uma avaliação para revelar seu verdadeiro poder</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

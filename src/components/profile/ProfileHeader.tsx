import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Target, Flame, Shield, Settings, Star } from "lucide-react";
import { cn } from "@/lib/utils";

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
  };
  rankColor: string;
  onRequestEvaluation?: () => void;
}

export const ProfileHeader = ({ player, rankColor, onRequestEvaluation }: ProfileHeaderProps) => {
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
    <div className="bg-gradient-card rounded-xl p-8 border border-border/50 mb-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="relative z-10">
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

            <div>
              <h1 className="font-ninja text-3xl font-bold text-foreground mb-2 transition-all duration-300 hover:text-accent">
                {player.name}
              </h1>
              
              <Badge variant="secondary" className={cn(
                "text-lg px-4 py-2 font-bold mb-3 transition-all duration-300",
                !player.isRanked 
                  ? "bg-muted/20 text-muted-foreground border-muted/30" 
                  : `bg-${rankColor}/20 text-${rankColor} border-${rankColor}/30`
              )}>
                {player.isRanked ? player.rank : "Não Rankeado"}
              </Badge>
              
              <p className={cn(
                "italic transition-all duration-300",
                !player.isRanked ? "text-muted-foreground/60" : "text-muted-foreground"
              )}>
                "{player.ninjaPhrase}"
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className={cn(
              "text-4xl font-ninja font-bold mb-1 transition-all duration-300",
              !player.isRanked ? "text-muted-foreground/50" : "text-accent"
            )}>
              {player.isRanked ? player.points : "???"}
            </div>
            <div className="text-sm text-muted-foreground">pontos</div>
            
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
        {player.isRanked && (
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
          <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] rounded-xl flex items-center justify-center pointer-events-none">
            <div className="text-center text-muted-foreground/80">
              <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold">Perfil na Sombra</p>
              <p className="text-sm">Solicite uma avaliação para revelar seu verdadeiro poder</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
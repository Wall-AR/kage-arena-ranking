import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Sword, Shield, Flame, Star, Users, Medal, Crown, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useCharacterImages, getCharacterImageUrl } from "@/hooks/useCharacterImages";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Achievement } from "@/hooks/useAchievements";
import { useCharacterRanking, getPlayerCharacterRanking } from "@/hooks/useCharacterRanking";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Player {
  id: string;
  name: string;
  rank: string;
  rank_level?: string;
  kage_title?: string | null;
  current_points: number;
  wins: number;
  losses: number;
  win_streak: number;
  position: number;
  winRate: number;
  lastMatch: string;
  favoriteCharacters: string[];
  isImmune: boolean;
  avatar: string;
  avatar_url?: string;
  selected_banner_id?: string | null;
  selected_achievements?: Achievement[];
}

interface RankingCardProps {
  player: Player;
}

const RankingCard = ({ player }: RankingCardProps) => {
  const { data: characterImages = [] } = useCharacterImages();
  const { data: characterRankings = {} } = useCharacterRanking();

  const getAchievementIcon = (iconType: Achievement['icon']) => {
    const iconMap = {
      trophy: Trophy,
      medal: Medal,
      star: Star,
      crown: Crown,
      shield: Shield,
      fire: Flame,
      target: Target,
      zap: Zap,
    };
    return iconMap[iconType];
  };

  const getAchievementColorClasses = (color: Achievement['color']) => {
    const colorMap = {
      gold: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
      silver: "bg-gray-400/20 text-gray-600 border-gray-400/30",
      bronze: "bg-amber-600/20 text-amber-700 border-amber-600/30",
      primary: "bg-primary/20 text-primary border-primary/30",
      accent: "bg-accent/20 text-accent border-accent/30",
      success: "bg-green-500/20 text-green-600 border-green-500/30",
      warning: "bg-orange-500/20 text-orange-600 border-orange-500/30",
      destructive: "bg-red-500/20 text-red-600 border-red-500/30",
    };
    return colorMap[color];
  };

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

  const getRankIcon = (rank: string) => {
    const icons = {
      'Kage': Trophy,
      'Sannin': Star,
      'Anbu': Sword,
      'Jounin': Shield,
      'Chunin': Users,
      'Genin': Flame
    };
    return icons[rank as keyof typeof icons] || Users;
  };

  const getRankColor = (rank: string) => {
    const colors = {
      'Kage': 'text-ninja-kage',
      'Sannin': 'text-ninja-sannin',
      'Anbu': 'text-ninja-anbu',
      'Jounin': 'text-ninja-jounin',
      'Chunin': 'text-ninja-chunin',
      'Genin': 'text-ninja-genin'
    };
    return colors[rank as keyof typeof colors] || 'text-muted-foreground';
  };

  const getPositionBadge = (position: number) => {
    if (position === 1) return <Badge className="bg-ninja-kage text-background">🥇 1º</Badge>;
    if (position === 2) return <Badge className="bg-ninja-sannin text-background">🥈 2º</Badge>;
    if (position === 3) return <Badge className="bg-ninja-anbu text-background">🥉 3º</Badge>;
    return <Badge variant="secondary">#{position}</Badge>;
  };

  const RankIcon = getRankIcon(player.rank);

  return (
    <Link to={`/profile/${player.id}`}>
      <Card className="relative overflow-hidden bg-gradient-card border-border/50 hover:border-primary/30 hover:shadow-card transition-all duration-300 cursor-pointer group">
        {/* Banner de Fundo */}
        {bannerUrl && (
          <>
            <div className="absolute inset-0">
              <img 
                src={bannerUrl} 
                alt="Player banner" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
          </>
        )}
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            {/* Lado Esquerdo: Avatar e Info Principal */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="w-16 h-16 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                  <AvatarImage 
                    src={player.avatar_url || player.avatar} 
                    alt={player.name}
                  />
                  <AvatarFallback className="text-xl font-bold bg-primary/20 text-primary">
                    {player.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                {player.isImmune && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-ninja-kage rounded-full flex items-center justify-center">
                    <Shield className="w-3 h-3 text-background" />
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-ninja text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {player.name}
                  </h3>
                  {player.kage_title && (
                    <Badge className="bg-ninja-kage/20 text-ninja-kage border-ninja-kage/30">
                      {player.kage_title}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge className={`${getRankColor(player.rank)} bg-background/80`}>
                    <RankIcon className="w-3 h-3 mr-1" />
                    {player.rank_level || player.rank}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {player.current_points} pontos
                  </span>
                </div>
                
                {/* Conquistas */}
                {player.selected_achievements && player.selected_achievements.length > 0 && (
                  <TooltipProvider>
                    <div className="flex items-center gap-1 mt-1">
                      {player.selected_achievements.slice(0, 5).map((achievement) => {
                        const Icon = getAchievementIcon(achievement.icon);
                        const colorClasses = getAchievementColorClasses(achievement.color);
                        
                        return (
                          <Tooltip key={achievement.id}>
                            <TooltipTrigger asChild>
                              <div
                                className={`p-1 rounded-full border transition-all duration-300 hover:scale-110 cursor-pointer ${colorClasses}`}
                              >
                                <Icon className="w-3 h-3" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-center text-xs">
                                <div className="font-medium">{achievement.name}</div>
                                <div className="text-muted-foreground mt-0.5">
                                  {achievement.description}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </TooltipProvider>
                )}
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{player.wins}V - {player.losses}D</span>
                  <span>•</span>
                  <span>{player.winRate}% de vitórias</span>
                  <span>•</span>
                  <span>{player.win_streak} sequência</span>
                </div>
              </div>
            </div>

            {/* Centro: Personagens Favoritos */}
            <div className="hidden md:flex flex-col items-center space-y-2">
              <span className="text-xs font-medium text-muted-foreground">PERSONAGENS</span>
              <div className="flex space-x-1">
                {player.favoriteCharacters.slice(0, 3).map((character, index) => {
                  const characterRank = getPlayerCharacterRanking(characterRankings, player.id, character);
                  const isTopThree = characterRank && characterRank <= 3;
                  
                  return (
                    <div key={index} className="relative">
                      <Avatar className="w-10 h-10 ring-1 ring-border hover:ring-primary/50 transition-all duration-200">
                        <AvatarImage 
                          src={getCharacterImageUrl(character, characterImages)}
                          alt={character}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {character.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {isTopThree && (
                        <div className={cn(
                          "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shadow-lg ring-1 ring-background",
                          characterRank === 1 ? "bg-yellow-500 text-yellow-900" :
                          characterRank === 2 ? "bg-gray-300 text-gray-700" :
                          "bg-amber-600 text-amber-950"
                        )}>
                          {characterRank}
                        </div>
                      )}
                    </div>
                  );
                })}
                {player.favoriteCharacters.length < 3 && 
                  Array.from({ length: 3 - player.favoriteCharacters.length }).map((_, index) => (
                    <div key={index} className="w-10 h-10 rounded-full bg-muted border border-dashed border-muted-foreground/30 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">?</span>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Lado Direito: Posição e Estatísticas */}
            <div className="text-right space-y-3">
              {getPositionBadge(player.position)}
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  Última partida
                </div>
                <div className="text-xs text-muted-foreground">
                  {player.lastMatch}
                </div>
              </div>
              
              {player.win_streak > 0 && (
                <div className="flex items-center justify-end space-x-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-semibold text-orange-500">
                    {player.win_streak}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default RankingCard;
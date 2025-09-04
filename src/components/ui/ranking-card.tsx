import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Sword, Shield, Flame, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useCharacterImages, getCharacterImageUrl } from "@/hooks/useCharacterImages";

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
}

interface RankingCardProps {
  player: Player;
}

const RankingCard = ({ player }: RankingCardProps) => {
  const { data: characterImages = [] } = useCharacterImages();

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
      <Card className="bg-gradient-card border-border/50 hover:border-primary/30 hover:shadow-card transition-all duration-300 cursor-pointer group">
        <CardContent className="p-6">
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
                {player.favoriteCharacters.slice(0, 3).map((character, index) => (
                  <Avatar key={index} className="w-10 h-10 ring-1 ring-border hover:ring-primary/50 transition-all duration-200">
                    <AvatarImage 
                      src={getCharacterImageUrl(character, characterImages)}
                      alt={character}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {character.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
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
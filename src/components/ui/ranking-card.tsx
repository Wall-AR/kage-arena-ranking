import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Swords, User, MessageCircle, Shield, Flame, Trophy, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface RankingCardProps {
  player: {
    id: number;
    name: string;
    rank: string;
    position: number;
    points: number;
    wins: number;
    losses: number;
    winRate: number;
    lastMatch: string;
    favoriteCharacters: string[];
    achievements: string[];
    isImmune?: boolean;
    avatar?: string;
  };
}

// Card de Ranking - Kage Arena  
// Criado por Wall - Exibição horizontal de jogadores no ranking
// Layout inspirado nos cards do narutogame.com.br
const RankingCard = ({ player }: RankingCardProps) => {
  // Mapeamento de cores por categoria de ranking
  const getRankColor = (rank: string) => {
    const colors = {
      'Kage': 'ninja-kage',
      'Sannin': 'ninja-sannin', 
      'Anbu': 'ninja-anbu',
      'Jounin': 'ninja-jounin',
      'Chunin': 'ninja-chunin',
      'Genin': 'ninja-genin'
    };
    return colors[rank as keyof typeof colors] || 'ninja-genin';
  };

  // Ícones para diferentes conquistas
  const getAchievementIcon = (achievement: string) => {
    const icons = {
      'champion': Trophy,
      'undefeated': Target,
      'veteran': Shield,
      'streak': Flame
    };
    return icons[achievement as keyof typeof icons] || Trophy;
  };

  const rankColor = getRankColor(player.rank);

  return (
    <TooltipProvider>
      <div className={cn(
        "bg-gradient-card rounded-xl p-6 border transition-all duration-300 hover:shadow-card hover:scale-[1.02]",
        `border-${rankColor}/30 hover:border-${rankColor}/60`
      )}>
        <div className="flex items-center justify-between">
          {/* Seção Esquerda: Posição e Avatar */}
          <div className="flex items-center space-x-6">
            {/* Círculo de Posição */}
            <div className={cn(
              "relative w-16 h-16 rounded-full flex items-center justify-center font-ninja text-lg font-bold",
              `bg-${rankColor}/20 border-2 border-${rankColor} text-${rankColor}`
            )}>
              #{player.position}
              {player.isImmune && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3 text-background" />
                </div>
              )}
            </div>

            {/* Avatar do Jogador */}
            <Avatar className={cn(
              "w-16 h-16 ring-4 transition-all duration-300",
              `ring-${rankColor}/40 hover:ring-${rankColor}/80`
            )}>
              <AvatarImage src={player.avatar} alt={player.name} />
              <AvatarFallback className={cn(
                "font-bold text-lg",
                `bg-${rankColor}/20 text-${rankColor}`
              )}>
                {player.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Nome e Rank */}
            <div className="flex flex-col">
              <h3 className="font-ninja text-xl font-bold text-foreground">{player.name}</h3>
              <Badge variant="secondary" className={cn(
                "w-fit mt-1 font-semibold",
                `bg-${rankColor}/20 text-${rankColor} border-${rankColor}/30`
              )}>
                {player.rank}
              </Badge>
              
              {/* Conquistas */}
              <div className="flex items-center space-x-1 mt-2">
                {player.achievements.map((achievement, index) => {
                  const Icon = getAchievementIcon(achievement);
                  return (
                    <Tooltip key={index}>
                      <TooltipTrigger>
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center",
                          `bg-${rankColor}/20 text-${rankColor}`
                        )}>
                          <Icon className="w-3 h-3" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="capitalize">{achievement}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Seção Central: Estatísticas */}
          <div className="flex flex-col space-y-2 text-center">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Pontos</div>
                <div className="font-ninja text-lg font-bold text-accent">{player.points}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Taxa</div>
                <div className="font-ninja text-lg font-bold text-ninja-jounin">{player.winRate}%</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Vitórias</div>
                <div className="font-semibold text-ninja-chunin">{player.wins}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Derrotas</div>
                <div className="font-semibold text-ninja-anbu">{player.losses}</div>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Última: {player.lastMatch}
            </div>
          </div>

          {/* Seção Direita: Personagens e Ações */}
          <div className="flex items-center space-x-6">
            {/* Personagens Favoritos */}
            <div className="flex items-center space-x-2">
              <div className="text-sm text-muted-foreground mb-1">Favoritos:</div>
              <div className="flex space-x-1">
                {player.favoriteCharacters.slice(0, 3).map((character, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger>
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-xs font-semibold border border-border/50">
                        {character.charAt(0)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{character}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary hover:bg-primary/10">
                    <Swords className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Desafiar</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="border-secondary/30 hover:border-secondary hover:bg-secondary/10">
                    <User className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ver Perfil</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="border-muted/30 hover:border-muted hover:bg-muted/10">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mensagem</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default RankingCard;
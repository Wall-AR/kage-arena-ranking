import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Trophy, Swords, Clock, CheckCircle, AlertTriangle, Zap } from "lucide-react";

interface Match {
  id: string;
  round: number;
  match_number: number;
  player1_id: string | null;
  player2_id: string | null;
  winner_id: string | null;
  player1_score: number;
  player2_score: number;
  status: string;
  is_disputed?: boolean;
  player1?: {
    player: {
      id: string;
      name: string;
      avatar_url: string | null;
    };
  } | null;
  player2?: {
    player: {
      id: string;
      name: string;
      avatar_url: string | null;
    };
  } | null;
}

interface TournamentBracketDBZProps {
  matches: Match[];
  currentRound: number;
  onMatchClick?: (match: Match) => void;
}

const ROUND_NAMES: Record<number, string> = {
  1: "Exame Chūnin",
  2: "Batalha Anbu",
  3: "Guerra Ninja",
  4: "Final Hokage",
};

const getRoundName = (round: number, totalRounds: number) => {
  const roundsFromEnd = totalRounds - round;
  if (roundsFromEnd === 0) return "🏆 Final Hokage";
  if (roundsFromEnd === 1) return "⚔️ Semi-final";
  if (roundsFromEnd === 2) return "🔥 Quartas de Final";
  return ROUND_NAMES[round] || `Rodada ${round}`;
};

const getStatusIcon = (status: string, isDisputed?: boolean) => {
  if (isDisputed) return <AlertTriangle className="h-3 w-3 text-destructive animate-pulse" />;
  switch (status) {
    case "completed":
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    case "in_progress":
      return <Zap className="h-3 w-3 text-primary animate-pulse" />;
    case "pending":
      return <Clock className="h-3 w-3 text-muted-foreground" />;
    default:
      return null;
  }
};

const getStatusText = (status: string, isDisputed?: boolean) => {
  if (isDisputed) return "Em Análise";
  switch (status) {
    case "completed":
      return "Finalizada";
    case "in_progress":
      return "Em Batalha";
    case "pending":
      return "Aguardando";
    case "bye":
      return "BYE";
    default:
      return status;
  }
};

function MatchCard({ match, isCurrentRound, onClick }: { match: Match; isCurrentRound: boolean; onClick?: () => void }) {
  const isCompleted = match.status === "completed";
  const isInProgress = match.status === "in_progress";
  const isWaitingPlayers = !match.player1_id || !match.player2_id;

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300 cursor-pointer group",
        "border-2 hover:scale-105 hover:shadow-lg hover:shadow-primary/20",
        isCompleted && "opacity-80 border-muted",
        isInProgress && "border-primary shadow-lg shadow-primary/30 animate-pulse",
        isCurrentRound && !isCompleted && "border-accent",
        match.is_disputed && "border-destructive shadow-destructive/20",
        "bg-gradient-to-br from-background to-muted/30"
      )}
      onClick={onClick}
    >
      {/* Decorative corner elements - ninja theme */}
      <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary/50" />
      <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-primary/50" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-primary/50" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary/50" />

      <CardContent className="p-3 space-y-2">
        {/* Match Header */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-bold">#{match.match_number}</span>
          <div className="flex items-center gap-1">
            {getStatusIcon(match.status, match.is_disputed)}
            <span>{getStatusText(match.status, match.is_disputed)}</span>
          </div>
        </div>

        {/* VS Indicator */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-background border-2 border-primary rounded-full p-1 group-hover:scale-110 transition-transform">
            <Swords className="h-3 w-3 text-primary" />
          </div>
        </div>

        {/* Player 1 */}
        <PlayerSlot
          player={match.player1}
          score={match.player1_score}
          isWinner={match.winner_id === match.player1_id}
          isCompleted={isCompleted}
          position="top"
        />

        {/* Player 2 */}
        <PlayerSlot
          player={match.player2}
          score={match.player2_score}
          isWinner={match.winner_id === match.player2_id}
          isCompleted={isCompleted}
          position="bottom"
        />
      </CardContent>
    </Card>
  );
}

function PlayerSlot({ 
  player, 
  score, 
  isWinner, 
  isCompleted,
  position 
}: { 
  player: Match["player1"];
  score: number;
  isWinner: boolean;
  isCompleted: boolean;
  position: "top" | "bottom";
}) {
  return (
    <div 
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg transition-all",
        isWinner && isCompleted && "bg-gradient-to-r from-primary/20 to-primary/10 border border-primary shadow-inner",
        !isWinner && isCompleted && "opacity-50 grayscale",
        "hover:bg-muted/50"
      )}
    >
      {player ? (
        <>
          <div className="relative">
            <Avatar className={cn("h-8 w-8 border-2", isWinner && isCompleted ? "border-primary" : "border-muted")}>
              <AvatarImage src={player.player.avatar_url || undefined} />
              <AvatarFallback className="text-xs bg-muted">
                {player.player.name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isWinner && isCompleted && (
              <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5 animate-bounce">
                <Trophy className="h-2.5 w-2.5 text-primary-foreground" />
              </div>
            )}
          </div>
          <span className={cn(
            "flex-1 text-sm font-medium truncate",
            isWinner && isCompleted && "text-primary font-bold"
          )}>
            {player.player.name}
          </span>
          <span className={cn(
            "text-sm font-bold min-w-[20px] text-center",
            isWinner && isCompleted ? "text-primary" : "text-muted-foreground"
          )}>
            {score}
          </span>
        </>
      ) : (
        <span className="text-sm text-muted-foreground italic w-full text-center">
          Aguardando...
        </span>
      )}
    </div>
  );
}

export function TournamentBracketDBZ({ matches, currentRound, onMatchClick }: TournamentBracketDBZProps) {
  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const rounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b);

  const totalRounds = rounds.length;

  if (matches.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <h3 className="text-xl font-bold mb-2">Chaveamento Pendente</h3>
          <p className="text-muted-foreground">
            O chaveamento será gerado quando o torneio iniciar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max p-4">
        {rounds.map((round) => {
          const roundMatches = matchesByRound[round];
          const isCurrentRoundActive = round === currentRound;

          return (
            <div key={round} className="flex flex-col min-w-[260px]">
              {/* Round Header */}
              <div className="text-center mb-4">
                <Badge 
                  variant={isCurrentRoundActive ? "default" : "outline"}
                  className={cn(
                    "text-sm px-4 py-1.5",
                    isCurrentRoundActive && "animate-pulse shadow-lg shadow-primary/30"
                  )}
                >
                  {getRoundName(round, totalRounds)}
                </Badge>
              </div>

              {/* Matches */}
              <div 
                className="flex flex-col gap-4"
                style={{
                  marginTop: `${(Math.pow(2, round - 1) - 1) * 80}px`,
                  gap: `${Math.pow(2, round) * 20}px`
                }}
              >
                {roundMatches
                  .sort((a, b) => a.match_number - b.match_number)
                  .map((match) => (
                    <MatchCard 
                      key={match.id} 
                      match={match}
                      isCurrentRound={isCurrentRoundActive}
                      onClick={() => onMatchClick?.(match)}
                    />
                  ))}
              </div>
            </div>
          );
        })}

        {/* Champion Display */}
        {rounds.length > 0 && (
          <div className="flex flex-col items-center justify-center min-w-[200px]">
            <div className="text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-primary animate-bounce" />
              <h3 className="text-xl font-bold mb-2">Campeão</h3>
              {matches.some(m => m.round === totalRounds && m.winner_id) ? (
                <div className="flex flex-col items-center gap-2">
                  {(() => {
                    const finalMatch = matches.find(m => m.round === totalRounds);
                    const winner = finalMatch?.winner_id === finalMatch?.player1_id 
                      ? finalMatch?.player1 
                      : finalMatch?.player2;
                    return winner ? (
                      <>
                        <Avatar className="h-20 w-20 border-4 border-primary shadow-lg shadow-primary/30">
                          <AvatarImage src={winner.player.avatar_url || undefined} />
                          <AvatarFallback className="text-2xl">
                            {winner.player.name[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-lg font-bold text-primary">
                          {winner.player.name}
                        </span>
                        <Badge className="bg-primary text-primary-foreground">
                          🏆 Hokage do Torneio
                        </Badge>
                      </>
                    ) : null;
                  })()}
                </div>
              ) : (
                <p className="text-muted-foreground">A definir</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

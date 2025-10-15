import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

interface TournamentBracketProps {
  matches: Match[];
  currentRound: number;
}

export function TournamentBracket({ matches, currentRound }: TournamentBracketProps) {
  // Agrupar partidas por round
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const rounds = Object.keys(matchesByRound).sort((a, b) => parseInt(a) - parseInt(b));

  const getRoundName = (round: number, totalRounds: number) => {
    const roundsFromEnd = totalRounds - round;
    if (roundsFromEnd === 0) return "Final";
    if (roundsFromEnd === 1) return "Semi-final";
    if (roundsFromEnd === 2) return "Quartas";
    return `Rodada ${round}`;
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-8 min-w-max p-4">
        {rounds.map((roundNum) => {
          const round = parseInt(roundNum);
          const roundMatches = matchesByRound[round];

          return (
            <div key={round} className="flex flex-col gap-4 min-w-[280px]">
              <div className="text-center">
                <Badge variant={round === currentRound ? "default" : "outline"} className="text-sm">
                  {getRoundName(round, rounds.length)}
                </Badge>
              </div>

              <div className="flex flex-col gap-4">
                {roundMatches.map((match) => (
                  <Card key={match.id} className={`${match.status === 'completed' ? 'opacity-75' : ''}`}>
                    <CardHeader className="p-3">
                      <CardTitle className="text-xs text-muted-foreground">
                        Partida #{match.match_number}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-2">
                      {/* Player 1 */}
                      <div className={`flex items-center gap-2 p-2 rounded ${
                        match.winner_id === match.player1_id ? 'bg-primary/20 border border-primary' : 'bg-muted/50'
                      }`}>
                        {match.player1 ? (
                          <>
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={match.player1.player.avatar_url || undefined} />
                              <AvatarFallback>{match.player1.player.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="flex-1 text-sm font-medium">{match.player1.player.name}</span>
                            <span className="text-sm font-bold">{match.player1_score}</span>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">TBD</span>
                        )}
                      </div>

                      {/* Player 2 */}
                      <div className={`flex items-center gap-2 p-2 rounded ${
                        match.winner_id === match.player2_id ? 'bg-primary/20 border border-primary' : 'bg-muted/50'
                      }`}>
                        {match.player2 ? (
                          <>
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={match.player2.player.avatar_url || undefined} />
                              <AvatarFallback>{match.player2.player.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="flex-1 text-sm font-medium">{match.player2.player.name}</span>
                            <span className="text-sm font-bold">{match.player2_score}</span>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">TBD</span>
                        )}
                      </div>

                      <div className="text-xs text-center text-muted-foreground mt-1">
                        {match.status === 'completed' ? '✓ Finalizada' : 
                         match.status === 'in_progress' ? '⚡ Em andamento' : 
                         match.status === 'bye' ? 'BYE' : 'Aguardando'}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
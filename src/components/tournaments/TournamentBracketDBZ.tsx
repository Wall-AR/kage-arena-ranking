import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Trophy, Swords, Clock, CheckCircle, AlertTriangle, Zap, Scroll, Shield, Flame, Crown } from "lucide-react";
import { useState } from "react";

interface Match {
  id: string;
  round: number;
  match_number: number;
  player1_id: string | null;
  player2_id: string | null;
  winner_id: string | null;
  player1_score: number;
  player2_score: number;
  player1_character?: string | null;
  player2_character?: string | null;
  evidence_url?: string | null;
  notes?: string | null;
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

const ROUND_CONFIG: Record<string, { name: string; icon: typeof Scroll; gradient: string }> = {
  "first": { name: "Exame Chūnin", icon: Scroll, gradient: "from-blue-500 to-cyan-500" },
  "second": { name: "Arena Floresta", icon: Shield, gradient: "from-green-500 to-emerald-500" },
  "quarter": { name: "Batalha Anbu", icon: Swords, gradient: "from-purple-500 to-violet-500" },
  "semi": { name: "Guerra Ninja", icon: Flame, gradient: "from-orange-500 to-red-500" },
  "final": { name: "Final Hokage", icon: Crown, gradient: "from-yellow-400 to-amber-500" },
};

const getRoundConfig = (round: number, totalRounds: number) => {
  const roundsFromEnd = totalRounds - round;
  if (roundsFromEnd === 0) return ROUND_CONFIG.final;
  if (roundsFromEnd === 1) return ROUND_CONFIG.semi;
  if (roundsFromEnd === 2) return ROUND_CONFIG.quarter;
  if (roundsFromEnd === 3) return ROUND_CONFIG.second;
  return ROUND_CONFIG.first;
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

function MatchDetailDialog({ match, onClose }: { match: Match | null; onClose: () => void }) {
  const players = match
    ? [
        {
          slot: "player1" as const,
          participantId: match.player1_id,
          player: match.player1?.player,
          score: match.player1_score,
          character: match.player1_character,
        },
        {
          slot: "player2" as const,
          participantId: match.player2_id,
          player: match.player2?.player,
          score: match.player2_score,
          character: match.player2_character,
        },
      ]
    : [];

  return (
    <Dialog open={!!match} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            Detalhes da Batalha
          </DialogTitle>
        </DialogHeader>

        {match && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">Rodada {match.round}</Badge>
              <Badge>{getStatusText(match.status, match.is_disputed)}</Badge>
            </div>

            <div className="grid gap-3">
              {players.map(({ slot, participantId, player, score, character }) => {
                const isWinner = match.winner_id === participantId;
                const isEliminated = match.status === "completed" && participantId && match.winner_id !== participantId;

                return (
                  <div
                    key={slot}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3",
                      isWinner && "border-primary bg-primary/10",
                      isEliminated && "opacity-60 grayscale"
                    )}
                  >
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={player?.avatar_url || undefined} />
                      <AvatarFallback>{player?.name?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold">{player?.name || "Aguardando"}</p>
                        {isWinner && <Badge className="bg-primary">Vencedor</Badge>}
                        {isEliminated && <Badge variant="secondary">Eliminado</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Personagem: {character?.trim() || "Nao informado"}
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-primary">{score ?? 0}</div>
                  </div>
                );
              })}
            </div>

            {match.notes && (
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-xs font-medium uppercase text-muted-foreground">Observacoes</p>
                <p className="text-sm">{match.notes}</p>
              </div>
            )}

            {match.evidence_url && (
              <a
                href={match.evidence_url}
                target="_blank"
                rel="noreferrer"
                className="block text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Ver prova da partida
              </a>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function TournamentBracketDBZ({ matches, currentRound, onMatchClick }: TournamentBracketDBZProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

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
        {rounds.map((round, roundIndex) => {
          const roundMatches = matchesByRound[round];
          const isCurrentRoundActive = round === currentRound;
          const config = getRoundConfig(round, totalRounds);
          const RoundIcon = config.icon;

          return (
            <div key={round} className="flex flex-col min-w-[280px] relative">
              {/* Connection lines to next round */}
              {roundIndex < rounds.length - 1 && (
                <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none">
                  {roundMatches.map((_, idx) => (
                    <div
                      key={idx}
                      className="absolute h-px bg-gradient-to-r from-primary/50 to-primary/20"
                      style={{
                        top: `calc(${(Math.pow(2, round - 1) - 1) * 80}px + ${idx * (Math.pow(2, round) * 20 + 160)}px + 80px)`,
                        width: "32px",
                        right: "-8px"
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Round Header */}
              <div className="text-center mb-4">
                <div 
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all",
                    isCurrentRoundActive 
                      ? "bg-gradient-to-r border-primary shadow-lg shadow-primary/30 animate-pulse" 
                      : "bg-muted/50 border-muted"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-lg bg-gradient-to-br",
                    config.gradient
                  )}>
                    <RoundIcon className="h-4 w-4 text-white" />
                  </div>
                  <span className={cn(
                    "font-bold text-sm",
                    isCurrentRoundActive && "text-primary"
                  )}>
                    {config.name}
                  </span>
                </div>
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
                      onClick={() => {
                        setSelectedMatch(match);
                        onMatchClick?.(match);
                      }}
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
      <MatchDetailDialog match={selectedMatch} onClose={() => setSelectedMatch(null)} />
    </div>
  );
}

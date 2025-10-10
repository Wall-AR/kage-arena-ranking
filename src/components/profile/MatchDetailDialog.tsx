import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, TrendingUp, TrendingDown, Calendar, Swords, Target } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MatchDetailDialogProps {
  match: any;
  playerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MatchDetailDialog = ({ match, playerId, open, onOpenChange }: MatchDetailDialogProps) => {
  if (!match) return null;

  const isWinner = match.winner_id === playerId;
  const player = isWinner ? match.winner : match.loser;
  const opponent = isWinner ? match.loser : match.winner;
  const playerPointsChange = isWinner ? match.winner_points_change : match.loser_points_change;
  const opponentPointsChange = isWinner ? match.loser_points_change : match.winner_points_change;
  
  // Extrair dados dos rounds se disponíveis
  const roundsData = match.rounds_data || [];
  const playerWins = Array.isArray(roundsData) 
    ? roundsData.filter((r: any) => r.winner === playerId).length 
    : 0;
  const opponentWins = Array.isArray(roundsData) 
    ? roundsData.filter((r: any) => r.winner !== playerId).length 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Swords className="w-5 h-5" />
            <span>Detalhes da Partida</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resultado principal */}
          <Card className={isWinner ? "bg-ninja-chunin/5 border-ninja-chunin/30" : "bg-ninja-anbu/5 border-ninja-anbu/30"}>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <Badge variant={isWinner ? "default" : "destructive"} className="text-lg px-4 py-2">
                  {isWinner ? "Vitória" : "Derrota"}
                </Badge>
                <div className="text-sm text-muted-foreground mt-2">
                  {match.challenge?.match_type || "FT5"}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 items-center">
                {/* Jogador */}
                <div className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-3 ring-4 ring-accent/30">
                    <AvatarImage src={player?.avatar_url} alt={player?.name} />
                    <AvatarFallback className="text-xl">
                      {player?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="font-semibold">{player?.name}</div>
                  <Badge variant="outline" className="mt-1">
                    {player?.rank_level}
                  </Badge>
                </div>

                {/* Placar */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground">
                    {isWinner ? playerWins : opponentWins} - {isWinner ? opponentWins : playerWins}
                  </div>
                </div>

                {/* Oponente */}
                <div className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-3 ring-4 ring-muted/30">
                    <AvatarImage src={opponent?.avatar_url} alt={opponent?.name} />
                    <AvatarFallback className="text-xl">
                      {opponent?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="font-semibold">{opponent?.name}</div>
                  <Badge variant="outline" className="mt-1">
                    {opponent?.rank_level}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mudanças de pontuação */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Você</div>
                  <div className="flex items-center justify-center space-x-2">
                    {playerPointsChange && playerPointsChange > 0 ? (
                      <TrendingUp className="w-5 h-5 text-ninja-chunin" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-ninja-anbu" />
                    )}
                    <span className={`text-2xl font-bold ${
                      playerPointsChange && playerPointsChange > 0 ? 'text-ninja-chunin' : 'text-ninja-anbu'
                    }`}>
                      {playerPointsChange > 0 ? '+' : ''}{playerPointsChange || 0}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">pontos</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Oponente</div>
                  <div className="flex items-center justify-center space-x-2">
                    {opponentPointsChange && opponentPointsChange > 0 ? (
                      <TrendingUp className="w-5 h-5 text-ninja-chunin" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-ninja-anbu" />
                    )}
                    <span className={`text-2xl font-bold ${
                      opponentPointsChange && opponentPointsChange > 0 ? 'text-ninja-chunin' : 'text-ninja-anbu'
                    }`}>
                      {opponentPointsChange > 0 ? '+' : ''}{opponentPointsChange || 0}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">pontos</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informações adicionais */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Data da Partida:</span>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">
                    {format(new Date(match.played_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </div>

              {match.challenge_id && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tipo de Desafio:</span>
                  <Badge variant="outline">
                    {match.challenge?.match_type || "FT5"}
                  </Badge>
                </div>
              )}

              {match.evidence_url && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Evidência:</span>
                  <a 
                    href={match.evidence_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Ver Evidência
                  </a>
                </div>
              )}

              {match.match_notes && (
                <div className="pt-3 border-t">
                  <div className="text-sm text-muted-foreground mb-2">Observações:</div>
                  <p className="text-sm">{match.match_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Plus, Minus } from "lucide-react";
import { useMatches } from "@/hooks/useMatches";
import { Challenge } from "@/hooks/useChallenges";
import { useAuth } from "@/hooks/useAuth";

interface ReportMatchDialogProps {
  children: React.ReactNode;
  challenge: Challenge;
}

export const ReportMatchDialog = ({ children, challenge }: ReportMatchDialogProps) => {
  const [open, setOpen] = useState(false);
  const [winnerId, setWinnerId] = useState<string>("");
  const [rounds, setRounds] = useState<{ round: number; winner: string }[]>([]);
  const [notes, setNotes] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  
  const { currentPlayer } = useAuth();
  const { reportMatch, isReporting } = useMatches();

  const getMaxRounds = (matchType: string) => {
    const types: { [key: string]: number } = {
      'FT5': 9,
      'FT7': 13,
      'FT10': 19
    };
    return types[matchType] || 9;
  };

  const getWinsNeeded = (matchType: string) => {
    const wins: { [key: string]: number } = {
      'FT5': 5,
      'FT7': 7,
      'FT10': 10
    };
    return wins[matchType] || 5;
  };

  const addRound = (winner: string) => {
    const newRound = {
      round: rounds.length + 1,
      winner
    };
    const updatedRounds = [...rounds, newRound];
    setRounds(updatedRounds);

    // Verificar se alguém ganhou
    const challengerWins = updatedRounds.filter(r => r.winner === challenge.challenger.id).length;
    const challengedWins = updatedRounds.filter(r => r.winner === challenge.challenged.id).length;
    const winsNeeded = getWinsNeeded(challenge.match_type);

    if (challengerWins >= winsNeeded) {
      setWinnerId(challenge.challenger.id);
    } else if (challengedWins >= winsNeeded) {
      setWinnerId(challenge.challenged.id);
    }
  };

  const removeLastRound = () => {
    const updatedRounds = rounds.slice(0, -1);
    setRounds(updatedRounds);
    
    // Recalcular vencedor
    const challengerWins = updatedRounds.filter(r => r.winner === challenge.challenger.id).length;
    const challengedWins = updatedRounds.filter(r => r.winner === challenge.challenged.id).length;
    const winsNeeded = getWinsNeeded(challenge.match_type);

    if (challengerWins >= winsNeeded) {
      setWinnerId(challenge.challenger.id);
    } else if (challengedWins >= winsNeeded) {
      setWinnerId(challenge.challenged.id);
    } else {
      setWinnerId("");
    }
  };

  const handleReportMatch = () => {
    if (!winnerId || rounds.length === 0) return;

    const loserId = winnerId === challenge.challenger.id ? challenge.challenged.id : challenge.challenger.id;

    reportMatch({
      challengeId: challenge.id,
      winnerId,
      loserId,
      rounds,
      notes: notes.trim() || undefined,
      evidenceUrl: evidenceUrl.trim() || undefined
    });

    // Reset form
    setWinnerId("");
    setRounds([]);
    setNotes("");
    setEvidenceUrl("");
    setOpen(false);
  };

  const challengerWins = rounds.filter(r => r.winner === challenge.challenger.id).length;
  const challengedWins = rounds.filter(r => r.winner === challenge.challenged.id).length;
  const winsNeeded = getWinsNeeded(challenge.match_type);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Reportar Resultado da Partida
          </DialogTitle>
          <DialogDescription>
            Registre o resultado da partida round por round
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações da Partida */}
          <div className="space-y-4">
            <div className="text-center">
              <Badge variant="outline" className="text-sm">
                {challenge.match_type} - Primeiro a {getWinsNeeded(challenge.match_type)} vitórias
              </Badge>
            </div>

            {/* Jogadores */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={challenge.challenger.avatar_url || ""} />
                  <AvatarFallback>{challenge.challenger.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{challenge.challenger.name}</div>
                  <Badge variant="secondary" className="text-xs">
                    {challenge.challenger.rank}
                  </Badge>
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {challengerWins} - {challengedWins}
                </div>
                <div className="text-sm text-muted-foreground">
                  {rounds.length} rounds
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="font-medium">{challenge.challenged.name}</div>
                  <Badge variant="secondary" className="text-xs">
                    {challenge.challenged.rank}
                  </Badge>
                </div>
                <Avatar className="w-12 h-12">
                  <AvatarImage src={challenge.challenged.avatar_url || ""} />
                  <AvatarFallback>{challenge.challenged.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>

          {/* Adicionar Rounds */}
          <div className="space-y-4">
            <Label>Registrar Rounds</Label>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => addRound(challenge.challenger.id)}
                disabled={!!winnerId || rounds.length >= getMaxRounds(challenge.match_type)}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                {challenge.challenger.name} Venceu
              </Button>
              <Button
                onClick={() => addRound(challenge.challenged.id)}
                disabled={!!winnerId || rounds.length >= getMaxRounds(challenge.match_type)}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                {challenge.challenged.name} Venceu
              </Button>
              {rounds.length > 0 && (
                <Button
                  onClick={removeLastRound}
                  variant="outline"
                  size="sm"
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Remover
                </Button>
              )}
            </div>
          </div>

          {/* Lista de Rounds */}
          {rounds.length > 0 && (
            <div className="space-y-2">
              <Label>Rounds Registrados</Label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {rounds.map((round) => {
                  const winner = round.winner === challenge.challenger.id 
                    ? challenge.challenger.name 
                    : challenge.challenged.name;
                  return (
                    <div key={round.round} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
                      <span>Round {round.round}</span>
                      <span className="font-medium">{winner}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Vencedor */}
          {winnerId && (
            <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/30">
              <div className="text-lg font-semibold text-primary">
                🏆 Vencedor: {winnerId === challenge.challenger.id ? challenge.challenger.name : challenge.challenged.name}
              </div>
            </div>
          )}

          {/* Notas Adicionais */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas da Partida (Opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Adicione observações sobre a partida..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* URL de Evidência */}
          <div className="space-y-2">
            <Label htmlFor="evidence">Link de Evidência (Opcional)</Label>
            <Input
              id="evidence"
              placeholder="https://youtube.com/watch?v=..."
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleReportMatch}
            disabled={!winnerId || rounds.length === 0 || isReporting}
          >
            {isReporting ? "Reportando..." : "Reportar Resultado"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";
import { useReportTournamentMatch } from "@/hooks/useTournaments";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface TournamentMatchReportDialogProps {
  children: React.ReactNode;
  matchId: string;
  player1: { id: string; name: string; avatar_url?: string } | null;
  player2: { id: string; name: string; avatar_url?: string } | null;
  isParticipant: boolean;
}

export const TournamentMatchReportDialog = ({ 
  children, 
  matchId, 
  player1, 
  player2,
  isParticipant 
}: TournamentMatchReportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [winnerId, setWinnerId] = useState<string>("");
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [notes, setNotes] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  
  const reportMatch = useReportTournamentMatch();

  const handleSubmit = async () => {
    if (!winnerId || !player1 || !player2) return;

    await reportMatch.mutateAsync({
      matchId,
      winnerId,
      player1Score,
      player2Score,
      evidenceUrl: evidenceUrl.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setWinnerId("");
    setPlayer1Score(0);
    setPlayer2Score(0);
    setNotes("");
    setEvidenceUrl("");
    setOpen(false);
  };

  if (!player1 || !player2) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Reportar Resultado
          </DialogTitle>
          <DialogDescription>
            Registre o resultado da partida do torneio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Selecionar Vencedor */}
          <div className="space-y-3">
            <Label>Vencedor</Label>
            <RadioGroup value={winnerId} onValueChange={setWinnerId}>
              <div className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-accent/50" 
                   onClick={() => setWinnerId(player1.id)}>
                <RadioGroupItem value={player1.id} id="player1" />
                <Avatar className="w-10 h-10">
                  <AvatarImage src={player1.avatar_url} />
                  <AvatarFallback>{player1.name[0]}</AvatarFallback>
                </Avatar>
                <Label htmlFor="player1" className="flex-1 cursor-pointer">
                  {player1.name}
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-accent/50"
                   onClick={() => setWinnerId(player2.id)}>
                <RadioGroupItem value={player2.id} id="player2" />
                <Avatar className="w-10 h-10">
                  <AvatarImage src={player2.avatar_url} />
                  <AvatarFallback>{player2.name[0]}</AvatarFallback>
                </Avatar>
                <Label htmlFor="player2" className="flex-1 cursor-pointer">
                  {player2.name}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Placar */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="score1">Placar {player1.name}</Label>
              <Input
                id="score1"
                type="number"
                min="0"
                value={player1Score}
                onChange={(e) => setPlayer1Score(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="score2">Placar {player2.name}</Label>
              <Input
                id="score2"
                type="number"
                min="0"
                value={player2Score}
                onChange={(e) => setPlayer2Score(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Link de Evidência */}
          <div className="space-y-2">
            <Label htmlFor="evidence">Link de Evidência (Opcional)</Label>
            <Input
              id="evidence"
              placeholder="https://youtube.com/watch?v=..."
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
            />
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (Opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Adicione observações sobre a partida..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!winnerId || reportMatch.isPending}
          >
            {reportMatch.isPending ? "Reportando..." : "Reportar Resultado"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
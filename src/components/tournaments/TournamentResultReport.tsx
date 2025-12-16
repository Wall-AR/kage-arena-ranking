import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Upload, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface TournamentResultReportProps {
  matchId: string;
  player1: Player | null;
  player2: Player | null;
  player1ParticipantId: string;
  player2ParticipantId: string;
  currentPlayerId?: string;
  reportedWinnerId?: string;
  reportedBy?: string;
  isConfirmed?: boolean;
  onReport: (data: {
    matchId: string;
    winnerId: string;
    player1Score: number;
    player2Score: number;
    evidenceUrl?: string;
    notes?: string;
  }) => Promise<void>;
  onConfirm: (matchId: string) => Promise<void>;
  onDispute: (data: { matchId: string; reason: string; evidenceUrl?: string }) => Promise<void>;
  children: React.ReactNode;
}

export function TournamentResultReport({
  matchId,
  player1,
  player2,
  player1ParticipantId,
  player2ParticipantId,
  currentPlayerId,
  reportedWinnerId,
  reportedBy,
  isConfirmed,
  onReport,
  onConfirm,
  onDispute,
  children,
}: TournamentResultReportProps) {
  const [open, setOpen] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string>("");
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<"report" | "confirm" | "dispute">("report");

  const isReporter = reportedBy === currentPlayerId;
  const needsConfirmation = reportedWinnerId && !isConfirmed && !isReporter;
  const canReport = !reportedWinnerId;

  const handleReport = async () => {
    if (!selectedWinner) return;
    setIsSubmitting(true);
    try {
      await onReport({
        matchId,
        winnerId: selectedWinner,
        player1Score,
        player2Score,
        evidenceUrl: evidenceUrl || undefined,
        notes: notes || undefined,
      });
      setOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(matchId);
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDispute = async () => {
    if (!disputeReason.trim()) return;
    setIsSubmitting(true);
    try {
      await onDispute({
        matchId,
        reason: disputeReason,
        evidenceUrl: evidenceUrl || undefined,
      });
      setOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedWinner("");
    setPlayer1Score(0);
    setPlayer2Score(0);
    setEvidenceUrl("");
    setNotes("");
    setDisputeReason("");
    setMode("report");
  };

  const reportedWinnerPlayer = reportedWinnerId === player1ParticipantId ? player1 : player2;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            {canReport ? "Reportar Resultado" : needsConfirmation ? "Confirmar Resultado" : "Resultado Reportado"}
          </DialogTitle>
          <DialogDescription>
            {canReport && "Informe o resultado da partida. O oponente precisará confirmar."}
            {needsConfirmation && "Seu oponente reportou um resultado. Confirme ou conteste."}
            {isReporter && "Aguardando confirmação do oponente."}
          </DialogDescription>
        </DialogHeader>

        {/* Show reported result waiting for confirmation */}
        {reportedWinnerId && !canReport && (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-2">Resultado Reportado:</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarImage src={reportedWinnerPlayer?.avatar_url || undefined} />
                  <AvatarFallback>{reportedWinnerPlayer?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-primary">{reportedWinnerPlayer?.name}</p>
                  <Badge variant="outline" className="text-xs">Vencedor Reportado</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Report Form */}
        {canReport && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">Selecione o Vencedor</Label>
              <RadioGroup value={selectedWinner} onValueChange={setSelectedWinner}>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { player: player1, participantId: player1ParticipantId },
                    { player: player2, participantId: player2ParticipantId },
                  ].map(({ player, participantId }) => (
                    player && (
                      <div key={participantId}>
                        <RadioGroupItem value={participantId} id={participantId} className="peer sr-only" />
                        <Label
                          htmlFor={participantId}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all",
                            "hover:bg-muted/50 peer-checked:border-primary peer-checked:bg-primary/10",
                            selectedWinner === participantId && "border-primary bg-primary/10"
                          )}
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={player.avatar_url || undefined} />
                            <AvatarFallback>{player.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{player.name}</span>
                          {selectedWinner === participantId && (
                            <Badge className="bg-primary text-primary-foreground">
                              <Trophy className="h-3 w-3 mr-1" />
                              Vencedor
                            </Badge>
                          )}
                        </Label>
                      </div>
                    )
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="player1Score">{player1?.name} - Placar</Label>
                <Input
                  id="player1Score"
                  type="number"
                  min="0"
                  value={player1Score}
                  onChange={(e) => setPlayer1Score(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="player2Score">{player2?.name} - Placar</Label>
                <Input
                  id="player2Score"
                  type="number"
                  min="0"
                  value={player2Score}
                  onChange={(e) => setPlayer2Score(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="evidence">URL da Prova (opcional)</Label>
              <div className="flex gap-2">
                <Upload className="h-4 w-4 text-muted-foreground mt-3" />
                <Input
                  id="evidence"
                  placeholder="Link para imagem/vídeo da partida"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Comentários sobre a partida..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleReport} 
              disabled={!selectedWinner || isSubmitting}
              className="w-full"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {isSubmitting ? "Enviando..." : "Reportar Resultado"}
            </Button>
          </div>
        )}

        {/* Confirmation/Dispute Options */}
        {needsConfirmation && (
          <div className="space-y-4">
            {mode === "confirm" || mode === "report" ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={handleConfirm} disabled={isSubmitting} className="w-full">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirmar Resultado
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setMode("dispute")}
                    className="w-full"
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Contestar
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="disputeReason">Motivo da Contestação</Label>
                  <Textarea
                    id="disputeReason"
                    placeholder="Descreva o problema com o resultado reportado..."
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <div>
                  <Label htmlFor="disputeEvidence">URL da Prova</Label>
                  <Input
                    id="disputeEvidence"
                    placeholder="Link para imagem/vídeo como prova"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setMode("report")} className="flex-1">
                    Voltar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDispute}
                    disabled={!disputeReason.trim() || isSubmitting}
                    className="flex-1"
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Enviando..." : "Enviar Contestação"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Waiting for confirmation (reporter view) */}
        {isReporter && (
          <div className="text-center py-4">
            <Badge variant="outline" className="text-muted-foreground">
              Aguardando confirmação do oponente...
            </Badge>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

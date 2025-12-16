import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle, XCircle, ExternalLink, Shield } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

interface Dispute {
  id: string;
  match_id: string;
  reported_by: string;
  dispute_reason: string;
  evidence_url: string | null;
  status: string;
  resolution_notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  reporter?: {
    name: string;
    avatar_url: string | null;
  };
  match?: {
    player1?: { player: { name: string; avatar_url: string | null } };
    player2?: { player: { name: string; avatar_url: string | null } };
  };
}

interface TournamentDisputePanelProps {
  disputes: Dispute[];
  isModerator: boolean;
  onResolve: (disputeId: string, resolution: "player1" | "player2" | "annul", notes: string) => Promise<void>;
}

export function TournamentDisputePanel({ disputes, isModerator, onResolve }: TournamentDisputePanelProps) {
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
  const [resolution, setResolution] = useState<"player1" | "player2" | "annul" | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingDisputes = disputes.filter((d) => d.status === "pending");
  const resolvedDisputes = disputes.filter((d) => d.status !== "pending");

  const handleResolve = async (disputeId: string) => {
    if (!resolution) return;
    setIsSubmitting(true);
    try {
      await onResolve(disputeId, resolution, resolutionNotes);
      setSelectedDispute(null);
      setResolution(null);
      setResolutionNotes("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500"><AlertTriangle className="h-3 w-3 mr-1" />Pendente</Badge>;
      case "resolved":
        return <Badge variant="outline" className="text-green-500 border-green-500"><CheckCircle className="h-3 w-3 mr-1" />Resolvido</Badge>;
      case "dismissed":
        return <Badge variant="outline" className="text-muted-foreground"><XCircle className="h-3 w-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (disputes.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhuma contestação registrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pending Disputes */}
      {pendingDisputes.length > 0 && (
        <Card className="border-yellow-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Contestações Pendentes ({pendingDisputes.length})
            </CardTitle>
            <CardDescription>
              {isModerator ? "Analise e resolva as contestações abaixo" : "Aguardando análise dos moderadores"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingDisputes.map((dispute) => (
              <Card key={dispute.id} className="border-dashed">
                <CardContent className="p-4 space-y-4">
                  {/* Dispute Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={dispute.reporter?.avatar_url || undefined} />
                        <AvatarFallback>{dispute.reporter?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{dispute.reporter?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(dispute.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(dispute.status)}
                  </div>

                  {/* Match Info */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm font-medium mb-2">Partida Contestada:</p>
                    <p className="text-sm">
                      {dispute.match?.player1?.player.name} vs {dispute.match?.player2?.player.name}
                    </p>
                  </div>

                  {/* Reason */}
                  <div>
                    <p className="text-sm font-medium mb-1">Motivo:</p>
                    <p className="text-sm text-muted-foreground">{dispute.dispute_reason}</p>
                  </div>

                  {/* Evidence */}
                  {dispute.evidence_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={dispute.evidence_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver Prova Anexada
                      </a>
                    </Button>
                  )}

                  {/* Moderator Resolution Form */}
                  {isModerator && selectedDispute === dispute.id && (
                    <div className="border-t pt-4 space-y-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Decisão</Label>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant={resolution === "player1" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setResolution("player1")}
                          >
                            {dispute.match?.player1?.player.name} Venceu
                          </Button>
                          <Button
                            variant={resolution === "player2" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setResolution("player2")}
                          >
                            {dispute.match?.player2?.player.name} Venceu
                          </Button>
                          <Button
                            variant={resolution === "annul" ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => setResolution("annul")}
                          >
                            Anular Partida
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="resolutionNotes">Notas da Resolução</Label>
                        <Textarea
                          id="resolutionNotes"
                          placeholder="Explique a decisão tomada..."
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedDispute(null);
                            setResolution(null);
                            setResolutionNotes("");
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => handleResolve(dispute.id)}
                          disabled={!resolution || isSubmitting}
                        >
                          {isSubmitting ? "Salvando..." : "Confirmar Decisão"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {isModerator && selectedDispute !== dispute.id && (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedDispute(dispute.id)}
                      className="w-full"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Analisar e Resolver
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Resolved Disputes */}
      {resolvedDisputes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Contestações Resolvidas ({resolvedDisputes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {resolvedDisputes.map((dispute) => (
              <div key={dispute.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium">
                    {dispute.match?.player1?.player.name} vs {dispute.match?.player2?.player.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Resolvido em {dispute.resolved_at && format(new Date(dispute.resolved_at), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                {getStatusBadge(dispute.status)}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

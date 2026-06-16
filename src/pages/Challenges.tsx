import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/ui/navigation";
import {
  Swords, Clock, CheckCircle, XCircle, Target, Calendar, Trophy,
  ShieldAlert, Hourglass, Award,
} from "lucide-react";
import { useChallenges, Challenge } from "@/hooks/useChallenges";
import { useAuth } from "@/hooks/useAuth";
import { CreateChallengeDialog } from "@/components/challenges/CreateChallengeDialog";
import { ReportMatchDialog } from "@/components/challenges/ReportMatchDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const MATCH_TYPE_LABEL: Record<string, string> = {
  FT5: "Melhor de 9 (FT5)",
  FT7: "Melhor de 13 (FT7)",
  FT10: "Melhor de 19 (FT10)",
};

const STATUS: Record<string, { label: string; color: string }> = {
  pending:   { label: "Aguardando resposta", color: "bg-orange-500/20 text-orange-400" },
  accepted:  { label: "Aceito – Check-in",    color: "bg-blue-500/20 text-blue-400" },
  reported:  { label: "Aguardando confirmação", color: "bg-amber-500/20 text-amber-400" },
  disputed:  { label: "Em disputa",            color: "bg-red-500/20 text-red-400" },
  completed: { label: "Concluído",             color: "bg-green-500/20 text-green-400" },
  expired:   { label: "Expirado",              color: "bg-zinc-500/20 text-zinc-400" },
  cancelled: { label: "Cancelado",             color: "bg-zinc-500/20 text-zinc-400" },
  rejected:  { label: "Recusado",              color: "bg-zinc-500/20 text-zinc-400" },
};

const PlayerBlock = ({
  player, side = "left",
}: { player: Challenge["challenger"]; side?: "left" | "right" }) => (
  <div className={`flex items-center gap-3 ${side === "right" ? "flex-row-reverse text-right" : ""}`}>
    <Avatar className="w-12 h-12 border-2 border-primary/30">
      <AvatarImage src={player.avatar_url || ""} />
      <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
    </Avatar>
    <div>
      <CardTitle className="text-base sm:text-lg">{player.name}</CardTitle>
      <Badge variant="secondary" className="text-xs mt-1">{player.rank}</Badge>
    </div>
  </div>
);

const PairHeader = ({ challenge }: { challenge: Challenge }) => (
  <div className="flex items-center justify-between gap-4 flex-wrap">
    <div className="flex items-center gap-4 flex-1 min-w-0">
      <PlayerBlock player={challenge.challenger} />
      <Swords className="w-6 h-6 text-primary shrink-0" />
      <PlayerBlock player={challenge.challenged} side="right" />
    </div>
    <Badge className={STATUS[challenge.status]?.color || ""}>
      {STATUS[challenge.status]?.label || challenge.status}
    </Badge>
  </div>
);

const InfoRow = ({ challenge }: { challenge: Challenge }) => (
  <div className="space-y-1.5 text-sm text-muted-foreground">
    <div className="flex items-center"><Trophy className="w-4 h-4 mr-2" />Formato: {MATCH_TYPE_LABEL[challenge.match_type] || challenge.match_type}</div>
    <div className="flex items-center"><Calendar className="w-4 h-4 mr-2" />Criado: {format(new Date(challenge.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</div>
    {challenge.status === "pending" && (
      <div className="flex items-center"><Hourglass className="w-4 h-4 mr-2" />Expira: {format(new Date(challenge.expires_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</div>
    )}
    {challenge.message && (
      <div className="text-sm p-2 mt-2 bg-muted/50 rounded italic border-l-2 border-primary/40">"{challenge.message}"</div>
    )}
  </div>
);

const Empty = ({ icon: Icon, title, msg }: { icon: typeof Clock; title: string; msg: string }) => (
  <div className="text-center py-16">
    <Icon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/60" />
    <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground">{msg}</p>
  </div>
);

const Loading = ({ msg }: { msg: string }) => (
  <div className="text-center py-12">
    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
    <p className="text-muted-foreground">{msg}</p>
  </div>
);

// ============== Card de desafio aceito (engloba accepted/reported/disputed) ==============
const AcceptedCard = ({ challenge }: { challenge: Challenge }) => {
  const { currentPlayer } = useAuth();
  const {
    checkIn, isCheckingIn,
    confirmResult, isConfirming,
    disputeResult, isDisputing,
  } = useChallenges();
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [reason, setReason] = useState("");

  const isChallenger = challenge.challenger_id === currentPlayer?.id;
  const myCheckIn = isChallenger ? challenge.challenger_checked_in_at : challenge.challenged_checked_in_at;
  const otherCheckIn = isChallenger ? challenge.challenged_checked_in_at : challenge.challenger_checked_in_at;
  const bothCheckedIn = !!challenge.challenger_checked_in_at && !!challenge.challenged_checked_in_at;

  return (
    <Card className="bg-gradient-card border-border/50 hover:border-primary/40 transition-all">
      <CardHeader><PairHeader challenge={challenge} /></CardHeader>
      <CardContent className="space-y-4">
        <InfoRow challenge={challenge} />

        {/* Painel de check-in */}
        {challenge.status === "accepted" && (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-2">
            <div className="text-sm font-medium">Check-in dos jogadores</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                {challenge.challenger_checked_in_at ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Hourglass className="w-4 h-4 text-muted-foreground" />}
                <span className="truncate">{challenge.challenger.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {challenge.challenged_checked_in_at ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Hourglass className="w-4 h-4 text-muted-foreground" />}
                <span className="truncate">{challenge.challenged.name}</span>
              </div>
            </div>
          </div>
        )}

        {/* Painel de resultado reportado */}
        {challenge.status === "reported" && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-2 text-sm">
            <div className="flex items-center gap-2 font-medium text-amber-400">
              <Award className="w-4 h-4" />
              Vencedor reportado:{" "}
              {challenge.reported_winner_id === challenge.challenger_id
                ? challenge.challenger.name
                : challenge.challenged.name}
            </div>
            {challenge.reported_notes && (
              <div className="text-muted-foreground italic">Notas: {challenge.reported_notes}</div>
            )}
            {challenge.reported_evidence_url && (
              <a href={challenge.reported_evidence_url} target="_blank" rel="noreferrer"
                 className="text-primary underline break-all">Evidência</a>
            )}
          </div>
        )}

        {/* Em disputa */}
        {challenge.status === "disputed" && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-3 text-sm">
            <div className="flex items-center gap-2 font-medium text-red-400">
              <ShieldAlert className="w-4 h-4" />
              Em disputa — moderação foi notificada.
            </div>
            {challenge.dispute_reason && (
              <div className="text-muted-foreground italic mt-1">Motivo: {challenge.dispute_reason}</div>
            )}
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-wrap gap-2 justify-end">
          {challenge.status === "accepted" && !myCheckIn && (
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => checkIn(challenge.id)} disabled={isCheckingIn}>
              <CheckCircle className="w-4 h-4 mr-2" /> Fazer check-in
            </Button>
          )}
          {challenge.status === "accepted" && myCheckIn && !otherCheckIn && (
            <Badge variant="outline" className="text-xs">Aguardando oponente fazer check-in…</Badge>
          )}
          {challenge.status === "accepted" && bothCheckedIn && (
            <ReportMatchDialog challenge={challenge}>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Trophy className="w-4 h-4 mr-2" /> Reportar resultado
              </Button>
            </ReportMatchDialog>
          )}

          {challenge.status === "reported" && challenge.reported_by !== currentPlayer?.id && (
            <>
              <Button size="sm" variant="outline" className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                      onClick={() => setDisputeOpen(true)} disabled={isDisputing}>
                <ShieldAlert className="w-4 h-4 mr-2" /> Contestar
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700"
                      onClick={() => confirmResult(challenge.id)} disabled={isConfirming}>
                <CheckCircle className="w-4 h-4 mr-2" /> Confirmar resultado
              </Button>
            </>
          )}
          {challenge.status === "reported" && challenge.reported_by === currentPlayer?.id && (
            <Badge variant="outline" className="text-xs">Aguardando oponente confirmar…</Badge>
          )}
        </div>
      </CardContent>

      <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contestar resultado</DialogTitle>
            <DialogDescription>
              Descreva o que aconteceu. A moderação revisará o caso.
            </DialogDescription>
          </DialogHeader>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={5}
                    placeholder="Explique o motivo da contestação..." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisputeOpen(false)}>Cancelar</Button>
            <Button variant="destructive" disabled={!reason.trim() || isDisputing}
                    onClick={() => { disputeResult({ id: challenge.id, reason: reason.trim() }); setDisputeOpen(false); setReason(""); }}>
              Enviar contestação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// ================ PÁGINA ================
const Challenges = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const { currentPlayer } = useAuth();
  const {
    pendingChallenges, acceptedChallenges, challengeHistory,
    loadingPending, loadingAccepted, loadingHistory,
    acceptChallenge, rejectChallenge, cancelChallenge,
    isAccepting, isRejecting, isCancelling,
  } = useChallenges();

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="challenges" />

      <section className="py-12 bg-gradient-card border-b border-border/50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-ninja text-4xl sm:text-5xl font-bold mb-4">⚔️ DESAFIOS NINJA</h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6">
            Desafie outros ninjas e prove seu valor na arena
          </p>
          <CreateChallengeDialog>
            <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-ninja px-8">
              <Target className="w-5 h-5 mr-2" /> CRIAR NOVO DESAFIO
            </Button>
          </CreateChallengeDialog>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="pending"><Clock className="w-4 h-4 mr-2" />Pendentes ({pendingChallenges.length})</TabsTrigger>
              <TabsTrigger value="accepted"><Swords className="w-4 h-4 mr-2" />Em andamento ({acceptedChallenges.length})</TabsTrigger>
              <TabsTrigger value="history"><Trophy className="w-4 h-4 mr-2" />Histórico ({challengeHistory.length})</TabsTrigger>
            </TabsList>

            {/* ====== Pendentes ====== */}
            <TabsContent value="pending" className="space-y-4">
              {loadingPending ? <Loading msg="Carregando desafios..." /> :
                pendingChallenges.length === 0 ? (
                  <Empty icon={Clock} title="Nenhum desafio pendente" msg="Crie um novo desafio para começar!" />
                ) : pendingChallenges.map((c) => {
                  const isChallenger = c.challenger_id === currentPlayer?.id;
                  return (
                    <Card key={c.id} className="bg-gradient-card border-border/50 hover:border-primary/40 transition-all">
                      <CardHeader><PairHeader challenge={c} /></CardHeader>
                      <CardContent className="space-y-4">
                        <InfoRow challenge={c} />
                        <div className="flex flex-wrap gap-2 justify-end">
                          {!isChallenger ? (
                            <>
                              <Button size="sm" variant="outline"
                                      className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                                      onClick={() => rejectChallenge(c.id)} disabled={isRejecting}>
                                <XCircle className="w-4 h-4 mr-2" /> Recusar
                              </Button>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700"
                                      onClick={() => acceptChallenge(c.id)} disabled={isAccepting}>
                                <CheckCircle className="w-4 h-4 mr-2" /> Aceitar
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" variant="outline"
                                    className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                                    onClick={() => cancelChallenge(c.id)} disabled={isCancelling}>
                              <XCircle className="w-4 h-4 mr-2" /> Cancelar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </TabsContent>

            {/* ====== Em andamento ====== */}
            <TabsContent value="accepted" className="space-y-4">
              {loadingAccepted ? <Loading msg="Carregando desafios..." /> :
                acceptedChallenges.length === 0 ? (
                  <Empty icon={Swords} title="Nada em andamento" msg="Aceite um desafio para iniciar uma batalha." />
                ) : acceptedChallenges.map((c) => <AcceptedCard key={c.id} challenge={c} />)}
            </TabsContent>

            {/* ====== Histórico ====== */}
            <TabsContent value="history" className="space-y-4">
              {loadingHistory ? <Loading msg="Carregando histórico..." /> :
                challengeHistory.length === 0 ? (
                  <Empty icon={Trophy} title="Nenhum histórico ainda" msg="Complete desafios para ver seu histórico aqui." />
                ) : challengeHistory.map((c) => {
                  const winnerName = c.reported_winner_id === c.challenger_id ? c.challenger.name
                    : c.reported_winner_id === c.challenged_id ? c.challenged.name : null;
                  return (
                    <Card key={c.id} className="bg-gradient-card border-border/50">
                      <CardHeader><PairHeader challenge={c} /></CardHeader>
                      <CardContent className="space-y-2">
                        <InfoRow challenge={c} />
                        {c.status === "completed" && winnerName && (
                          <div className="flex items-center gap-2 text-sm text-green-400 font-medium">
                            <Award className="w-4 h-4" /> Vencedor: {winnerName}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Challenges;

import { useParams, useNavigate } from "react-router-dom";
import { useTournament, useRegisterForTournament, useCheckInTournament, useReportTournamentMatch, useConfirmTournamentMatch, useCreateDispute, useTournamentDisputes, useResolveDispute } from "@/hooks/useTournaments";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/ui/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TournamentBracketDBZ } from "@/components/tournaments/TournamentBracketDBZ";
import { TournamentCheckInCard } from "@/components/tournaments/TournamentCheckInCard";
import { TournamentResultReport } from "@/components/tournaments/TournamentResultReport";
import { TournamentManagement } from "@/components/tournaments/TournamentManagement";
import { TournamentDisputePanel } from "@/components/tournaments/TournamentDisputePanel";
import { TournamentCountdown } from "@/components/tournaments/TournamentCountdown";
import { TournamentPhaseProgress } from "@/components/tournaments/TournamentPhaseIndicator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Trophy, Users, CheckCircle, Clock, Flag, Swords, Zap, Shield, AlertTriangle } from "lucide-react";
import { format, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentPlayer } = useAuth();
  const { data: tournament, isLoading } = useTournament(id);
  const { data: disputes = [] } = useTournamentDisputes(id);
  const registerForTournament = useRegisterForTournament();
  const checkInTournament = useCheckInTournament();
  const reportMatch = useReportTournamentMatch();
  const confirmMatch = useConfirmTournamentMatch();
  const createDispute = useCreateDispute();
  const resolveDispute = useResolveDispute();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-bold mb-2">Torneio não encontrado</h2>
              <Button onClick={() => navigate("/tournaments")}>Voltar aos Torneios</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const participants = tournament.participants || [];
  const matches = tournament.matches || [];
  const isRegistered = participants.some((p: any) => p.player_id === currentPlayer?.id);
  const myParticipation = participants.find((p: any) => p.player_id === currentPlayer?.id);
  const isModerator = currentPlayer?.is_moderator || currentPlayer?.is_admin;
  const now = new Date();
  const canRegister = tournament.status === "registration" && 
    isAfter(now, new Date(tournament.registration_start)) &&
    isBefore(now, new Date(tournament.registration_end)) &&
    participants.length < (tournament.max_participants || 32);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "registration": return "bg-gradient-to-r from-green-500 to-emerald-500";
      case "check_in": return "bg-gradient-to-r from-yellow-500 to-orange-500";
      case "in_progress": return "bg-gradient-to-r from-primary to-accent";
      case "completed": return "bg-gradient-to-r from-gray-500 to-slate-500";
      default: return "bg-secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "registration": return "⚡ Inscrições Abertas";
      case "check_in": return "🔥 Período de Check-in";
      case "in_progress": return "⚔️ Em Andamento";
      case "completed": return "🏆 Finalizado";
      default: return status;
    }
  };

  const handleRegister = async () => {
    if (!currentPlayer) return;
    await registerForTournament.mutateAsync({
      tournamentId: tournament.id,
      playerId: currentPlayer.id,
    });
  };

  const handleCheckIn = async () => {
    if (!myParticipation) return;
    await checkInTournament.mutateAsync(myParticipation.id);
  };

  const handleReportResult = async (data: {
    matchId: string;
    winnerId: string;
    player1Score: number;
    player2Score: number;
    evidenceUrl?: string;
    notes?: string;
  }) => {
    await reportMatch.mutateAsync({
      ...data,
      reportedBy: myParticipation?.id,
    });
  };

  const handleConfirmResult = async (matchId: string) => {
    if (!myParticipation) return;
    await confirmMatch.mutateAsync({
      matchId,
      confirmedBy: myParticipation.id,
    });
  };

  const handleDispute = async (data: { matchId: string; reason: string; evidenceUrl?: string }) => {
    if (!currentPlayer) return;
    await createDispute.mutateAsync({
      matchId: data.matchId,
      reportedBy: currentPlayer.id,
      reason: data.reason,
      evidenceUrl: data.evidenceUrl,
    });
  };

  const handleResolveDispute = async (disputeId: string, resolution: "player1" | "player2" | "annul", notes: string) => {
    if (!currentPlayer) return;
    
    const dispute = disputes.find((d: any) => d.id === disputeId);
    if (!dispute) return;

    const matchId = dispute.match_id;
    const match = matches.find((m: any) => m.id === matchId);
    if (!match) return;

    await resolveDispute.mutateAsync({
      disputeId,
      matchId,
      winnerId: resolution === "player1" ? match.player1_id : resolution === "player2" ? match.player2_id : undefined,
      resolvedBy: currentPlayer.id,
      notes,
      shouldAnnul: resolution === "annul",
    });
  };

  // Find current player's active match
  const myActiveMatch = matches.find((m: any) =>
    (m.player1?.player?.id === currentPlayer?.id || m.player2?.player?.id === currentPlayer?.id) &&
    (m.status === "pending" || m.status === "awaiting_confirmation" || m.status === "in_progress")
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => navigate("/tournaments")} className="mb-6">
          ← Voltar aos Torneios
        </Button>

        {/* Header with Banner */}
        <div className="relative mb-8">
          {tournament.image_url && (
            <div className="w-full h-72 rounded-xl overflow-hidden relative">
              <img 
                src={tournament.image_url} 
                alt={tournament.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            </div>
          )}
          
          <div className={`${tournament.image_url ? "absolute bottom-0 left-0 right-0 p-6" : ""}`}>
            <div className="flex items-start justify-between">
              <div>
                <Badge className={`${getStatusColor(tournament.status)} text-white mb-3`}>
                  {getStatusText(tournament.status)}
                </Badge>
                <h1 className="text-4xl font-bold mb-2">{tournament.name}</h1>
                <p className="text-muted-foreground max-w-2xl">{tournament.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-background to-muted/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{participants.length}/{tournament.max_participants || 32}</p>
                  <p className="text-xs text-muted-foreground">Participantes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-background to-muted/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-sm font-bold">{format(new Date(tournament.tournament_start), "dd/MM", { locale: ptBR })}</p>
                  <p className="text-xs text-muted-foreground">Início</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-background to-muted/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Swords className="h-8 w-8 text-destructive" />
                <div>
                  <p className="text-sm font-bold">{matches.filter((m: any) => m.status === "completed").length}/{matches.length}</p>
                  <p className="text-xs text-muted-foreground">Partidas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-background to-muted/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm font-bold">Rodada {tournament.current_round || 1}</p>
                  <p className="text-xs text-muted-foreground">Fase Atual</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Area */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Registration Actions */}
          {canRegister && !isRegistered && (
            <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
                  <h3 className="text-xl font-bold mb-2">Inscreva-se Agora!</h3>
                  <p className="text-muted-foreground mb-4">
                    Restam {(tournament.max_participants || 32) - participants.length} vagas
                  </p>
                  <Button 
                    onClick={handleRegister} 
                    disabled={registerForTournament.isPending}
                    size="lg"
                    className="w-full"
                  >
                    {registerForTournament.isPending ? "Inscrevendo..." : "Inscrever-se no Torneio"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Countdown Timers */}
          {tournament.status === "registration" && (
            <TournamentCountdown
              targetDate={tournament.registration_end}
              label="Inscrições encerram em"
              variant="registration"
            />
          )}

          {tournament.status === "check_in" && tournament.check_in_end && (
            <TournamentCountdown
              targetDate={tournament.check_in_end}
              label="Check-in encerra em"
              variant="checkin"
            />
          )}

          {(tournament.status === "registration" || tournament.status === "check_in") && (
            <TournamentCountdown
              targetDate={tournament.tournament_start}
              label="Torneio começa em"
              variant="start"
            />
          )}

          {isRegistered && tournament.check_in_start && tournament.check_in_end && (
            <TournamentCheckInCard
              checkInStart={tournament.check_in_start}
              checkInEnd={tournament.check_in_end}
              hasCheckedIn={myParticipation?.checked_in || false}
              onCheckIn={handleCheckIn}
              isLoading={checkInTournament.isPending}
            />
          )}

          {/* My Current Match */}
          {myActiveMatch && (
            <Card className="border-accent/50 bg-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5 text-accent" />
                  Sua Próxima Batalha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-primary">
                      <AvatarImage src={myActiveMatch.player1?.player?.avatar_url} />
                      <AvatarFallback>{myActiveMatch.player1?.player?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-bold">{myActiveMatch.player1?.player?.name}</span>
                  </div>
                  <Badge variant="outline" className="mx-4">VS</Badge>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{myActiveMatch.player2?.player?.name}</span>
                    <Avatar className="h-12 w-12 border-2 border-primary">
                      <AvatarImage src={myActiveMatch.player2?.player?.avatar_url} />
                      <AvatarFallback>{myActiveMatch.player2?.player?.name?.[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <TournamentResultReport
                  matchId={myActiveMatch.id}
                  player1={myActiveMatch.player1?.player}
                  player2={myActiveMatch.player2?.player}
                  player1ParticipantId={myActiveMatch.player1_id}
                  player2ParticipantId={myActiveMatch.player2_id}
                  currentPlayerId={currentPlayer?.id}
                  reportedWinnerId={myActiveMatch.reported_winner_id}
                  reportedBy={myActiveMatch.reported_by}
                  isConfirmed={myActiveMatch.status === "completed"}
                  onReport={handleReportResult}
                  onConfirm={handleConfirmResult}
                  onDispute={handleDispute}
                >
                  <Button className="w-full">
                    {myActiveMatch.status === "awaiting_confirmation" ? "Ver/Confirmar Resultado" : "Reportar Resultado"}
                  </Button>
                </TournamentResultReport>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Management for Moderators */}
        {isModerator && (tournament.status === "check_in" || tournament.status === "in_progress") && (
          <div className="mb-6">
            <TournamentManagement
              tournamentId={tournament.id}
              status={tournament.status}
              participants={participants}
              maxParticipants={tournament.max_participants || 32}
            />
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="bracket" className="w-full">
          <TabsList className={cn("grid w-full", isModerator ? "grid-cols-5" : "grid-cols-4")}>
            <TabsTrigger value="bracket">⚔️ Chaveamento</TabsTrigger>
            <TabsTrigger value="participants">👥 Participantes</TabsTrigger>
            <TabsTrigger value="overview">📋 Informações</TabsTrigger>
            <TabsTrigger value="rewards">🏆 Recompensas</TabsTrigger>
            {isModerator && (
              <TabsTrigger value="disputes" className="relative">
                🛡️ Disputas
                {disputes.filter((d: any) => d.status === "pending").length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-xs">
                    {disputes.filter((d: any) => d.status === "pending").length}
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="bracket" className="space-y-4 mt-6">
            {/* Phase Progress */}
            {matches.length > 0 && (
              <TournamentPhaseProgress 
                currentRound={tournament.current_round || 1} 
                totalRounds={Math.max(...matches.map((m: any) => m.round))} 
              />
            )}
            
            <TournamentBracketDBZ 
              matches={matches} 
              currentRound={tournament.current_round || 1}
            />
          </TabsContent>

          <TabsContent value="participants" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participantes ({participants.length})
                </CardTitle>
                <CardDescription>
                  {participants.filter((p: any) => p.checked_in).length} confirmados via check-in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {participants.map((participant: any, index: number) => (
                    <div 
                      key={participant.id} 
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border hover:border-primary/50 transition-colors"
                    >
                      <span className="text-sm text-muted-foreground w-6">#{index + 1}</span>
                      <Avatar className="h-10 w-10 border-2 border-muted">
                        <AvatarImage src={participant.player?.avatar_url || undefined} />
                        <AvatarFallback>{participant.player?.name?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{participant.player?.name}</p>
                        <p className="text-xs text-muted-foreground">{participant.player?.rank}</p>
                      </div>
                      {participant.checked_in && (
                        <Badge variant="outline" className="text-green-500 border-green-500 shrink-0">
                          <CheckCircle className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Torneio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Período de Inscrições
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(tournament.registration_start), "PPP 'às' HH:mm", { locale: ptBR })}
                      <br />até {format(new Date(tournament.registration_end), "PPP 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  
                  {tournament.check_in_start && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Período de Check-in
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(tournament.check_in_start), "PPP 'às' HH:mm", { locale: ptBR })}
                        <br />até {format(new Date(tournament.check_in_end!), "PPP 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  )}
                </div>

                {(tournament.min_rank || tournament.max_rank) && (
                  <div>
                    <h4 className="font-medium mb-2">Requisitos de Rank</h4>
                    <div className="flex gap-2">
                      {tournament.min_rank && <Badge variant="outline">Mínimo: {tournament.min_rank}</Badge>}
                      {tournament.max_rank && <Badge variant="outline">Máximo: {tournament.max_rank}</Badge>}
                    </div>
                  </div>
                )}

                {tournament.require_top_character && tournament.required_character && (
                  <div>
                    <h4 className="font-medium mb-2">Requisito Especial</h4>
                    <Badge className="bg-accent text-accent-foreground">
                      Requer Top 1 com {tournament.required_character}
                    </Badge>
                  </div>
                )}

                {tournament.rules_text && (
                  <div>
                    <h4 className="font-medium mb-2">Regras do Torneio</h4>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm whitespace-pre-line">{tournament.rules_text}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Recompensas
                </CardTitle>
                <CardDescription>Premiação por colocação</CardDescription>
              </CardHeader>
              <CardContent>
                {tournament.rewards && tournament.rewards.length > 0 ? (
                  <div className="space-y-4">
                    {tournament.rewards
                      .sort((a: any, b: any) => a.position - b.position)
                      .map((reward: any) => (
                        <div 
                          key={reward.id} 
                          className={`flex items-center gap-4 p-4 rounded-lg border-2 ${
                            reward.position === 1 ? "border-yellow-500 bg-yellow-500/10" :
                            reward.position === 2 ? "border-gray-400 bg-gray-400/10" :
                            reward.position === 3 ? "border-orange-600 bg-orange-600/10" :
                            "border-muted"
                          }`}
                        >
                          <div className={`text-3xl font-bold ${
                            reward.position === 1 ? "text-yellow-500" :
                            reward.position === 2 ? "text-gray-400" :
                            reward.position === 3 ? "text-orange-600" :
                            "text-muted-foreground"
                          }`}>
                            #{reward.position}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-lg">
                              {reward.position === 1 ? "🥇 Campeão" :
                               reward.position === 2 ? "🥈 Vice-Campeão" :
                               reward.position === 3 ? "🥉 Terceiro Lugar" :
                               `${reward.position}º Lugar`}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {reward.points_reward > 0 && (
                                <Badge variant="outline" className="bg-primary/10">
                                  +{reward.points_reward} pontos
                                </Badge>
                              )}
                              {reward.banner && (
                                <Badge variant="outline" className="bg-accent/10">
                                  🎨 Banner: {reward.banner.display_name}
                                </Badge>
                              )}
                              {reward.achievement && (
                                <Badge variant="outline" className="bg-yellow-500/10">
                                  🏅 {reward.achievement.display_name}
                                </Badge>
                              )}
                              {reward.custom_reward_text && (
                                <Badge variant="outline">
                                  {reward.custom_reward_text}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhuma recompensa definida ainda</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disputes Tab - Moderators Only */}
          {isModerator && (
            <TabsContent value="disputes" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Painel de Disputas
                  </CardTitle>
                  <CardDescription>
                    Gerencie contestações de resultados reportados pelos jogadores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TournamentDisputePanel
                    disputes={disputes}
                    isModerator={isModerator}
                    onResolve={handleResolveDispute}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
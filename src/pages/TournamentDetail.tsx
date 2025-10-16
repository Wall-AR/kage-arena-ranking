import { useParams, useNavigate } from "react-router-dom";
import { useTournament, useRegisterForTournament, useCheckInTournament } from "@/hooks/useTournaments";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/ui/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TournamentBracket } from "@/components/tournaments/TournamentBracket";
import { TournamentMatchReportDialog } from "@/components/tournaments/TournamentMatchReportDialog";
import { TournamentManagement } from "@/components/tournaments/TournamentManagement";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Trophy, Users, CheckCircle, Clock, Flag } from "lucide-react";
import { format, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentPlayer } = useAuth();
  const { data: tournament, isLoading } = useTournament(id);
  const registerForTournament = useRegisterForTournament();
  const checkInTournament = useCheckInTournament();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p>Torneio não encontrado</p>
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
    participants.length < tournament.max_participants;
  const canCheckIn = tournament.check_in_start && tournament.check_in_end &&
    isAfter(now, new Date(tournament.check_in_start)) &&
    isBefore(now, new Date(tournament.check_in_end)) &&
    isRegistered && !myParticipation?.checked_in;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "registration": return "bg-ninja-jounin";
      case "check_in": return "bg-accent";
      case "in_progress": return "bg-primary";
      case "completed": return "bg-muted";
      default: return "bg-secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "registration": return "Inscrições Abertas";
      case "check_in": return "Check-in";
      case "in_progress": return "Em Andamento";
      case "completed": return "Finalizado";
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => navigate("/tournaments")} className="mb-6">
          ← Voltar
        </Button>

        {/* Header */}
        {tournament.image_url && (
          <div className="w-full h-64 rounded-lg overflow-hidden mb-6">
            <img 
              src={tournament.image_url} 
              alt={tournament.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{tournament.name}</h1>
            <p className="text-muted-foreground">{tournament.description}</p>
          </div>
          <Badge className={getStatusColor(tournament.status)}>
            {getStatusText(tournament.status)}
          </Badge>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{participants.length}/{tournament.max_participants}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Início</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">{format(new Date(tournament.tournament_start), "PPP 'às' HH:mm", { locale: ptBR })}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Formato</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">{tournament.tournament_type === 'single_elimination' ? 'Eliminação Simples' : tournament.tournament_type}</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          {canRegister && !isRegistered && (
            <Button onClick={handleRegister} disabled={registerForTournament.isPending}>
              {registerForTournament.isPending ? "Inscrevendo..." : "Inscrever-se"}
            </Button>
          )}
          {canCheckIn && (
            <Button onClick={handleCheckIn} disabled={checkInTournament.isPending} variant="outline">
              <CheckCircle className="mr-2 h-4 w-4" />
              {checkInTournament.isPending ? "Fazendo check-in..." : "Fazer Check-in"}
            </Button>
          )}
          {isRegistered && !canCheckIn && myParticipation?.checked_in && (
            <Badge variant="outline" className="text-green-500 border-green-500">
              <CheckCircle className="mr-2 h-4 w-4" />
              Check-in realizado
            </Badge>
          )}
        </div>

        {/* Management for Moderators */}
        {isModerator && (status === "check_in" || status === "in_progress") && (
          <TournamentManagement
            tournamentId={tournament.id}
            status={tournament.status}
            participants={participants}
            maxParticipants={tournament.max_participants}
          />
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="participants">Participantes</TabsTrigger>
            <TabsTrigger value="bracket">Chaveamento</TabsTrigger>
            <TabsTrigger value="rewards">Recompensas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Período de Inscrições</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(tournament.registration_start), "PPP 'às' HH:mm", { locale: ptBR })} até {format(new Date(tournament.registration_end), "PPP 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                {tournament.check_in_start && (
                  <div>
                    <h4 className="font-medium mb-2">Período de Check-in</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(tournament.check_in_start), "PPP 'às' HH:mm", { locale: ptBR })} até {format(new Date(tournament.check_in_end!), "PPP 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                )}
                {(tournament.min_rank || tournament.max_rank) && (
                  <div>
                    <h4 className="font-medium mb-2">Requisitos de Rank</h4>
                    <p className="text-sm text-muted-foreground">
                      {tournament.min_rank && `Mínimo: ${tournament.min_rank}`}
                      {tournament.min_rank && tournament.max_rank && " | "}
                      {tournament.max_rank && `Máximo: ${tournament.max_rank}`}
                    </p>
                  </div>
                )}
                {tournament.require_top_character && (
                  <div>
                    <h4 className="font-medium mb-2">Requisito Especial</h4>
                    <p className="text-sm text-muted-foreground">
                      Requer Top 1 com {tournament.required_character}
                    </p>
                  </div>
                )}
                {tournament.rules_text && (
                  <div>
                    <h4 className="font-medium mb-2">Regras</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{tournament.rules_text}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="participants">
            <Card>
              <CardHeader>
                <CardTitle>Participantes ({participants.length})</CardTitle>
                <CardDescription>Lista de jogadores inscritos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {participants.map((participant: any) => (
                    <div key={participant.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Avatar>
                        <AvatarImage src={participant.player?.avatar_url || undefined} />
                        <AvatarFallback>{participant.player?.name?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{participant.player?.name}</p>
                        <p className="text-xs text-muted-foreground">{participant.player?.rank}</p>
                      </div>
                      {participant.checked_in && (
                        <Badge variant="outline" className="text-green-500 border-green-500">
                          <CheckCircle className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bracket" className="space-y-4">
            {matches.length > 0 ? (
              <>
                <TournamentBracket matches={matches} currentRound={tournament.current_round} />
                
                {/* Lista de partidas para reportar resultados */}
                {(isRegistered || isModerator) && status === "in_progress" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Suas Partidas</CardTitle>
                      <CardDescription>Reporte os resultados de suas partidas</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {matches
                        .filter((match: any) => 
                          match.status === 'pending' && 
                          match.player1_id && 
                          match.player2_id &&
                          (isModerator || 
                           match.player1?.player?.id === currentPlayer?.id || 
                           match.player2?.player?.id === currentPlayer?.id)
                        )
                        .map((match: any) => (
                          <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <Flag className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">
                                  {match.player1?.player?.name} vs {match.player2?.player?.name}
                                </p>
                                <p className="text-sm text-muted-foreground">Rodada {match.round}</p>
                              </div>
                            </div>
                            <TournamentMatchReportDialog
                              matchId={match.id}
                              player1={match.player1?.player}
                              player2={match.player2?.player}
                              isParticipant={isRegistered}
                            >
                              <Button size="sm">Reportar Resultado</Button>
                            </TournamentMatchReportDialog>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">O chaveamento será gerado quando o torneio iniciar</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rewards">
            <Card>
              <CardHeader>
                <CardTitle>Recompensas</CardTitle>
                <CardDescription>Premiação por colocação</CardDescription>
              </CardHeader>
              <CardContent>
                {tournament.prize_description && (
                  <div className="mb-4 p-4 bg-gradient-kage/10 rounded-lg">
                    <p className="font-medium">{tournament.prize_description}</p>
                  </div>
                )}
                {tournament.rewards && tournament.rewards.length > 0 ? (
                  <div className="space-y-3">
                    {tournament.rewards.map((reward: any) => (
                      <div key={reward.id} className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className="flex-1">
                          <p className="font-medium">{reward.position}º Lugar</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {reward.points_reward > 0 && (
                              <Badge variant="outline">+{reward.points_reward} pontos</Badge>
                            )}
                            {reward.banner && (
                              <Badge variant="outline">Banner: {reward.banner.display_name}</Badge>
                            )}
                            {reward.achievement && (
                              <Badge variant="outline">Conquista: {reward.achievement.display_name}</Badge>
                            )}
                            {reward.custom_reward_text && (
                              <Badge variant="outline">{reward.custom_reward_text}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">Nenhuma recompensa definida</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/ui/navigation";
import { Swords, Clock, CheckCircle, XCircle, Target, Calendar, Trophy } from "lucide-react";
import { useChallenges } from "@/hooks/useChallenges";
import { useAuth } from "@/hooks/useAuth";
import { CreateChallengeDialog } from "@/components/challenges/CreateChallengeDialog";
import { ReportMatchDialog } from "@/components/challenges/ReportMatchDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Página de Desafios - Kage Arena
// Criado por Wall - Sistema completo de desafios entre jogadores
const Challenges = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const { currentPlayer } = useAuth();
  
  const {
    pendingChallenges,
    acceptedChallenges,
    challengeHistory,
    loadingPending,
    loadingAccepted,
    loadingHistory,
    acceptChallenge,
    rejectChallenge,
    checkIn,
    isAccepting,
    isRejecting,
    isCheckingIn
  } = useChallenges();

  const getMatchTypeLabel = (type: string) => {
    const types = {
      'FT5': 'Melhor de 9 (FT5)',
      'FT7': 'Melhor de 13 (FT7)',
      'FT10': 'Melhor de 19 (FT10)'
    };
    return types[type as keyof typeof types] || type;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-orange-500/20 text-orange-500',
      'waiting_response': 'bg-blue-500/20 text-blue-500',
      'accepted': 'bg-green-500/20 text-green-500',
      'completed': 'bg-gray-500/20 text-gray-500',
      'expired': 'bg-red-500/20 text-red-500'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'pending': 'Aguardando Resposta',
      'waiting_response': 'Resposta Pendente',
      'accepted': 'Aceito - Check-in',
      'completed': 'Concluído',
      'expired': 'Expirado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="challenges" />
      
      {/* Header da Página */}
      <section className="py-12 bg-gradient-card border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="font-ninja text-5xl font-bold text-foreground mb-4">
              ⚔️ DESAFIOS NINJA
            </h1>
            <p className="text-xl text-muted-foreground">
              Desafie outros ninjas e prove seu valor na arena
            </p>
          </div>
          
          {/* Botão para Criar Novo Desafio */}
          <div className="text-center">
            <CreateChallengeDialog>
              <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-ninja px-8 py-3">
                <Target className="w-5 h-5 mr-2" />
                CRIAR NOVO DESAFIO
              </Button>
            </CreateChallengeDialog>
          </div>
        </div>
      </section>

      {/* Abas de Desafios */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pendentes ({pendingChallenges.length})
              </TabsTrigger>
              <TabsTrigger value="accepted" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Aceitos ({acceptedChallenges.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Histórico ({challengeHistory.length})
              </TabsTrigger>
            </TabsList>

            {/* Desafios Pendentes */}
            <TabsContent value="pending" className="space-y-4">
              {loadingPending ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando desafios...</p>
                </div>
              ) : pendingChallenges.length > 0 ? (
                pendingChallenges.map((challenge) => {
                  const isChallenger = challenge.challenger_id === currentPlayer?.id;
                  const opponent = isChallenger ? challenge.challenged : challenge.challenger;
                  
                  return (
                    <Card key={challenge.id} className="bg-gradient-card border-border/50 hover:border-primary/30 transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {!isChallenger ? (
                              <>
                                <Avatar className="w-12 h-12">
                                  <AvatarImage src={challenge.challenger.avatar_url || ""} />
                                  <AvatarFallback>{challenge.challenger.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-lg">{challenge.challenger.name}</CardTitle>
                                  <Badge variant="secondary" className="text-xs">{challenge.challenger.rank}</Badge>
                                </div>
                              </>
                            ) : (
                              <div className="text-foreground font-semibold">Você desafiou</div>
                            )}
                            
                            <Swords className="w-6 h-6 text-primary mx-4" />
                            
                            {isChallenger ? (
                              <>
                                <Avatar className="w-12 h-12">
                                  <AvatarImage src={challenge.challenged.avatar_url || ""} />
                                  <AvatarFallback>{challenge.challenged.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-lg">{challenge.challenged.name}</CardTitle>
                                  <Badge variant="secondary" className="text-xs">{challenge.challenged.rank}</Badge>
                                </div>
                              </>
                            ) : (
                              <div className="text-foreground font-semibold">Você foi desafiado</div>
                            )}
                          </div>
                          
                          <Badge className={getStatusColor(challenge.status)}>
                            {getStatusLabel(challenge.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Trophy className="w-4 h-4 mr-2" />
                              Formato: {getMatchTypeLabel(challenge.match_type)}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4 mr-2" />
                              Criado em: {format(new Date(challenge.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="w-4 h-4 mr-2" />
                              Expira em: {format(new Date(challenge.expires_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </div>
                            {challenge.message && (
                              <div className="text-sm p-2 bg-muted rounded italic">
                                "{challenge.message}"
                              </div>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            {!isChallenger ? (
                              // Usuário foi desafiado - pode aceitar ou recusar
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                                  onClick={() => rejectChallenge(challenge.id)}
                                  disabled={isRejecting}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Recusar
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => acceptChallenge(challenge.id)}
                                  disabled={isAccepting}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Aceitar
                                </Button>
                              </>
                            ) : (
                              // Usuário criou o desafio - pode cancelar
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                                onClick={() => rejectChallenge(challenge.id)}
                                disabled={isRejecting}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancelar
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum desafio pendente</h3>
                  <p className="text-muted-foreground">Crie um novo desafio para começar a batalhar!</p>
                </div>
              )}
            </TabsContent>

            {/* Desafios Aceitos */}
            <TabsContent value="accepted" className="space-y-4">
              {loadingAccepted ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando desafios aceitos...</p>
                </div>
              ) : acceptedChallenges.length > 0 ? (
                acceptedChallenges.map((challenge) => {
                  const isChallenger = challenge.challenger_id === currentPlayer?.id;
                  const hasUserCheckedIn = challenge.checked_in_at !== null;
                  const bothCheckedIn = hasUserCheckedIn; // Simplificado para demo
                  
                  return (
                    <Card key={challenge.id} className="bg-gradient-card border-green-500/30 hover:border-green-500/60 transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={challenge.challenger.avatar_url || ""} />
                              <AvatarFallback>{challenge.challenger.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{challenge.challenger.name}</CardTitle>
                              <Badge variant="secondary" className="text-xs">{challenge.challenger.rank}</Badge>
                            </div>
                            
                            <Swords className="w-6 h-6 text-primary mx-4" />
                            
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={challenge.challenged.avatar_url || ""} />
                              <AvatarFallback>{challenge.challenged.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{challenge.challenged.name}</CardTitle>
                              <Badge variant="secondary" className="text-xs">{challenge.challenged.rank}</Badge>
                            </div>
                          </div>
                          
                          <Badge className={getStatusColor(challenge.status)}>
                            {getStatusLabel(challenge.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Trophy className="w-4 h-4 mr-2" />
                              Formato: {getMatchTypeLabel(challenge.match_type)}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4 mr-2" />
                              Aceito em: {format(new Date(challenge.accepted_at!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </div>
                            <div className="flex items-center text-sm">
                              <span className="mr-2">Status:</span>
                              <Badge variant={hasUserCheckedIn ? "default" : "secondary"} className="text-xs">
                                {hasUserCheckedIn ? "✓ Check-in realizado" : "○ Aguardando check-in"}
                              </Badge>
                            </div>
                            {challenge.message && (
                              <div className="text-sm p-2 bg-muted rounded italic">
                                "{challenge.message}"
                              </div>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            {!hasUserCheckedIn && (
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => checkIn(challenge.id)}
                                disabled={isCheckingIn}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Check-in
                              </Button>
                            )}
                            {hasUserCheckedIn && (
                              <ReportMatchDialog challenge={challenge}>
                                <Button size="sm" className="bg-primary hover:bg-primary/90">
                                  <Trophy className="w-4 h-4 mr-2" />
                                  Reportar Resultado
                                </Button>
                              </ReportMatchDialog>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum desafio aceito</h3>
                  <p className="text-muted-foreground">Aceite desafios pendentes para aparecerem aqui!</p>
                </div>
              )}
            </TabsContent>

            {/* Histórico de Desafios */}
            <TabsContent value="history" className="space-y-4">
              {loadingHistory ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando histórico...</p>
                </div>
              ) : challengeHistory.length > 0 ? (
                challengeHistory.map((challenge) => (
                  <Card key={challenge.id} className="bg-gradient-card border-border/50 hover:border-secondary/30 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={challenge.challenger.avatar_url || ""} />
                            <AvatarFallback>{challenge.challenger.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{challenge.challenger.name}</CardTitle>
                            <Badge variant="secondary" className="text-xs">{challenge.challenger.rank}</Badge>
                          </div>
                          
                          <Swords className="w-6 h-6 text-muted-foreground mx-4" />
                          
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={challenge.challenged.avatar_url || ""} />
                            <AvatarFallback>{challenge.challenged.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{challenge.challenged.name}</CardTitle>
                            <Badge variant="secondary" className="text-xs">{challenge.challenged.rank}</Badge>
                          </div>
                        </div>
                        
                        <Badge className={getStatusColor(challenge.status)}>
                          {challenge.status === 'completed' ? 'Concluído' : 
                           challenge.status === 'expired' ? 'Expirado' : 'Cancelado'}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Trophy className="w-4 h-4 mr-2" />
                            Formato: {getMatchTypeLabel(challenge.match_type)}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            Data: {format(new Date(challenge.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                          {challenge.message && (
                            <div className="text-sm p-2 bg-muted rounded italic">
                              "{challenge.message}"
                            </div>
                          )}
                        </div>
                        
                        {challenge.status === 'completed' && (
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              Partida concluída
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum histórico ainda</h3>
                  <p className="text-muted-foreground">Complete alguns desafios para ver o histórico aqui!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Challenges;
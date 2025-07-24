import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/ui/navigation";
import { Swords, Clock, CheckCircle, XCircle, Target, Calendar, Trophy } from "lucide-react";

// Página de Desafios - Kage Arena
// Criado por Wall - Sistema completo de desafios entre jogadores
const Challenges = () => {
  const [activeTab, setActiveTab] = useState("pending");

  // Mock de desafios pendentes
  const pendingChallenges = [
    {
      id: 1,
      challenger: { name: "ThunderGod", rank: "Sannin", avatar: "/placeholder.svg" },
      challenged: "Wall", // Usuário atual
      matchType: "FT5",
      createdAt: "13/01/2025",
      expiresAt: "16/01/2025",
      status: "pending"
    },
    {
      id: 2,
      challenger: "Wall", // Usuário atual
      challenged: { name: "ShadowNinja", rank: "Kage", avatar: "/placeholder.svg" },
      matchType: "FT7",
      createdAt: "12/01/2025",
      expiresAt: "15/01/2025",
      status: "waiting_response"
    }
  ];

  // Mock de desafios aceitos (aguardando partida)
  const acceptedChallenges = [
    {
      id: 3,
      challenger: { name: "FireLord", rank: "Kage", avatar: "/placeholder.svg" },
      challenged: "Wall",
      matchType: "FT5",
      acceptedAt: "11/01/2025",
      scheduledFor: "14/01/2025 20:00",
      status: "accepted",
      checkedIn: { challenger: true, challenged: false }
    }
  ];

  // Mock de histórico de desafios
  const challengeHistory = [
    {
      id: 4,
      challenger: { name: "Wall", rank: "Kage", avatar: "/placeholder.svg" },
      challenged: { name: "WindMaster", rank: "Sannin", avatar: "/placeholder.svg" },
      matchType: "FT7",
      result: { winner: "Wall", score: "7-3" },
      completedAt: "10/01/2025",
      status: "completed"
    },
    {
      id: 5,
      challenger: { name: "BloodRaven", rank: "Anbu", avatar: "/placeholder.svg" },
      challenged: "Wall",
      matchType: "FT5",
      result: { winner: "Wall", score: "5-2" },
      completedAt: "08/01/2025",
      status: "completed"
    }
  ];

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
            <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-ninja px-8 py-3">
              <Target className="w-5 h-5 mr-2" />
              CRIAR NOVO DESAFIO
            </Button>
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
              {pendingChallenges.length > 0 ? (
                pendingChallenges.map((challenge) => (
                  <Card key={challenge.id} className="bg-gradient-card border-border/50 hover:border-primary/30 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {typeof challenge.challenger === 'object' ? (
                            <>
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={challenge.challenger.avatar} />
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
                          
                          {typeof challenge.challenged === 'object' ? (
                            <>
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={challenge.challenged.avatar} />
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
                            Formato: {getMatchTypeLabel(challenge.matchType)}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            Criado em: {challenge.createdAt}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-2" />
                            Expira em: {challenge.expiresAt}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          {typeof challenge.challenged === 'string' ? (
                            // Usuário foi desafiado - pode aceitar ou recusar
                            <>
                              <Button variant="outline" size="sm" className="border-red-500/30 text-red-500 hover:bg-red-500/10">
                                <XCircle className="w-4 h-4 mr-2" />
                                Recusar
                              </Button>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Aceitar
                              </Button>
                            </>
                          ) : (
                            // Usuário criou o desafio - pode cancelar
                            <Button variant="outline" size="sm" className="border-red-500/30 text-red-500 hover:bg-red-500/10">
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
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
              {acceptedChallenges.length > 0 ? (
                acceptedChallenges.map((challenge) => (
                  <Card key={challenge.id} className="bg-gradient-card border-green-500/30 hover:border-green-500/60 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={challenge.challenger.avatar} />
                            <AvatarFallback>{challenge.challenger.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{challenge.challenger.name}</CardTitle>
                            <Badge variant="secondary" className="text-xs">{challenge.challenger.rank}</Badge>
                          </div>
                          
                          <Swords className="w-6 h-6 text-primary mx-4" />
                          
                          <div className="text-foreground font-semibold">Você</div>
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
                            Formato: {getMatchTypeLabel(challenge.matchType)}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            Agendado para: {challenge.scheduledFor}
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="mr-2">Check-in:</span>
                            <Badge variant={challenge.checkedIn.challenger ? "default" : "secondary"} className="mr-2 text-xs">
                              {challenge.challenger.name}: {challenge.checkedIn.challenger ? "✓" : "○"}
                            </Badge>
                            <Badge variant={challenge.checkedIn.challenged ? "default" : "secondary"} className="text-xs">
                              Você: {challenge.checkedIn.challenged ? "✓" : "○"}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          {!challenge.checkedIn.challenged && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Check-in
                            </Button>
                          )}
                          {challenge.checkedIn.challenger && challenge.checkedIn.challenged && (
                            <Button size="sm" className="bg-primary hover:bg-primary/90">
                              <Trophy className="w-4 h-4 mr-2" />
                              Reportar Resultado
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
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
              {challengeHistory.length > 0 ? (
                challengeHistory.map((challenge) => (
                  <Card key={challenge.id} className="bg-gradient-card border-border/50 hover:border-secondary/30 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={challenge.challenger.avatar} />
                            <AvatarFallback>{challenge.challenger.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{challenge.challenger.name}</CardTitle>
                            <Badge variant="secondary" className="text-xs">{challenge.challenger.rank}</Badge>
                          </div>
                          
                          <Swords className="w-6 h-6 text-muted-foreground mx-4" />
                          
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={typeof challenge.challenged === 'object' ? challenge.challenged.avatar : "/placeholder.svg"} />
                            <AvatarFallback>
                              {typeof challenge.challenged === 'object' ? challenge.challenged.name.charAt(0) : 'W'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">
                              {typeof challenge.challenged === 'object' ? challenge.challenged.name : 'Wall'}
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs">
                              {typeof challenge.challenged === 'object' ? challenge.challenged.rank : 'Kage'}
                            </Badge>
                          </div>
                        </div>
                        
                        <Badge className={getStatusColor(challenge.status)}>
                          Concluído
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Trophy className="w-4 h-4 mr-2" />
                            Formato: {getMatchTypeLabel(challenge.matchType)}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            Concluído em: {challenge.completedAt}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold text-lg text-foreground">
                            Vencedor: <span className="text-ninja-kage">{challenge.result.winner}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Placar: {challenge.result.score}
                          </div>
                        </div>
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
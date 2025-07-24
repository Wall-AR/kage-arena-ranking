import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Trophy, Users, Calendar, Clock, Award, Plus, Eye } from "lucide-react";
import Navigation from "@/components/ui/navigation";
import { cn } from "@/lib/utils";

// Página de Torneios - Kage Arena
// Criado por Wall - Sistema completo de torneios com brackets e gerenciamento
const Tournaments = () => {
  const [activeTab, setActiveTab] = useState("active");

  // Mock data - futuramente virá do backend
  const activeTournaments = [
    {
      id: 1,
      name: "Copa Hokage 2025",
      description: "Torneio oficial mensal para determinar o melhor ninja",
      type: "single_elimination",
      maxParticipants: 32,
      currentParticipants: 28,
      registrationEnd: "2025-01-30",
      tournamentStart: "2025-02-01",
      status: "registration",
      prize: "Título de Hokage do Mês + 500 pontos",
      createdBy: "Wall"
    },
    {
      id: 2,
      name: "Batalha dos Clãs",
      description: "Competição especial entre os principais clãs ninja",
      type: "round_robin",
      maxParticipants: 16,
      currentParticipants: 16,
      registrationEnd: "2025-01-25",
      tournamentStart: "2025-01-26",
      status: "ongoing",
      prize: "300 pontos + Badge especial",
      createdBy: "ShadowMaster"
    }
  ];

  const upcomingTournaments = [
    {
      id: 3,
      name: "Exame Chunin",
      description: "Torneio especial para jogadores Genin e Chunin",
      type: "double_elimination",
      maxParticipants: 24,
      currentParticipants: 0,
      registrationStart: "2025-02-10",
      registrationEnd: "2025-02-20",
      tournamentStart: "2025-02-22",
      status: "upcoming",
      prize: "Promoção automática de rank",
      createdBy: "Wall"
    }
  ];

  const completedTournaments = [
    {
      id: 4,
      name: "Torneio de Ano Novo",
      description: "Celebração especial de início de ano",
      type: "single_elimination",
      participants: 32,
      winner: "ShadowNinja",
      completedAt: "2025-01-15",
      prize: "Título de Campeão + 1000 pontos"
    }
  ];

  const mockBracket = [
    {
      round: "Quartas de Final",
      matches: [
        { player1: "Wall", player2: "ShadowNinja", winner: "Wall", score: "3-1" },
        { player1: "FireStyle", player2: "IceKing", winner: "FireStyle", score: "3-0" },
        { player1: "LightningBolt", player2: "EarthShaker", winner: "LightningBolt", score: "3-2" },
        { player1: "WindMaster", player2: "WaterFlow", winner: "WindMaster", score: "3-1" }
      ]
    },
    {
      round: "Semifinais",
      matches: [
        { player1: "Wall", player2: "FireStyle", winner: null, score: null },
        { player1: "LightningBolt", player2: "WindMaster", winner: null, score: null }
      ]
    },
    {
      round: "Final",
      matches: [
        { player1: "TBD", player2: "TBD", winner: null, score: null }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      'registration': 'ninja-chunin',
      'ongoing': 'ninja-jounin',
      'upcoming': 'ninja-sannin',
      'completed': 'ninja-anbu'
    };
    return colors[status as keyof typeof colors] || 'ninja-genin';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'registration': 'Inscrições Abertas',
      'ongoing': 'Em Andamento',
      'upcoming': 'Em Breve',
      'completed': 'Finalizado'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getTournamentTypeText = (type: string) => {
    const types = {
      'single_elimination': 'Eliminação Simples',
      'double_elimination': 'Eliminação Dupla',
      'round_robin': 'Todos vs Todos'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-ninja text-4xl font-bold text-foreground mb-2">
              🏆 TORNEIOS
            </h1>
            <p className="text-muted-foreground">
              Competições oficiais e eventos especiais da arena
            </p>
          </div>
          
          <Button className="bg-ninja-kage hover:bg-ninja-kage/80">
            <Plus className="w-4 h-4 mr-2" />
            Criar Torneio
          </Button>
        </div>

        {/* Tabs dos Torneios */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="upcoming">Próximos</TabsTrigger>
            <TabsTrigger value="completed">Finalizados</TabsTrigger>
            <TabsTrigger value="brackets">Brackets</TabsTrigger>
          </TabsList>

          {/* Aba: Torneios Ativos */}
          <TabsContent value="active" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeTournaments.map((tournament) => (
                <Card key={tournament.id} className="bg-gradient-card border-border/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl font-ninja">{tournament.name}</CardTitle>
                        <CardDescription className="mt-2">
                          {tournament.description}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className={cn(
                        "font-semibold",
                        `bg-${getStatusColor(tournament.status)}/20 text-${getStatusColor(tournament.status)}`
                      )}>
                        {getStatusText(tournament.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Informações do Torneio */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-accent" />
                        <span>{getTournamentTypeText(tournament.type)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-accent" />
                        <span>{tournament.currentParticipants}/{tournament.maxParticipants}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-accent" />
                        <span>Início: {tournament.tournamentStart}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-accent" />
                        <span>Inscrições até: {tournament.registrationEnd}</span>
                      </div>
                    </div>

                    {/* Progresso de Inscrições */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Participantes</span>
                        <span>{tournament.currentParticipants}/{tournament.maxParticipants}</span>
                      </div>
                      <Progress 
                        value={(tournament.currentParticipants / tournament.maxParticipants) * 100} 
                        className="h-2"
                      />
                    </div>

                    {/* Prêmio */}
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Award className="w-4 h-4 text-accent" />
                        <span className="font-semibold text-sm">Prêmio</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{tournament.prize}</p>
                    </div>

                    {/* Botões */}
                    <div className="flex space-x-2">
                      {tournament.status === 'registration' ? (
                        <Button className="flex-1">
                          <Users className="w-4 h-4 mr-2" />
                          Inscrever-se
                        </Button>
                      ) : (
                        <Button variant="outline" className="flex-1">
                          <Eye className="w-4 h-4 mr-2" />
                          Acompanhar
                        </Button>
                      )}
                      <Button variant="outline">
                        <Trophy className="w-4 h-4 mr-2" />
                        Bracket
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Aba: Próximos Torneios */}
          <TabsContent value="upcoming" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingTournaments.map((tournament) => (
                <Card key={tournament.id} className="bg-gradient-card border-border/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl font-ninja">{tournament.name}</CardTitle>
                        <CardDescription className="mt-2">
                          {tournament.description}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className={cn(
                        "font-semibold",
                        `bg-${getStatusColor(tournament.status)}/20 text-${getStatusColor(tournament.status)}`
                      )}>
                        {getStatusText(tournament.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-accent" />
                        <span>{getTournamentTypeText(tournament.type)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-accent" />
                        <span>Máx: {tournament.maxParticipants}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-accent" />
                        <span>Início: {tournament.tournamentStart}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-accent" />
                        <span>Inscrições: {tournament.registrationStart}</span>
                      </div>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Award className="w-4 h-4 text-accent" />
                        <span className="font-semibold text-sm">Prêmio</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{tournament.prize}</p>
                    </div>

                    <Button variant="outline" className="w-full" disabled>
                      <Clock className="w-4 h-4 mr-2" />
                      Inscrições em breve
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Aba: Torneios Finalizados */}
          <TabsContent value="completed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedTournaments.map((tournament) => (
                <Card key={tournament.id} className="bg-gradient-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xl font-ninja">{tournament.name}</CardTitle>
                    <CardDescription>{tournament.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-accent" />
                        <span>{getTournamentTypeText(tournament.type)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-accent" />
                        <span>{tournament.participants} participantes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-accent" />
                        <span>Finalizado: {tournament.completedAt}</span>
                      </div>
                    </div>

                    {/* Campeão */}
                    <div className="bg-gradient-to-r from-ninja-kage/20 to-accent/20 rounded-lg p-4 border border-ninja-kage/30">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12 ring-2 ring-ninja-kage">
                          <AvatarFallback className="bg-ninja-kage/20 text-ninja-kage font-bold">
                            {tournament.winner.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-bold text-ninja-kage">🏆 CAMPEÃO</div>
                          <div className="font-ninja text-lg">{tournament.winner}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Award className="w-4 h-4 text-accent" />
                        <span className="font-semibold text-sm">Prêmio</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{tournament.prize}</p>
                    </div>

                    <Button variant="outline" className="w-full">
                      <Trophy className="w-4 h-4 mr-2" />
                      Ver Bracket Completo
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Aba: Brackets */}
          <TabsContent value="brackets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-ninja">Copa Hokage 2025 - Bracket</CardTitle>
                <CardDescription>Acompanhe o progresso do torneio em tempo real</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {mockBracket.map((round, roundIndex) => (
                    <div key={roundIndex}>
                      <h3 className="font-ninja text-lg font-bold mb-4 text-center">
                        {round.round}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {round.matches.map((match, matchIndex) => (
                          <Card key={matchIndex} className="border-border/50">
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <div className={cn(
                                  "flex items-center justify-between p-2 rounded",
                                  match.winner === match.player1 ? "bg-ninja-chunin/20" : "bg-muted/30"
                                )}>
                                  <span className="font-medium">{match.player1}</span>
                                  {match.winner === match.player1 && <Trophy className="w-4 h-4 text-ninja-chunin" />}
                                </div>
                                <div className="text-center text-xs text-muted-foreground">
                                  {match.score ? `VS - ${match.score}` : "VS"}
                                </div>
                                <div className={cn(
                                  "flex items-center justify-between p-2 rounded",
                                  match.winner === match.player2 ? "bg-ninja-chunin/20" : "bg-muted/30"
                                )}>
                                  <span className="font-medium">{match.player2}</span>
                                  {match.winner === match.player2 && <Trophy className="w-4 h-4 text-ninja-chunin" />}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Tournaments;
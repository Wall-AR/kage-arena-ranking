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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Página de Torneios - Kage Arena
// Criado por Wall - Sistema completo de torneios com brackets e gerenciamento
const Tournaments = () => {
  const [activeTab, setActiveTab] = useState("active");

  // Buscar dados reais dos torneios
  const { data: allTournaments = [] } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          *,
          creator:players!tournaments_created_by_fkey(name),
          winner:players!tournaments_winner_id_fkey(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Filtrar torneios por status
  const activeTournaments = allTournaments.filter(t => 
    t.status === 'registration' || t.status === 'ongoing'
  );
  
  const upcomingTournaments = allTournaments.filter(t => 
    t.status === 'upcoming'
  );
  
  const completedTournaments = allTournaments.filter(t => 
    t.status === 'completed'
  );

  const mockBracket = []; // Removido dados mockados de bracket

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
                        <span>{getTournamentTypeText(tournament.tournament_type)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-accent" />
                        <span>0/{tournament.max_participants}</span>
                      </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-accent" />
                              <span>Início: {format(new Date(tournament.tournament_start), "dd/MM/yyyy", { locale: ptBR })}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-accent" />
                              <span>Inscrições até: {format(new Date(tournament.registration_end), "dd/MM/yyyy", { locale: ptBR })}</span>
                            </div>
                    </div>

                    {/* Progresso de Inscrições */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Participantes</span>
                        <span>0/{tournament.max_participants}</span>
                      </div>
                      <Progress 
                        value={0} 
                        className="h-2"
                      />
                    </div>

                    {/* Prêmio */}
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Award className="w-4 h-4 text-accent" />
                        <span className="font-semibold text-sm">Prêmio</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{tournament.prize_description || "A ser definido"}</p>
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
                        <span>{getTournamentTypeText(tournament.tournament_type)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-accent" />
                        <span>Máx: {tournament.max_participants}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-accent" />
                        <span>Início: {format(new Date(tournament.tournament_start), "dd/MM/yyyy", { locale: ptBR })}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-accent" />
                        <span>Inscrições: {format(new Date(tournament.registration_start), "dd/MM/yyyy", { locale: ptBR })}</span>
                      </div>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Award className="w-4 h-4 text-accent" />
                        <span className="font-semibold text-sm">Prêmio</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{tournament.prize_description || "A ser definido"}</p>
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
                        <span>{getTournamentTypeText(tournament.tournament_type)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-accent" />
                        <span>{tournament.max_participants} participantes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-accent" />
                        <span>Finalizado: {format(new Date(tournament.updated_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                      </div>
                    </div>

                    {/* Campeão */}
                    <div className="bg-gradient-to-r from-ninja-kage/20 to-accent/20 rounded-lg p-4 border border-ninja-kage/30">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12 ring-2 ring-ninja-kage">
                          <AvatarFallback className="bg-ninja-kage/20 text-ninja-kage font-bold">
                            {tournament.winner?.name ? tournament.winner.name.charAt(0) : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-bold text-ninja-kage">🏆 CAMPEÃO</div>
                          <div className="font-ninja text-lg">{tournament.winner?.name || "A ser definido"}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Award className="w-4 h-4 text-accent" />
                        <span className="font-semibold text-sm">Prêmio</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{tournament.prize_description || "A ser definido"}</p>
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
                <CardTitle className="font-ninja">Brackets em Desenvolvimento</CardTitle>
                <CardDescription>Sistema de brackets será implementado em breve</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Em Breve</h3>
                  <p className="text-muted-foreground">
                    O sistema de visualização de brackets será implementado quando tivermos torneios ativos.
                  </p>
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
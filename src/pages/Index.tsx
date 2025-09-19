import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/ui/navigation";
import RankingCard from "@/components/ui/ranking-card";
import heroImage from "@/assets/hero-naruto-sasuke.jpg";
import { Trophy, Swords, Users, Target, TrendingUp, Flame, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTopPlayers } from "@/hooks/usePlayers";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Homepage do Kage Arena - Portal de Ranking Naruto Ultimate Ninja 5
// Criado por Wall - Página principal com hero section e overview do ranking
const Index = () => {
  const { user, loading } = useAuth();
  
  // Buscar top 3 players
  const { data: topKages = [] } = useTopPlayers(3);

  // Buscar dados reais para estatísticas
  const { data: allPlayers = [] } = useQuery({
    queryKey: ['all-players-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('id, wins, losses, last_match_date, is_ranked')
        .eq('is_ranked', true);
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: tournaments = [] } = useQuery({
    queryKey: ['active-tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('id, status')
        .in('status', ['registration', 'ongoing']);
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: recentMatches = [] } = useQuery({
    queryKey: ['recent-matches'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('matches')
        .select('id, played_at')
        .gte('played_at', today);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calcular estatísticas reais
  const totalWins = allPlayers.reduce((acc, p) => acc + (p.wins || 0), 0);
  const totalLosses = allPlayers.reduce((acc, p) => acc + (p.losses || 0), 0);
  const avgWinRate = totalWins + totalLosses > 0 ? Math.round((totalWins / (totalWins + totalLosses)) * 100) : 0;
  
  const stats = [
    { icon: Users, label: "Ninjas Ativos", value: allPlayers.length.toString(), color: "text-ninja-jounin" },
    { icon: Swords, label: "Batalhas Hoje", value: recentMatches.length.toString(), color: "text-primary" },
    { icon: Trophy, label: "Torneios Ativos", value: tournaments.length.toString(), color: "text-ninja-kage" },
    { icon: Target, label: "Taxa Média", value: `${avgWinRate}%`, color: "text-ninja-chunin" }
  ];

  // Updates baseados em dados reais (simplificado)
  const recentUpdates = [
    {
      title: "Sistema de Ranking Ativo",
      description: `${allPlayers.length} ninjas rankeados competindo na arena`,
      date: new Date().toLocaleDateString('pt-BR'),
      type: "ranking"
    },
    {
      title: "Torneios Disponíveis",
      description: `${tournaments.length} torneios ativos para participação`,
      date: new Date(Date.now() - 86400000).toLocaleDateString('pt-BR'),
      type: "tournament"
    },
    {
      title: "Batalhas Recentes",
      description: `${recentMatches.length} partidas disputadas hoje`,
      date: new Date(Date.now() - 172800000).toLocaleDateString('pt-BR'),
      type: "feature"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="home" />
      
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background com imagem hero */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-background/80" />
        </div>
        
        {/* Conteúdo do Hero */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="space-y-6">
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 px-4 py-2">
              🥷 Portal Oficial de Ranking
            </Badge>
            
            <h1 className="font-ninja text-6xl md:text-8xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              KAGE ARENA
            </h1>
            
            <h2 className="font-ninja text-2xl md:text-3xl font-semibold text-foreground">
              TORNE-SE UM VERDADEIRO KAGE
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Entre na arena mais competitiva de <strong>Naruto Shippuden: Ultimate Ninja 5</strong>. 
              Desafie os melhores ninjas, suba no ranking e conquiste o título supremo de Hokage.
            </p>
            
            {/* Status de Conectividade */}
            {!loading && (
              <div className="mt-4">
                {user ? (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                    🟢 Conectado como {user.user_metadata?.name || user.email}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    🔑 <Link to="/auth" className="underline">Faça login para acessar</Link>
                  </Badge>
                )}
              </div>
            )}
            
            {/* Botões de Ação */}
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center pt-6">
              {user ? (
                <>
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90 shadow-ninja px-8 py-4 text-lg">
                    <Link to="/ranking">
                      <Swords className="w-6 h-6 mr-2" />
                      ENTRAR NA ARENA
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" size="lg" className="border-accent text-accent hover:bg-accent/10 px-8 py-4 text-lg">
                    <Link to="/profile">
                      <User className="w-6 h-6 mr-2" />
                      MEU PERFIL
                    </Link>
                  </Button>
                </>
              ) : (
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 shadow-ninja px-8 py-4 text-lg">
                  <Link to="/auth">
                    <Target className="w-6 h-6 mr-2" />
                    FAZER LOGIN
                  </Link>
                </Button>
              )}
              
              <Button asChild variant="outline" size="lg" className="border-accent text-accent hover:bg-accent/10 px-8 py-4 text-lg">
                <Link to="/challenges">
                  <Target className="w-6 h-6 mr-2" />
                  CRIAR DESAFIO
                </Link>
              </Button>
              
              <Button variant="secondary" size="lg" className="px-8 py-4 text-lg">
                <Trophy className="w-6 h-6 mr-2" />
                TORNEIOS
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="bg-gradient-card border-border/50 hover:border-primary/30 transition-all duration-300">
                  <CardContent className="pt-6 text-center">
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                    <div className="font-ninja text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Top 3 Kages */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-ninja text-4xl font-bold text-foreground mb-4">
              BEM-VINDO AO KAGE ARENA
            </h2>
            <p className="text-xl text-muted-foreground">
              Conheça os 3 ninjas mais poderosos do ranking atual
            </p>
          </div>
          
          <div className="space-y-6 max-w-6xl mx-auto">
            {topKages.map((player) => (
              <RankingCard key={player.id} player={player} />
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg" className="border-primary/30 hover:border-primary">
              <Link to="/ranking">
                <TrendingUp className="w-5 h-5 mr-2" />
                Ver Ranking Completo
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Últimas Atualizações */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-ninja text-4xl font-bold text-foreground mb-4">
              ÚLTIMAS ATUALIZAÇÕES
            </h2>
            <p className="text-xl text-muted-foreground">
              Fique por dentro das novidades do portal
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {recentUpdates.map((update, index) => (
              <Card key={index} className="bg-gradient-card border-border/50 hover:shadow-card transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">{update.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {update.type}
                    </Badge>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    {update.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{update.date}</span>
                    <Flame className="w-4 h-4 text-primary" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2025 Kage Arena - Criado por <span className="text-primary font-semibold">Wall</span>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Portal não oficial para competições de Naruto Shippuden: Ultimate Ninja 5
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

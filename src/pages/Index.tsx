import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/ui/navigation";
import RankingCard from "@/components/ui/ranking-card";
import heroImage from "@/assets/hero-naruto-sasuke.jpg";
import { Trophy, Swords, Users, Target, TrendingUp, Flame } from "lucide-react";
import { Link } from "react-router-dom";

// Homepage do Kage Arena - Portal de Ranking Naruto Ultimate Ninja 5
// Criado por Wall - Página principal com hero section e overview do ranking
const Index = () => {
  // Dados mockados dos top 3 Kages - futuramente virá da API
  const topKages = [
    {
      id: 1,
      name: "Wall",
      rank: "Kage",
      position: 1,
      points: 2450,
      wins: 45,
      losses: 8,
      winRate: 84.9,
      lastMatch: "14/01/2025",
      favoriteCharacters: ["Naruto", "Sasuke", "Kakashi"],
      achievements: ["champion", "undefeated", "veteran"],
      isImmune: true,
      avatar: "/placeholder.svg"
    },
    {
      id: 2,
      name: "ShadowNinja",
      rank: "Kage",
      position: 2,
      points: 2200,
      wins: 38,
      losses: 12,
      winRate: 76.0,
      lastMatch: "13/01/2025",
      favoriteCharacters: ["Itachi", "Sasuke", "Orochimaru"],
      achievements: ["streak", "veteran"],
      avatar: "/placeholder.svg"
    },
    {
      id: 3,
      name: "FireLord",
      rank: "Kage", 
      position: 3,
      points: 2150,
      wins: 42,
      losses: 18,
      winRate: 70.0,
      lastMatch: "12/01/2025",
      favoriteCharacters: ["Jiraiya", "Naruto", "Gaara"],
      achievements: ["champion"],
      avatar: "/placeholder.svg"
    }
  ];

  // Estatísticas gerais mockadas
  const stats = [
    { icon: Users, label: "Ninjas Ativos", value: "847", color: "text-ninja-jounin" },
    { icon: Swords, label: "Batalhas Hoje", value: "23", color: "text-primary" },
    { icon: Trophy, label: "Torneios Ativos", value: "5", color: "text-ninja-kage" },
    { icon: Target, label: "Taxa Média", value: "68%", color: "text-ninja-chunin" }
  ];

  // Updates recentes mockados
  const recentUpdates = [
    {
      title: "Novo Sistema de Imunidade",
      description: "Implementado sistema de proteção para os top players",
      date: "14/01/2025",
      type: "feature"
    },
    {
      title: "Torneio Sannin iniciado",
      description: "16 jogadores competem pelo título de Sannin Supremo",
      date: "13/01/2025", 
      type: "tournament"
    },
    {
      title: "Ranking atualizado",
      description: "Novas posições após as batalhas de ontem",
      date: "12/01/2025",
      type: "ranking"
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
            
            {/* Botões de Ação */}
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center pt-6">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 shadow-ninja px-8 py-4 text-lg">
                <Link to="/ranking">
                  <Swords className="w-6 h-6 mr-2" />
                  ENTRAR NA ARENA
                </Link>
              </Button>
              
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

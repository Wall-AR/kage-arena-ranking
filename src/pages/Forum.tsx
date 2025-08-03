import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Plus, Search, Pin, Heart, Reply, Eye, TrendingUp, Users } from "lucide-react";
import Navigation from "@/components/ui/navigation";
import { cn } from "@/lib/utils";

// Página do Fórum - Kage Arena
// Criado por Wall - Sistema completo de fórum com categorias e discussões
const Forum = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - futuramente virá do backend
  const categories = [
    { id: "general", name: "Discussões Gerais", icon: "💬", color: "ninja-chunin" },
    { id: "strategies", name: "Estratégias e Dicas", icon: "🧠", color: "ninja-jounin" },
    { id: "matches", name: "Análises de Partidas", icon: "⚔️", color: "ninja-anbu" },
    { id: "suggestions", name: "Sugestões", icon: "💡", color: "ninja-sannin" },
    { id: "rules", name: "Regras e Anúncios", icon: "📋", color: "ninja-kage" }
  ];

  const forumStats = {
    totalTopics: 156,
    totalPosts: 1247,
    activeUsers: 42,
    onlineNow: 18
  };

  const pinnedTopics = [
    {
      id: 1,
      title: "🏆 Regras Oficiais do Kage Arena - LEIA ANTES DE POSTAR",
      author: "Wall",
      authorRank: "Kage",
      category: "rules",
      isPinned: true,
      isHot: false,
      replies: 23,
      views: 1250,
      lastReply: "2024-01-20",
      lastReplyBy: "ShadowMaster"
    },
    {
      id: 2,
      title: "📅 Calendário de Torneios 2025 - Datas Confirmadas",
      author: "Wall",
      authorRank: "Kage",
      category: "general",
      isPinned: true,
      isHot: false,
      replies: 45,
      views: 890,
      lastReply: "2024-01-19",
      lastReplyBy: "FireNinja"
    }
  ];

  const recentTopics = [
    {
      id: 3,
      title: "Como melhorar o timing de Kawarime contra ataques rápidos?",
      author: "NinjaNewbie",
      authorRank: "Genin",
      category: "strategies",
      replies: 12,
      views: 234,
      lastReply: "2024-01-21",
      lastReplyBy: "TechMaster",
      isHot: true,
      isPinned: false
    },
    {
      id: 4,
      title: "Análise: Últimas partidas do ranking",
      author: "AnalystPro",
      authorRank: "Jounin",
      category: "matches",
      replies: 28,
      views: 567,
      lastReply: "2024-01-21",
      lastReplyBy: "ComboKing",
      isHot: false,
      isPinned: false
    },
    {
      id: 5,
      title: "Sugestão: Sistema de replay para partidas rankeadas",
      author: "DevSuggester",
      authorRank: "Chunin",
      category: "suggestions",
      replies: 15,
      views: 189,
      lastReply: "2024-01-20",
      lastReplyBy: "Wall",
      isHot: false,
      isPinned: false
    },
    {
      id: 6,
      title: "Tutorial: Dominando o dash-cancel com Naruto",
      author: "ComboMaster",
      authorRank: "Sannin",
      category: "strategies",
      replies: 31,
      views: 445,
      lastReply: "2024-01-20",
      lastReplyBy: "SpeedRunner",
      isHot: false,
      isPinned: false
    },
    {
      id: 7,
      title: "Discussão: Quais personagens precisam de ajustes de balance?",
      author: "BalanceGuru",
      authorRank: "Anbu",
      category: "general",
      replies: 67,
      views: 892,
      lastReply: "2024-01-19",
      lastReplyBy: "MetaAnalyst",
      isHot: true,
      isPinned: false
    }
  ];

  const getRankColor = (rank: string) => {
    const colors = {
      'Kage': 'ninja-kage',
      'Sannin': 'ninja-sannin',
      'Anbu': 'ninja-anbu',
      'Jounin': 'ninja-jounin',
      'Chunin': 'ninja-chunin',
      'Genin': 'ninja-genin'
    };
    return colors[rank as keyof typeof colors] || 'ninja-genin';
  };

  const getCategoryTopics = (categoryId: string) => {
    if (categoryId === "general") {
      return [...pinnedTopics, ...recentTopics.filter(t => t.category === "general" || categoryId === "general")];
    }
    return recentTopics.filter(t => t.category === categoryId);
  };

  const filteredTopics = getCategoryTopics(activeTab).filter(topic =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-ninja text-4xl font-bold text-foreground mb-2">
              💬 FÓRUM
            </h1>
            <p className="text-muted-foreground">
              Centro de discussões da comunidade ninja
            </p>
          </div>
          
          <Button className="bg-ninja-kage hover:bg-ninja-kage/80">
            <Plus className="w-4 h-4 mr-2" />
            Novo Tópico
          </Button>
        </div>

        {/* Estatísticas do Fórum */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-ninja-chunin">{forumStats.totalTopics}</div>
              <div className="text-sm text-muted-foreground">Tópicos</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-ninja-jounin">{forumStats.totalPosts}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-ninja-anbu">{forumStats.activeUsers}</div>
              <div className="text-sm text-muted-foreground">Usuários Ativos</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-ninja-sannin">{forumStats.onlineNow}</div>
              <div className="text-sm text-muted-foreground">Online Agora</div>
            </CardContent>
          </Card>
        </div>

        {/* Busca */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar tópicos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categorias */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-2">
                <span>{category.icon}</span>
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Lista de Tópicos */}
          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-4">
              <div className="space-y-3">
                {filteredTopics.length === 0 ? (
                  <Card className="bg-gradient-card border-border/50">
                    <CardContent className="p-8 text-center">
                      <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nenhum tópico encontrado</h3>
                      <p className="text-muted-foreground">
                        {searchTerm ? "Tente uma busca diferente" : "Seja o primeiro a criar um tópico nesta categoria!"}
                      </p>
                      <Button className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeiro Tópico
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  filteredTopics.map((topic) => (
                    <Card key={topic.id} className="bg-gradient-card border-border/50 hover:border-border transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          {/* Avatar do Autor */}
                          <Avatar className={cn(
                            "w-12 h-12 ring-2",
                            `ring-${getRankColor(topic.authorRank)}/30`
                          )}>
                            <AvatarFallback className={cn(
                              "font-bold",
                              `bg-${getRankColor(topic.authorRank)}/20 text-${getRankColor(topic.authorRank)}`
                            )}>
                              {topic.author.charAt(0)}
                            </AvatarFallback>
                          </Avatar>

                          {/* Conteúdo do Tópico */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  {topic.isPinned && (
                                    <Pin className="w-4 h-4 text-ninja-kage" />
                                  )}
                                  {topic.isHot && (
                                    <TrendingUp className="w-4 h-4 text-accent" />
                                  )}
                                  <h3 className="font-semibold text-foreground hover:text-primary cursor-pointer">
                                    {topic.title}
                                  </h3>
                                </div>

                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <div className="flex items-center space-x-1">
                                    <span>por</span>
                                    <span className={cn(
                                      "font-medium",
                                      `text-${getRankColor(topic.authorRank)}`
                                    )}>
                                      {topic.author}
                                    </span>
                                    <Badge variant="outline" className={cn(
                                      "text-xs",
                                      `border-${getRankColor(topic.authorRank)}/30 text-${getRankColor(topic.authorRank)}`
                                    )}>
                                      {topic.authorRank}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              {/* Estatísticas */}
                              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Reply className="w-4 h-4" />
                                  <span>{topic.replies}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Eye className="w-4 h-4" />
                                  <span>{topic.views}</span>
                                </div>
                              </div>
                            </div>

                            <Separator className="my-3" />

                            {/* Última Resposta */}
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <div className="flex items-center space-x-2">
                                <span>Última resposta por</span>
                                <span className="font-medium text-foreground">{topic.lastReplyBy}</span>
                              </div>
                              <span>{topic.lastReply}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Usuários Online */}
        <Card className="mt-8 bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Usuários Online ({forumStats.onlineNow})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["Wall", "Jogador1", "Jogador2", "Jogador3", "Jogador4", "Jogador5"].map((user, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-ninja-chunin rounded-full"></div>
                  <span>{user}</span>
                </Badge>
              ))}
              <Badge variant="outline">
                +{forumStats.onlineNow - 6} mais
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Forum;
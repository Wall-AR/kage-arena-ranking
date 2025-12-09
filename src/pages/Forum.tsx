import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/ui/navigation";
import ForumHeader from "@/components/forum/ForumHeader";
import ForumStats from "@/components/forum/ForumStats";
import ForumCategories from "@/components/forum/ForumCategories";
import ForumTopicCard from "@/components/forum/ForumTopicCard";
import ForumOnlineUsers from "@/components/forum/ForumOnlineUsers";
import ForumLeaderboard from "@/components/forum/ForumLeaderboard";
import ForumSearch from "@/components/forum/ForumSearch";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus, Sparkles } from "lucide-react";

const Forum = () => {
  const [activeCategory, setActiveCategory] = useState("general");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch players data
  const { data: playersData = [] } = useQuery({
    queryKey: ['forum-players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('id, name, rank, is_admin, is_moderator, avatar_url, updated_at')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Categories with mock topic counts
  const categories = [
    { id: "general", name: "Geral", icon: "💬", description: "Discussões gerais", topicCount: 42 },
    { id: "strategies", name: "Estratégias", icon: "🧠", description: "Táticas e dicas", topicCount: 28 },
    { id: "matches", name: "Partidas", icon: "⚔️", description: "Análises de combates", topicCount: 35 },
    { id: "suggestions", name: "Sugestões", icon: "💡", description: "Ideias e melhorias", topicCount: 15 },
    { id: "rules", name: "Regras", icon: "📋", description: "Normas oficiais", topicCount: 8 }
  ];

  // Forum stats
  const forumStats = {
    totalTopics: categories.reduce((acc, cat) => acc + cat.topicCount, 0),
    totalPosts: 342,
    activeUsers: playersData.length,
    onlineNow: Math.max(Math.floor(playersData.length * 0.3), 3)
  };

  // Mock pinned topics
  const pinnedTopics = [
    {
      id: 1,
      title: "📜 Regras Oficiais do Kage Arena - LEITURA OBRIGATÓRIA",
      author: "Wall",
      authorRank: "Kage",
      category: "rules",
      isPinned: true,
      isHot: false,
      replies: 24,
      views: 1250,
      lastReply: "Hoje",
      lastReplyBy: "Admin",
      xpReward: 50
    },
    {
      id: 2,
      title: "🎮 Guia Completo: Como Subir de Ranking Rapidamente",
      author: "Wall",
      authorRank: "Kage",
      category: "general",
      isPinned: true,
      isHot: true,
      replies: 89,
      views: 2340,
      lastReply: "Ontem",
      lastReplyBy: "ProPlayer",
      xpReward: 100
    }
  ];

  // Generate topics based on real players
  const recentTopics = playersData.slice(0, 8).map((player, index) => ({
    id: index + 10,
    title: index === 0 ? `🏆 Análise: Como ${player.name} dominou o ranking` :
           index === 1 ? `⚡ Técnicas avançadas reveladas por ${player.name}` :
           index === 2 ? `🎯 Discussão: Melhores estratégias para ${player.rank || 'Genin'}` :
           index === 3 ? `💪 Tutorial: Combos essenciais para iniciantes` :
           index === 4 ? `🔥 META atual: O que está funcionando?` :
           index === 5 ? `🤔 Qual personagem escolher em 2024?` :
           index === 6 ? `📊 Análise de partida: ${player.name} vs Challenger` :
           `🎮 Dicas de ${player.name} para novatos`,
    author: player.name,
    authorRank: player.rank || 'Genin',
    authorAvatar: player.avatar_url,
    category: ['general', 'strategies', 'matches', 'suggestions'][index % 4],
    isPinned: false,
    isHot: index < 2,
    isNew: index === 0,
    replies: Math.floor(Math.random() * 50) + 5,
    views: Math.floor(Math.random() * 500) + 50,
    lastReply: index === 0 ? "Agora" : index === 1 ? "5 min" : `${index}h atrás`,
    lastReplyBy: playersData[index + 1]?.name || "Anônimo",
    xpReward: index < 3 ? 25 : undefined
  }));

  // Filter topics
  const allTopics = [...pinnedTopics, ...recentTopics];
  const categoryTopics = activeCategory === "general" 
    ? allTopics 
    : allTopics.filter(t => t.category === activeCategory);
  
  const filteredTopics = categoryTopics.filter(topic =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Online users for sidebar
  const onlineUsers = playersData.slice(0, 10).map(p => ({
    id: p.id,
    name: p.name,
    rank: p.rank || 'Genin',
    avatar: p.avatar_url || undefined,
    isAdmin: p.is_admin || false,
    isModerator: p.is_moderator || false
  }));

  // Top contributors
  const topContributors = playersData.slice(0, 5).map((p, i) => ({
    id: p.id,
    name: p.name,
    rank: p.rank || 'Genin',
    avatar: p.avatar_url || undefined,
    posts: Math.floor(Math.random() * 100) + 20 - (i * 10),
    reputation: Math.floor(Math.random() * 500) + 100 - (i * 50)
  }));

  const handleNewTopic = () => {
    // TODO: Open new topic dialog
    console.log("New topic clicked");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <ForumHeader onNewTopic={handleNewTopic} />

        {/* Stats */}
        <ForumStats 
          totalTopics={forumStats.totalTopics}
          totalPosts={forumStats.totalPosts}
          activeUsers={forumStats.activeUsers}
          onlineNow={forumStats.onlineNow}
        />

        {/* Categories */}
        <ForumCategories 
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Topics list - 2/3 width on desktop */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search */}
            <ForumSearch 
              value={searchTerm}
              onChange={setSearchTerm}
              resultsCount={searchTerm ? filteredTopics.length : undefined}
            />

            {/* Topics */}
            {filteredTopics.length === 0 ? (
              <Card className="bg-gradient-card border-border/30">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Nenhum tópico encontrado
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {searchTerm 
                      ? "Tente uma busca diferente ou crie um novo tópico"
                      : "Seja o primeiro a iniciar uma discussão!"}
                  </p>
                  <Button onClick={handleNewTopic} className="bg-gradient-to-r from-primary to-accent">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Tópico
                    <Sparkles className="w-4 h-4 ml-2 opacity-70" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredTopics.map((topic) => (
                  <ForumTopicCard 
                    key={topic.id} 
                    topic={topic}
                    onClick={() => console.log("Topic clicked:", topic.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - 1/3 width on desktop */}
          <div className="space-y-6">
            {/* Online users */}
            <ForumOnlineUsers 
              users={onlineUsers}
              totalOnline={forumStats.onlineNow}
            />

            {/* Leaderboard */}
            <ForumLeaderboard contributors={topContributors} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forum;

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/ui/navigation";
import ForumHeader from "@/components/forum/ForumHeader";
import ForumStats from "@/components/forum/ForumStats";
import ForumCategories from "@/components/forum/ForumCategories";
import ForumTopicCard from "@/components/forum/ForumTopicCard";
import ForumOnlineUsers from "@/components/forum/ForumOnlineUsers";
import ForumLeaderboard from "@/components/forum/ForumLeaderboard";
import ForumSearch from "@/components/forum/ForumSearch";
import CreateTopicDialog from "@/components/forum/CreateTopicDialog";
import TopicDetailDialog from "@/components/forum/TopicDetailDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus, Sparkles, LogIn } from "lucide-react";
import { useForum, ForumTopic } from "@/hooks/useForum";
import { useAuth } from "@/hooks/useAuth";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { Link } from "react-router-dom";

const Forum = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);

  const { user } = useAuth();
  const { data: profile } = usePlayerProfile(user?.id);
  const {
    categories,
    categoriesLoading,
    fetchTopics,
    fetchReplies,
    forumStats,
    createTopic,
    deleteTopic,
    togglePinTopic,
    toggleLockTopic,
    createReply,
    deleteReply,
    incrementViewCount
  } = useForum();

  // Fetch topics based on active category
  const { data: topics = [], isLoading: topicsLoading } = useQuery({
    queryKey: ['forum-topics', activeCategory],
    queryFn: () => fetchTopics(activeCategory),
    enabled: !categoriesLoading
  });

  // Get online users from players
  const { data: playersData = [] } = useQuery({
    queryKey: ['forum-players'],
    queryFn: async () => {
      const { data, error } = await (await import("@/integrations/supabase/client")).supabase
        .from('players')
        .select('id, name, rank, is_admin, is_moderator, avatar_url, updated_at')
        .order('updated_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Transform categories for the component
  const categoryItems = [
    { id: "all", name: "Todos", icon: "all", description: "Todos os tópicos", topicCount: topics.length },
    ...categories.map(cat => ({
      id: cat.slug,
      name: cat.name,
      icon: cat.icon,
      description: cat.description || "",
      topicCount: cat.topic_count || 0
    }))
  ];

  // Filter topics by search
  const filteredTopics = topics.filter(topic =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.author?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Transform topics for the card component
  const topicCards = filteredTopics.map(topic => ({
    id: topic.id,
    title: topic.title,
    author: topic.author?.name || "Anônimo",
    authorRank: topic.author?.rank || "Genin",
    authorAvatar: topic.author?.avatar_url || undefined,
    category: topic.category?.slug || "geral",
    isPinned: topic.is_pinned,
    isHot: topic.replies_count > 10 || topic.views_count > 100,
    isNew: new Date(topic.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000),
    replies: topic.replies_count,
    views: topic.views_count,
    lastReply: topic.last_reply_at 
      ? new Date(topic.last_reply_at).toLocaleDateString('pt-BR')
      : "Sem respostas",
    lastReplyBy: topic.last_replier?.name || topic.author?.name || "---"
  }));

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
    if (!user) return;
    setCreateDialogOpen(true);
  };

  const handleCreateTopic = (data: { categoryId: string; title: string; content: string }) => {
    if (!profile?.id) return;
    createTopic.mutate(
      { ...data, playerId: profile.id },
      { onSuccess: () => setCreateDialogOpen(false) }
    );
  };

  const handleTopicClick = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (topic) {
      setSelectedTopic(topic);
      incrementViewCount(topicId);
    }
  };

  const handleReply = (content: string) => {
    if (!profile?.id || !selectedTopic) return;
    createReply.mutate({
      topicId: selectedTopic.id,
      content,
      playerId: profile.id
    });
  };

  const handleDeleteTopic = () => {
    if (!selectedTopic) return;
    deleteTopic.mutate(selectedTopic.id, {
      onSuccess: () => setSelectedTopic(null)
    });
  };

  const handleDeleteReply = (replyId: string) => {
    if (!selectedTopic) return;
    deleteReply.mutate({ replyId, topicId: selectedTopic.id });
  };

  const handleTogglePin = () => {
    if (!selectedTopic) return;
    togglePinTopic.mutate({ topicId: selectedTopic.id, isPinned: !selectedTopic.is_pinned });
    setSelectedTopic({ ...selectedTopic, is_pinned: !selectedTopic.is_pinned });
  };

  const handleToggleLock = () => {
    if (!selectedTopic) return;
    toggleLockTopic.mutate({ topicId: selectedTopic.id, isLocked: !selectedTopic.is_locked });
    setSelectedTopic({ ...selectedTopic, is_locked: !selectedTopic.is_locked });
  };

  const isModerator = profile?.is_moderator || profile?.is_admin || false;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <ForumHeader onNewTopic={handleNewTopic} />

        {/* Stats */}
        <ForumStats 
          totalTopics={forumStats?.totalTopics || 0}
          totalPosts={forumStats?.totalPosts || 0}
          activeUsers={forumStats?.activeUsers || 0}
          onlineNow={forumStats?.onlineNow || 0}
        />

        {/* Categories */}
        <ForumCategories 
          categories={categoryItems}
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

            {/* Login prompt */}
            {!user && (
              <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <LogIn className="w-5 h-5 text-primary" />
                    <span className="text-sm">Faça login para criar tópicos e participar das discussões</span>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/auth">Entrar</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Topics */}
            {topicsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="bg-gradient-card border-border/30 animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-muted/50" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted/50 rounded w-3/4" />
                          <div className="h-3 bg-muted/50 rounded w-1/2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredTopics.length === 0 ? (
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
                  {user && (
                    <Button onClick={handleNewTopic} className="bg-gradient-to-r from-primary to-accent">
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Tópico
                      <Sparkles className="w-4 h-4 ml-2 opacity-70" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {topicCards.map((topic) => (
                  <ForumTopicCard 
                    key={topic.id} 
                    topic={topic as any}
                    onClick={() => handleTopicClick(topic.id)}
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
              totalOnline={forumStats?.onlineNow || 0}
            />

            {/* Leaderboard */}
            <ForumLeaderboard contributors={topContributors} />
          </div>
        </div>
      </div>

      {/* Create Topic Dialog */}
      <CreateTopicDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        categories={categories}
        selectedCategory={activeCategory !== 'all' ? categories.find(c => c.slug === activeCategory)?.id : undefined}
        onSubmit={handleCreateTopic}
        isLoading={createTopic.isPending}
      />

      {/* Topic Detail Dialog */}
      <TopicDetailDialog
        open={!!selectedTopic}
        onOpenChange={(open) => !open && setSelectedTopic(null)}
        topic={selectedTopic}
        fetchReplies={fetchReplies}
        onReply={handleReply}
        onDeleteTopic={handleDeleteTopic}
        onDeleteReply={handleDeleteReply}
        onTogglePin={handleTogglePin}
        onToggleLock={handleToggleLock}
        isReplying={createReply.isPending}
        currentPlayerId={profile?.id}
        isModerator={isModerator}
      />
    </div>
  );
};

export default Forum;

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Pin, Lock, Trash2, MessageSquare, Eye } from "lucide-react";

const ModForumTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['mod-forum-topics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_topics')
        .select('*, players!forum_topics_author_id_fkey(name), forum_categories(name)')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    }
  });

  const togglePin = async (topicId: string, isPinned: boolean) => {
    const { error } = await supabase.from('forum_topics').update({ is_pinned: !isPinned }).eq('id', topicId);
    if (error) { toast({ title: "Erro", variant: "destructive" }); return; }
    toast({ title: isPinned ? "Tópico desafixado" : "Tópico fixado" });
    queryClient.invalidateQueries({ queryKey: ['mod-forum-topics'] });
  };

  const toggleLock = async (topicId: string, isLocked: boolean) => {
    const { error } = await supabase.from('forum_topics').update({ is_locked: !isLocked }).eq('id', topicId);
    if (error) { toast({ title: "Erro", variant: "destructive" }); return; }
    toast({ title: isLocked ? "Tópico desbloqueado" : "Tópico bloqueado" });
    queryClient.invalidateQueries({ queryKey: ['mod-forum-topics'] });
  };

  const deleteTopic = async (topicId: string) => {
    if (!confirm("Tem certeza que deseja deletar este tópico?")) return;
    // Delete replies first
    await supabase.from('forum_replies').delete().eq('topic_id', topicId);
    await supabase.from('forum_reactions').delete().eq('topic_id', topicId);
    const { error } = await supabase.from('forum_topics').delete().eq('id', topicId);
    if (error) { toast({ title: "Erro ao deletar", variant: "destructive" }); return; }
    toast({ title: "Tópico deletado" });
    queryClient.invalidateQueries({ queryKey: ['mod-forum-topics'] });
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Tópicos Recentes do Fórum</h3>
      {topics.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum tópico encontrado.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {topics.map((topic: any) => (
            <Card key={topic.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm flex items-center gap-2">
                      {topic.is_pinned && <Pin className="w-3 h-3 text-primary" />}
                      {topic.is_locked && <Lock className="w-3 h-3 text-destructive" />}
                      <span className="truncate">{topic.title}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <span>{topic.players?.name}</span>
                      <span>•</span>
                      <span>{topic.forum_categories?.name}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{topic.replies_count || 0}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{topic.views_count || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button size="sm" variant="ghost" onClick={() => togglePin(topic.id, topic.is_pinned)} title={topic.is_pinned ? "Desafixar" : "Fixar"}>
                      <Pin className={`w-4 h-4 ${topic.is_pinned ? 'text-primary' : ''}`} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleLock(topic.id, topic.is_locked)} title={topic.is_locked ? "Desbloquear" : "Bloquear"}>
                      <Lock className={`w-4 h-4 ${topic.is_locked ? 'text-destructive' : ''}`} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteTopic(topic.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModForumTab;

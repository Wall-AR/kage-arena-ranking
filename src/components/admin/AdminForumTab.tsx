import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Loader2, Trash2, Lock, Unlock, Pin, PinOff, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Topic {
  id: string;
  title: string;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  replies_count: number;
  views_count: number;
  author: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  category: {
    id: string;
    name: string;
    color: string;
  };
}

export function AdminForumTab() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          id,
          title,
          is_pinned,
          is_locked,
          created_at,
          replies_count,
          views_count,
          author:players!forum_topics_author_id_fkey(id, name, avatar_url),
          category:forum_categories!forum_topics_category_id_fkey(id, name, color)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast({
        title: "Erro ao carregar tópicos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePin = async (id: string, currentValue: boolean) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('forum_topics')
        .update({ is_pinned: !currentValue })
        .eq('id', id);

      if (error) throw error;

      toast({ title: !currentValue ? "Tópico fixado!" : "Tópico desfixado!" });
      fetchTopics();
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast({
        title: "Erro ao atualizar tópico",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const toggleLock = async (id: string, currentValue: boolean) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('forum_topics')
        .update({ is_locked: !currentValue })
        .eq('id', id);

      if (error) throw error;

      toast({ title: !currentValue ? "Tópico trancado!" : "Tópico destrancado!" });
      fetchTopics();
    } catch (error) {
      console.error('Error toggling lock:', error);
      toast({
        title: "Erro ao atualizar tópico",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteTopic = async (id: string) => {
    setActionLoading(id);
    try {
      // Delete replies first
      await supabase.from('forum_replies').delete().eq('topic_id', id);
      await supabase.from('forum_reactions').delete().eq('topic_id', id);
      
      const { error } = await supabase
        .from('forum_topics')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Tópico excluído!" });
      fetchTopics();
    } catch (error) {
      console.error('Error deleting topic:', error);
      toast({
        title: "Erro ao excluir tópico",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Moderação do Fórum ({topics.length} tópicos)
        </CardTitle>
        <CardDescription>
          Fixe, tranque ou exclua tópicos do fórum
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p>Carregando tópicos...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tópico</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics.map((topic) => (
                  <TableRow key={topic.id}>
                    <TableCell>
                      <div className="max-w-xs truncate font-medium">{topic.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(topic.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={topic.author?.avatar_url || ""} />
                          <AvatarFallback>{topic.author?.name?.charAt(0) || "?"}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{topic.author?.name || "Desconhecido"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        style={{ 
                          borderColor: topic.category?.color,
                          color: topic.category?.color
                        }}
                      >
                        {topic.category?.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {topic.replies_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {topic.views_count}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {topic.is_pinned && (
                          <Badge className="bg-orange-500/20 text-orange-700 text-xs">
                            <Pin className="w-3 h-3 mr-1" />
                            Fixado
                          </Badge>
                        )}
                        {topic.is_locked && (
                          <Badge className="bg-red-500/20 text-red-700 text-xs">
                            <Lock className="w-3 h-3 mr-1" />
                            Trancado
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => togglePin(topic.id, topic.is_pinned ?? false)}
                          disabled={actionLoading === topic.id}
                          className="h-8 w-8 p-0"
                          title={topic.is_pinned ? "Desfixar" : "Fixar"}
                        >
                          {topic.is_pinned ? (
                            <PinOff className="w-4 h-4 text-orange-600" />
                          ) : (
                            <Pin className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleLock(topic.id, topic.is_locked ?? false)}
                          disabled={actionLoading === topic.id}
                          className="h-8 w-8 p-0"
                          title={topic.is_locked ? "Destrancar" : "Trancar"}
                        >
                          {topic.is_locked ? (
                            <Unlock className="w-4 h-4 text-red-600" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir tópico?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação é irreversível. O tópico "{topic.title}" e todas as respostas serão excluídos permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteTopic(topic.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, Send, Pin, Lock, Trash2, ThumbsUp, 
  MessageCircle, Eye, Clock, Crown, Shield, AlertTriangle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ForumTopic, ForumReply } from "@/hooks/useForum";
import { formatDistanceToNow } from "date-fns";
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
} from "@/components/ui/alert-dialog";

interface TopicDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: ForumTopic | null;
  fetchReplies: (topicId: string) => Promise<ForumReply[]>;
  onReply: (content: string) => void;
  onDeleteTopic: () => void;
  onDeleteReply: (replyId: string) => void;
  onTogglePin: () => void;
  onToggleLock: () => void;
  isReplying?: boolean;
  currentPlayerId?: string;
  isModerator?: boolean;
}

const rankColors: Record<string, { bg: string; text: string; border: string }> = {
  'Kage': { bg: 'bg-ninja-kage/20', text: 'text-ninja-kage', border: 'border-ninja-kage/30' },
  'Sannin': { bg: 'bg-ninja-sannin/20', text: 'text-ninja-sannin', border: 'border-ninja-sannin/30' },
  'Anbu': { bg: 'bg-ninja-anbu/20', text: 'text-ninja-anbu', border: 'border-ninja-anbu/30' },
  'Jounin': { bg: 'bg-ninja-jounin/20', text: 'text-ninja-jounin', border: 'border-ninja-jounin/30' },
  'Chunin': { bg: 'bg-ninja-chunin/20', text: 'text-ninja-chunin', border: 'border-ninja-chunin/30' },
  'Genin': { bg: 'bg-ninja-genin/20', text: 'text-ninja-genin', border: 'border-ninja-genin/30' }
};

const TopicDetailDialog = ({
  open,
  onOpenChange,
  topic,
  fetchReplies,
  onReply,
  onDeleteTopic,
  onDeleteReply,
  onTogglePin,
  onToggleLock,
  isReplying,
  currentPlayerId,
  isModerator
}: TopicDetailDialogProps) => {
  const [replyContent, setReplyContent] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [replyToDelete, setReplyToDelete] = useState<string | null>(null);

  const { data: replies = [], isLoading: repliesLoading } = useQuery({
    queryKey: ['forum-replies', topic?.id],
    queryFn: () => topic ? fetchReplies(topic.id) : Promise.resolve([]),
    enabled: !!topic?.id && open
  });

  const handleSubmitReply = () => {
    if (!replyContent.trim() || topic?.is_locked) return;
    onReply(replyContent.trim());
    setReplyContent("");
  };

  const handleDeleteReply = (replyId: string) => {
    setReplyToDelete(replyId);
  };

  const confirmDeleteReply = () => {
    if (replyToDelete) {
      onDeleteReply(replyToDelete);
      setReplyToDelete(null);
    }
  };

  if (!topic) return null;

  const authorRank = topic.author?.rank || 'Genin';
  const rankStyle = rankColors[authorRank] || rankColors['Genin'];
  const isAuthor = currentPlayerId === topic.author_id;
  const canManage = isModerator || isAuthor;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col bg-gradient-card border-border/50">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {topic.is_pinned && (
                    <Badge variant="outline" className="border-ninja-kage/50 text-ninja-kage bg-ninja-kage/10 text-xs">
                      <Pin className="w-3 h-3 mr-1" />
                      Fixado
                    </Badge>
                  )}
                  {topic.is_locked && (
                    <Badge variant="outline" className="border-ninja-anbu/50 text-ninja-anbu bg-ninja-anbu/10 text-xs">
                      <Lock className="w-3 h-3 mr-1" />
                      Bloqueado
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {topic.category?.name}
                  </Badge>
                </div>
                <DialogTitle className="text-xl font-semibold">{topic.title}</DialogTitle>
              </div>

              {canManage && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isModerator && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onTogglePin}
                        className="h-8 w-8"
                        title={topic.is_pinned ? "Desafixar" : "Fixar"}
                      >
                        <Pin className={cn("w-4 h-4", topic.is_pinned && "text-ninja-kage")} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleLock}
                        className="h-8 w-8"
                        title={topic.is_locked ? "Desbloquear" : "Bloquear"}
                      >
                        <Lock className={cn("w-4 h-4", topic.is_locked && "text-ninja-anbu")} />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    title="Deletar tópico"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 -mx-6 px-6">
            {/* Original post */}
            <div className="bg-muted/20 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3 mb-3">
                <Avatar className={cn("w-10 h-10 ring-2", rankStyle.border)}>
                  <AvatarImage src={topic.author?.avatar_url || undefined} />
                  <AvatarFallback className={cn("font-bold", rankStyle.bg, rankStyle.text)}>
                    {topic.author?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-medium", rankStyle.text)}>
                      {topic.author?.name}
                    </span>
                    {topic.author?.is_admin && (
                      <Crown className="w-4 h-4 text-ninja-kage" />
                    )}
                    {topic.author?.is_moderator && !topic.author?.is_admin && (
                      <Shield className="w-4 h-4 text-ninja-jounin" />
                    )}
                    <Badge variant="outline" className={cn("text-xs py-0 px-1.5", rankStyle.border, rankStyle.text)}>
                      {authorRank}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: ptBR })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {topic.views_count} views
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {topic.replies_count} respostas
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-foreground whitespace-pre-wrap">{topic.content}</p>
            </div>

            <Separator className="my-4" />

            {/* Replies */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Respostas ({replies.length})
              </h3>

              {repliesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : replies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma resposta ainda. Seja o primeiro!</p>
                </div>
              ) : (
                replies.map((reply) => {
                  const replyRank = reply.author?.rank || 'Genin';
                  const replyRankStyle = rankColors[replyRank] || rankColors['Genin'];
                  const canDeleteReply = isModerator || currentPlayerId === reply.author_id;

                  return (
                    <div key={reply.id} className="bg-muted/10 rounded-lg p-4 group">
                      <div className="flex items-start gap-3">
                        <Avatar className={cn("w-8 h-8 ring-2", replyRankStyle.border)}>
                          <AvatarImage src={reply.author?.avatar_url || undefined} />
                          <AvatarFallback className={cn("font-bold text-xs", replyRankStyle.bg, replyRankStyle.text)}>
                            {reply.author?.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={cn("font-medium text-sm", replyRankStyle.text)}>
                                {reply.author?.name}
                              </span>
                              {reply.author?.is_admin && (
                                <Crown className="w-3 h-3 text-ninja-kage" />
                              )}
                              {reply.author?.is_moderator && !reply.author?.is_admin && (
                                <Shield className="w-3 h-3 text-ninja-jounin" />
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale: ptBR })}
                              </span>
                            </div>
                            {canDeleteReply && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteReply(reply.id)}
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                          <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Reply form */}
          {!topic.is_locked && currentPlayerId && (
            <div className="flex-shrink-0 pt-4 border-t border-border/30">
              <div className="flex gap-3">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Escreva sua resposta..."
                  className="bg-background/50 border-border/50 min-h-[80px] resize-none"
                />
                <Button
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim() || isReplying}
                  className="bg-gradient-to-r from-primary to-accent self-end"
                >
                  {isReplying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {topic.is_locked && (
            <div className="flex-shrink-0 pt-4 border-t border-border/30">
              <div className="flex items-center justify-center gap-2 text-muted-foreground py-2">
                <Lock className="w-4 h-4" />
                <span className="text-sm">Este tópico está bloqueado para novas respostas</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete topic confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Deletar Tópico
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este tópico? Esta ação não pode ser desfeita e todas as respostas serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDeleteTopic();
                setDeleteDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete reply confirmation */}
      <AlertDialog open={!!replyToDelete} onOpenChange={() => setReplyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Deletar Resposta
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta resposta?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteReply}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TopicDetailDialog;

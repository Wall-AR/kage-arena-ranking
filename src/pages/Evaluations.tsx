import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { useEvaluations } from "@/hooks/useEvaluations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/ui/navigation";
import { Clock, User, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Evaluations() {
  const { user } = useAuth();
  const { data: currentPlayer } = usePlayerProfile(user?.id);
  const { pendingEvaluations, acceptEvaluation, loading } = useEvaluations();
  const [accepting, setAccepting] = useState<string | null>(null);
  const { toast } = useToast();

  // Verificar se o usuário é moderador
  if (!currentPlayer?.is_moderator) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Acesso Negado
            </h1>
            <p className="text-muted-foreground">
              Você precisa ser um moderador para acessar esta página.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleAcceptEvaluation = async (evaluationId: string) => {
    if (!currentPlayer) return;

    setAccepting(evaluationId);
    try {
      await acceptEvaluation(evaluationId, currentPlayer.id);
      toast({
        title: "Avaliação aceita!",
        description: "O jogador foi notificado e adicionado à sua lista de alunos.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível aceitar a avaliação.",
        variant: "destructive",
      });
    } finally {
      setAccepting(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Pedidos de Avaliação
            </h1>
            <p className="text-muted-foreground">
              Gerencie os pedidos de avaliação dos jogadores
            </p>
          </div>

          {loading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pendingEvaluations.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhum pedido pendente
                </h3>
                <p className="text-muted-foreground">
                  Não há pedidos de avaliação aguardando aprovação no momento.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingEvaluations.map((evaluation) => (
                <Card key={evaluation.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={evaluation.players?.avatar_url} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {evaluation.players?.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                              {new Date(evaluation.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">
                          {evaluation.players?.rank || 'Unranked'}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {evaluation.players?.points} pontos
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {evaluation.request_message && (
                      <>
                        <Separator className="mb-4" />
                        <div className="bg-muted/50 rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-foreground mb-2">
                            Mensagem do jogador:
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            "{evaluation.request_message}"
                          </p>
                        </div>
                      </>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Vitórias:</span>
                        <span className="font-medium ml-2">
                          {evaluation.players?.wins || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Derrotas:</span>
                        <span className="font-medium ml-2">
                          {evaluation.players?.losses || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sequência:</span>
                        <span className="font-medium ml-2">
                          {evaluation.players?.win_streak || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rankeado:</span>
                        <span className="font-medium ml-2">
                          {evaluation.players?.is_ranked ? 'Sim' : 'Não'}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleAcceptEvaluation(evaluation.id)}
                      disabled={accepting === evaluation.id}
                      className="w-full"
                    >
                      {accepting === evaluation.id ? "Aceitando..." : "Aceitar Avaliação"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
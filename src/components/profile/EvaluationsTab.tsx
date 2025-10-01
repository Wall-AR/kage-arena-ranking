import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, User, Clock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EvaluationsTabProps {
  playerId: string;
  isOwnProfile: boolean;
  privacySettings?: { evaluation_visibility?: string };
}

interface Evaluation {
  id: string;
  status: string;
  created_at: string;
  evaluated_at: string | null;
  request_message: string | null;
  tips: string | null;
  tip_1: string | null;
  tip_2: string | null;
  tip_3: string | null;
  summary: string | null;
  pin_score: number | null;
  defense_score: number | null;
  aerial_score: number | null;
  kunai_score: number | null;
  timing_score: number | null;
  resource_score: number | null;
  dash_score: number | null;
  general_score: number | null;
  evaluator?: {
    name: string;
    avatar_url: string | null;
    ninja_phrase: string | null;
  } | null;
}

export const EvaluationsTab = ({ playerId, isOwnProfile, privacySettings }: EvaluationsTabProps) => {
  // Verificar se as avaliações devem ser visíveis
  const shouldShowEvaluations = isOwnProfile || privacySettings?.evaluation_visibility === "all";

  const { data: evaluations, isLoading } = useQuery({
    queryKey: ['player-evaluations', playerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evaluations')
        .select(`
          *,
          evaluator:players!evaluations_evaluator_id_fkey(name, avatar_url, ninja_phrase)
        `)
        .eq('player_id', playerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Evaluation[] || [];
    },
    enabled: !!playerId && shouldShowEvaluations
  });

  if (!shouldShowEvaluations && !isOwnProfile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <EyeOff className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Avaliações Privadas
            </h3>
            <p className="text-sm text-muted-foreground">
              Este jogador optou por manter suas avaliações privadas
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-muted/20 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!evaluations || evaluations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Nenhuma avaliação encontrada
            </h3>
            <p className="text-sm text-muted-foreground">
              {isOwnProfile 
                ? "Solicite uma avaliação para aparecer aqui" 
                : "Este jogador ainda não possui avaliações"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <AlertCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'accepted':
        return 'Em Andamento';
      case 'completed':
        return 'Concluída';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="space-y-6">
      {evaluations.map((evaluation) => (
        <Card key={evaluation.id} className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${getStatusColor(evaluation.status)}`}>
                  {getStatusIcon(evaluation.status)}
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Avaliação #{evaluation.id.slice(0, 8)}
                  </CardTitle>
                  <CardDescription>
                    Solicitada em {format(new Date(evaluation.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </CardDescription>
                </div>
              </div>
              <Badge className={getStatusColor(evaluation.status)}>
                {getStatusText(evaluation.status)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Mensagem da solicitação */}
            {evaluation.request_message && (
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-sm text-muted-foreground">Mensagem da Solicitação:</h4>
                <p className="text-sm leading-relaxed">{evaluation.request_message}</p>
              </div>
            )}

            {/* Avaliador */}
            {evaluation.evaluator && (
              <div className="flex items-center space-x-3 p-3 bg-accent/5 rounded-lg">
                <Avatar className="w-10 h-10 ring-2 ring-accent/30">
                  <AvatarImage src={evaluation.evaluator.avatar_url || ''} alt={evaluation.evaluator.name} />
                  <AvatarFallback className="bg-accent/20 text-accent">
                    {evaluation.evaluator.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-sm text-accent">{evaluation.evaluator.name}</div>
                  <div className="text-xs text-muted-foreground italic">
                    "{evaluation.evaluator.ninja_phrase || 'Essa é minha filosofia ninja!'}"
                  </div>
                </div>
              </div>
            )}

            {/* Scores da avaliação (apenas se concluída) */}
            {evaluation.status === 'completed' && (evaluation.pin_score || evaluation.general_score) && (
              <div className="space-y-4">
                <h4 className="font-semibold text-sm">Pontuações por Área:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{evaluation.pin_score?.toFixed(1) || '0.0'}</div>
                    <div className="text-xs text-muted-foreground mt-1">Pin</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg">
                    <div className="text-2xl font-bold text-accent">{evaluation.defense_score?.toFixed(1) || '0.0'}</div>
                    <div className="text-xs text-muted-foreground mt-1">Defesa</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{evaluation.aerial_score?.toFixed(1) || '0.0'}</div>
                    <div className="text-xs text-muted-foreground mt-1">Aéreo</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg">
                    <div className="text-2xl font-bold text-accent">{evaluation.kunai_score?.toFixed(1) || '0.0'}</div>
                    <div className="text-xs text-muted-foreground mt-1">Kunai</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{evaluation.timing_score?.toFixed(1) || '0.0'}</div>
                    <div className="text-xs text-muted-foreground mt-1">Timing</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg">
                    <div className="text-2xl font-bold text-accent">{evaluation.resource_score?.toFixed(1) || '0.0'}</div>
                    <div className="text-xs text-muted-foreground mt-1">Recurso</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{evaluation.dash_score?.toFixed(1) || '0.0'}</div>
                    <div className="text-xs text-muted-foreground mt-1">Dash</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-ninja-chunin/20 to-ninja-chunin/10 rounded-lg border-2 border-ninja-chunin/30">
                    <div className="text-2xl font-bold text-ninja-chunin">{evaluation.general_score?.toFixed(1) || '0.0'}</div>
                    <div className="text-xs text-muted-foreground mt-1">Geral</div>
                  </div>
                </div>
              </div>
            )}

            {/* Dicas organizadas (apenas se concluída) */}
            {evaluation.status === 'completed' && (evaluation.tip_1 || evaluation.tip_2 || evaluation.tip_3) && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-accent">Dicas do Avaliador:</h4>
                {evaluation.tip_1 && (
                  <div className="bg-muted/30 rounded-lg p-3 border-l-4 border-accent">
                    <div className="font-medium text-xs text-accent mb-1">1. Dica Principal</div>
                    <p className="text-sm leading-relaxed">{evaluation.tip_1}</p>
                  </div>
                )}
                {evaluation.tip_2 && (
                  <div className="bg-muted/30 rounded-lg p-3 border-l-4 border-accent/70">
                    <div className="font-medium text-xs text-accent mb-1">2. Segunda Dica</div>
                    <p className="text-sm leading-relaxed">{evaluation.tip_2}</p>
                  </div>
                )}
                {evaluation.tip_3 && (
                  <div className="bg-muted/30 rounded-lg p-3 border-l-4 border-accent/50">
                    <div className="font-medium text-xs text-accent mb-1">3. Terceira Dica</div>
                    <p className="text-sm leading-relaxed">{evaluation.tip_3}</p>
                  </div>
                )}
              </div>
            )}

            {/* Resumo da avaliação */}
            {evaluation.status === 'completed' && evaluation.summary && (
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-sm">Resumo da Avaliação:</h4>
                <p className="text-sm leading-relaxed">{evaluation.summary}</p>
              </div>
            )}

            {/* Data de conclusão */}
            {evaluation.evaluated_at && (
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                Concluída em {format(new Date(evaluation.evaluated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
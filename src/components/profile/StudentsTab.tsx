import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Trophy, User, Target, Calendar, Star, GraduationCap } from "lucide-react";
import { useStudents, useEvaluationHistory } from "@/hooks/useStudents";

interface StudentsTabProps {
  evaluatorId: string;
}

export const StudentsTab = ({ evaluatorId }: StudentsTabProps) => {
  const { data: students = [], isLoading: loadingStudents } = useStudents(evaluatorId);
  const { data: evaluationHistory = [], isLoading: loadingHistory } = useEvaluationHistory(evaluatorId);

  const getRankColor = (rank: string) => {
    const colors: { [key: string]: string } = {
      'Genin': 'bg-slate-500',
      'Chunnin': 'bg-green-500',
      'Jounnin': 'bg-blue-500',
      'Anbu': 'bg-purple-500',
      'Sanin': 'bg-orange-500',
      'Kage': 'bg-red-500'
    };
    return colors[rank] || 'bg-gray-500';
  };

  const getSkillAverage = (evaluation: any) => {
    if (!evaluation) return 0;
    const scores = [
      evaluation.pin_score,
      evaluation.defense_score,
      evaluation.aerial_score,
      evaluation.kunai_score,
      evaluation.timing_score,
      evaluation.resource_score,
      evaluation.dash_score,
      evaluation.general_score
    ].filter(score => score !== null);
    
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  };

  if (loadingStudents) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Alunos</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Avaliações Realizadas</p>
                <p className="text-2xl font-bold">{evaluationHistory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Nota Média</p>
                <p className="text-2xl font-bold">
                  {evaluationHistory.length > 0 
                    ? (evaluationHistory.reduce((acc, evaluation) => acc + getSkillAverage(evaluation), 0) / evaluationHistory.length).toFixed(1)
                    : "0.0"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de alunos */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Meus Alunos</h3>
        {students.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum aluno encontrado
              </h3>
              <p className="text-muted-foreground">
                Você ainda não avaliou nenhum jogador.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {students.map((student) => {
              const evaluation = student.evaluations?.[0]; // Primeira (mais recente) avaliação
              const skillAverage = getSkillAverage(evaluation);
              
              return (
                <Card key={student.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={student.avatar_url} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{student.name}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Avaliado em {evaluation ? new Date(evaluation.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getRankColor(student.rank_level)} text-white`}>
                          {student.rank_level}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {student.current_points} pontos
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Vitórias:</span>
                        <span className="font-medium ml-2">{student.wins}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Derrotas:</span>
                        <span className="font-medium ml-2">{student.losses}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Taxa de Vitória:</span>
                        <span className="font-medium ml-2">
                          {student.wins + student.losses > 0 
                            ? `${Math.round((student.wins / (student.wins + student.losses)) * 100)}%`
                            : "0%"
                          }
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Nota Geral:</span>
                        <span className="font-medium ml-2">
                          {skillAverage > 0 ? skillAverage.toFixed(1) : "N/A"}
                        </span>
                      </div>
                    </div>

                    {evaluation && (
                      <>
                        <Separator className="mb-4" />
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">Progresso nas Habilidades:</h4>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            {[
                              { label: 'Pin', value: evaluation.pin_score },
                              { label: 'Defesa', value: evaluation.defense_score },
                              { label: 'Aéreo', value: evaluation.aerial_score },
                              { label: 'Kunai', value: evaluation.kunai_score },
                              { label: 'Timing', value: evaluation.timing_score },
                              { label: 'Recurso', value: evaluation.resource_score },
                              { label: 'Dash', value: evaluation.dash_score },
                              { label: 'Geral', value: evaluation.general_score }
                            ].map((skill) => (
                              <div key={skill.label} className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">{skill.label}</span>
                                  <span className="font-medium">{skill.value ? skill.value.toFixed(1) : 'N/A'}</span>
                                </div>
                                <Progress 
                                  value={skill.value ? (skill.value / 10) * 100 : 0} 
                                  className="h-1"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};


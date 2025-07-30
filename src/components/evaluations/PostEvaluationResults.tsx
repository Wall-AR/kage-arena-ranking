import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface PostEvaluationResultsProps {
  evaluation: {
    id: string;
    player_id: string;
    players?: {
      name: string;
      rank: string;
    };
  };
  onResultsPosted?: () => void;
}

const PostEvaluationResults = ({ evaluation, onResultsPosted }: PostEvaluationResultsProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [scores, setScores] = useState({
    pin_score: '',
    defense_score: '',
    aerial_score: '',
    kunai_score: '',
    timing_score: '',
    resource_score: '',
    dash_score: '',
    general_score: ''
  });

  const [initialRank, setInitialRank] = useState('');
  const [evaluationSummary, setEvaluationSummary] = useState('');
  const [tips, setTips] = useState({
    tip_1: '',
    tip_2: '',
    tip_3: ''
  });

  const rankOptions = [
    { value: 'Genin', label: 'Genin (100 pts)', points: 100 },
    { value: 'Chunnin', label: 'Chunnin (200 pts)', points: 200 },
    { value: 'Jounnin', label: 'Jounnin (350 pts)', points: 350 },
    { value: 'Anbu', label: 'Anbu (450 pts)', points: 450 },
    { value: 'Sanin', label: 'Sanin (600 pts)', points: 600 }
  ];

  const skillLabels = [
    { key: 'pin_score', label: 'Pin' },
    { key: 'defense_score', label: 'Defesa' },
    { key: 'aerial_score', label: 'Aéreo' },
    { key: 'kunai_score', label: 'Kunai' },
    { key: 'timing_score', label: 'Timing' },
    { key: 'resource_score', label: 'Recurso' },
    { key: 'dash_score', label: 'Dash' },
    { key: 'general_score', label: 'Geral' }
  ];

  const validateScores = () => {
    for (const [key, value] of Object.entries(scores)) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0 || numValue > 10) {
        toast({
          title: "Erro de validação",
          description: `${skillLabels.find(s => s.key === key)?.label} deve estar entre 0 e 10`,
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateScores() || !initialRank || !evaluationSummary || !tips.tip_1 || !tips.tip_2 || !tips.tip_3) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos antes de enviar",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Buscar dados do avaliador
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: evaluator } = await supabase
        .from('players')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!evaluator) throw new Error('Avaliador não encontrado');

      const initialPoints = rankOptions.find(r => r.value === initialRank)?.points || 100;

      // Inserir resultados da avaliação
      const { error: resultsError } = await supabase
        .from('evaluation_results')
        .insert({
          evaluation_id: evaluation.id,
          evaluator_id: evaluator.id,
          player_id: evaluation.player_id,
          ...Object.fromEntries(
            Object.entries(scores).map(([key, value]) => [key, parseFloat(value)])
          ),
          initial_rank: initialRank,
          initial_points: initialPoints,
          evaluation_summary: evaluationSummary,
          ...tips
        });

      if (resultsError) throw resultsError;

      // Atualizar status da avaliação
      const { error: evalError } = await supabase
        .from('evaluations')
        .update({ 
          status: 'completed',
          evaluated_at: new Date().toISOString(),
          initial_rank: initialRank,
          ...Object.fromEntries(
            Object.entries(scores).map(([key, value]) => [key, parseFloat(value)])
          ),
          tips: `${tips.tip_1}\n\n${tips.tip_2}\n\n${tips.tip_3}`,
          comments: evaluationSummary
        })
        .eq('id', evaluation.id);

      if (evalError) throw evalError;

      // Atualizar jogador para rankeado
      const { error: playerError } = await supabase
        .from('players')
        .update({
          is_ranked: true,
          rank_level: initialRank,
          current_points: initialPoints,
          rank: initialRank // Manter compatibilidade
        })
        .eq('id', evaluation.player_id);

      if (playerError) throw playerError;

      // Registrar mudança de ranking
      const { error: rankingError } = await supabase
        .from('ranking_changes')
        .insert({
          player_id: evaluation.player_id,
          old_rank: 'Unranked',
          new_rank: initialRank,
          old_points: 0,
          new_points: initialPoints,
          change_reason: 'evaluation',
          evaluation_id: evaluation.id
        });

      if (rankingError) throw rankingError;

      // Atualizar títulos Kage
      await supabase.rpc('update_kage_titles');

      toast({
        title: "Avaliação concluída!",
        description: `${evaluation.players?.name} foi promovido para ${initialRank}`,
      });

      setOpen(false);
      onResultsPosted?.();
    } catch (error: any) {
      console.error('Erro ao postar resultados:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar resultados da avaliação",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          Postar Resultados
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Resultados da Avaliação - {evaluation.players?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Scores das 8 habilidades */}
          <Card>
            <CardHeader>
              <CardTitle>Pontuações (0-10)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {skillLabels.map(skill => (
                  <div key={skill.key} className="space-y-2">
                    <Label htmlFor={skill.key}>{skill.label}</Label>
                    <Input
                      id={skill.key}
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={scores[skill.key as keyof typeof scores]}
                      onChange={(e) => setScores(prev => ({ ...prev, [skill.key]: e.target.value }))}
                      placeholder="0.0"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ranking inicial */}
          <Card>
            <CardHeader>
              <CardTitle>Ranking Inicial</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={initialRank} onValueChange={setInitialRank}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ranking inicial" />
                </SelectTrigger>
                <SelectContent>
                  {rankOptions.map(rank => (
                    <SelectItem key={rank.value} value={rank.value}>
                      {rank.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Resumo da avaliação */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Avaliação</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={evaluationSummary}
                onChange={(e) => setEvaluationSummary(e.target.value)}
                placeholder="Descreva o desempenho geral do jogador e justifique o ranking escolhido..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Dicas para o jogador */}
          <Card>
            <CardHeader>
              <CardTitle>Dicas para Melhoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tip1">Dica 1</Label>
                <Textarea
                  id="tip1"
                  value={tips.tip_1}
                  onChange={(e) => setTips(prev => ({ ...prev, tip_1: e.target.value }))}
                  placeholder="Primeira dica para melhoria..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tip2">Dica 2</Label>
                <Textarea
                  id="tip2"
                  value={tips.tip_2}
                  onChange={(e) => setTips(prev => ({ ...prev, tip_2: e.target.value }))}
                  placeholder="Segunda dica para melhoria..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tip3">Dica 3</Label>
                <Textarea
                  id="tip3"
                  value={tips.tip_3}
                  onChange={(e) => setTips(prev => ({ ...prev, tip_3: e.target.value }))}
                  placeholder="Terceira dica para melhoria..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmar Avaliação
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostEvaluationResults;
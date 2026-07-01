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
    pin_score: "",
    defense_score: "",
    aerial_score: "",
    kunai_score: "",
    timing_score: "",
    resource_score: "",
    dash_score: "",
    general_score: ""
  });

  const [initialRank, setInitialRank] = useState("");
  const [evaluationSummary, setEvaluationSummary] = useState("");
  const [tips, setTips] = useState({
    tip_1: "",
    tip_2: "",
    tip_3: ""
  });

  const rankOptions = [
    { value: "Genin", label: "Genin (100 pts)" },
    { value: "Chunin", label: "Chunin (250 pts)" },
    { value: "Jounin", label: "Jounin (450 pts)" },
    { value: "Anbu", label: "Anbu (700 pts)" },
    { value: "Sannin", label: "Sannin (1000 pts)" }
  ];

  const skillLabels = [
    { key: "pin_score", label: "Pin" },
    { key: "defense_score", label: "Defesa" },
    { key: "aerial_score", label: "Aéreo" },
    { key: "kunai_score", label: "Kunai" },
    { key: "timing_score", label: "Timing" },
    { key: "resource_score", label: "Recurso" },
    { key: "dash_score", label: "Dash" },
    { key: "general_score", label: "Geral" }
  ];

  const validateScores = () => {
    for (const [key, value] of Object.entries(scores)) {
      const numValue = Number(value);

      if (Number.isNaN(numValue) || numValue < 0 || numValue > 10) {
        toast({
          title: "Erro de validação",
          description: `${skillLabels.find((skill) => skill.key === key)?.label} deve estar entre 0 e 10`,
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateScores() || !initialRank || !evaluationSummary.trim() || !tips.tip_1.trim() || !tips.tip_2.trim() || !tips.tip_3.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos antes de enviar",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const scoresPayload = Object.fromEntries(
        Object.entries(scores).map(([key, value]) => [key, Number(value)])
      );

      const { error } = await supabase.rpc("publish_evaluation_result", {
        p_evaluation_id: evaluation.id,
        p_scores: scoresPayload,
        p_initial_rank: initialRank,
        p_summary: evaluationSummary.trim(),
        p_tip_1: tips.tip_1.trim(),
        p_tip_2: tips.tip_2.trim(),
        p_tip_3: tips.tip_3.trim()
      });

      if (error) throw error;

      toast({
        title: "Avaliação concluída!",
        description: `${evaluation.players?.name || "Jogador"} foi promovido para ${initialRank}`,
      });

      setOpen(false);
      onResultsPosted?.();
    } catch (error: unknown) {
      console.error("Erro ao postar resultados:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar resultados da avaliação",
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
          Postar resultados
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Resultados da avaliação - {evaluation.players?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pontuações (0-10)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {skillLabels.map((skill) => (
                  <div key={skill.key} className="space-y-2">
                    <Label htmlFor={skill.key}>{skill.label}</Label>
                    <Input
                      id={skill.key}
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={scores[skill.key as keyof typeof scores]}
                      onChange={(event) => setScores((prev) => ({ ...prev, [skill.key]: event.target.value }))}
                      placeholder="0.0"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ranking inicial</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={initialRank} onValueChange={setInitialRank}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ranking inicial" />
                </SelectTrigger>
                <SelectContent>
                  {rankOptions.map((rank) => (
                    <SelectItem key={rank.value} value={rank.value}>
                      {rank.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo da avaliação</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={evaluationSummary}
                onChange={(event) => setEvaluationSummary(event.target.value)}
                placeholder="Descreva o desempenho geral do jogador e justifique o ranking escolhido..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dicas para melhoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tip1">Dica 1</Label>
                <Textarea
                  id="tip1"
                  value={tips.tip_1}
                  onChange={(event) => setTips((prev) => ({ ...prev, tip_1: event.target.value }))}
                  placeholder="Primeira dica para melhoria..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tip2">Dica 2</Label>
                <Textarea
                  id="tip2"
                  value={tips.tip_2}
                  onChange={(event) => setTips((prev) => ({ ...prev, tip_2: event.target.value }))}
                  placeholder="Segunda dica para melhoria..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tip3">Dica 3</Label>
                <Textarea
                  id="tip3"
                  value={tips.tip_3}
                  onChange={(event) => setTips((prev) => ({ ...prev, tip_3: event.target.value }))}
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
              Confirmar avaliação
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostEvaluationResults;

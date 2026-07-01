import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { useToast } from "@/hooks/use-toast";
import { Clock, User, MessageSquare, CheckCircle, Loader2 } from "lucide-react";
import PostEvaluationResults from "@/components/evaluations/PostEvaluationResults";

type ModEvaluation = {
  id: string;
  player_id: string;
  request_message: string | null;
  created_at: string;
  players?: {
    name: string | null;
    avatar_url: string | null;
    rank: string | null;
    points: number | null;
    wins: number | null;
    losses: number | null;
    win_streak?: number | null;
    is_ranked?: boolean | null;
  } | null;
};

const ModEvaluationsTab = () => {
  const { user } = useAuth();
  const { data: currentPlayer } = usePlayerProfile(user?.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [accepting, setAccepting] = useState<string | null>(null);

  const { data: pendingEvals = [], isLoading: loadingPending } = useQuery({
    queryKey: ["mod-evaluations-pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluations")
        .select("*, players!evaluations_player_id_fkey(name, avatar_url, rank, points, wins, losses, win_streak, is_ranked)")
        .eq("status", "pending")
        .is("evaluator_id", null)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []) as ModEvaluation[];
    },
    enabled: !!currentPlayer?.id
  });

  const { data: acceptedEvals = [], isLoading: loadingAccepted } = useQuery({
    queryKey: ["mod-evaluations-accepted", currentPlayer?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluations")
        .select("*, players!evaluations_player_id_fkey(name, avatar_url, rank, points, wins, losses)")
        .eq("status", "accepted")
        .eq("evaluator_id", currentPlayer!.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []) as ModEvaluation[];
    },
    enabled: !!currentPlayer?.id
  });

  const handleAccept = async (evalId: string) => {
    if (!currentPlayer) return;

    setAccepting(evalId);

    try {
      const { error } = await supabase.rpc("accept_evaluation", {
        p_evaluation_id: evalId
      });

      if (error) throw error;

      toast({ title: "Avaliação aceita!", description: "O jogador será notificado." });
      queryClient.invalidateQueries({ queryKey: ["mod-evaluations-pending"] });
      queryClient.invalidateQueries({ queryKey: ["mod-evaluations-accepted"] });
      queryClient.invalidateQueries({ queryKey: ["mod-pending-evals"] });
      queryClient.invalidateQueries({ queryKey: ["mod-accepted-evals"] });
      queryClient.invalidateQueries({ queryKey: ["pending-evaluations"] });
      queryClient.invalidateQueries({ queryKey: ["accepted-evaluations"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (error: unknown) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível aceitar.",
        variant: "destructive"
      });
    } finally {
      setAccepting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Pendentes ({pendingEvals.length})
        </h3>
        {loadingPending ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : pendingEvals.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhuma avaliação pendente.</CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {pendingEvals.map((ev) => (
              <Card key={ev.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={ev.players?.avatar_url} />
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{ev.players?.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ev.created_at).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{ev.players?.rank || "Unranked"}</Badge>
                      <span className="text-sm text-muted-foreground">{ev.players?.points} pts</span>
                      <Button size="sm" onClick={() => handleAccept(ev.id)} disabled={accepting === ev.id}>
                        {accepting === ev.id ? "Aceitando..." : "Aceitar"}
                      </Button>
                    </div>
                  </div>
                  {ev.request_message && (
                    <div className="mt-3 bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                      "{ev.request_message}"
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-ninja-chunin" />
          Em andamento ({acceptedEvals.length})
        </h3>
        {loadingAccepted ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : acceptedEvals.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhuma avaliação em andamento.</CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {acceptedEvals.map((ev) => (
              <Card key={ev.id} className="border-ninja-chunin/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={ev.players?.avatar_url} />
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{ev.players?.name}</div>
                        <div className="text-xs text-muted-foreground">{ev.players?.wins || 0}V - {ev.players?.losses || 0}D</div>
                      </div>
                    </div>
                    <PostEvaluationResults
                      evaluation={ev}
                      onResultsPosted={() => {
                        queryClient.invalidateQueries({ queryKey: ["mod-evaluations-accepted"] });
                        queryClient.invalidateQueries({ queryKey: ["mod-accepted-evals"] });
                        queryClient.invalidateQueries({ queryKey: ["ranked-players"] });
                        queryClient.invalidateQueries({ queryKey: ["player-profile"] });
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModEvaluationsTab;

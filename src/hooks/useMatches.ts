import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface MatchResult {
  challengeId: string;
  winnerId: string;
  loserId: string;
  rounds: { round: number; winner: string }[];
  notes?: string;
  evidenceUrl?: string;
}

export const useMatches = () => {
  const { currentPlayer } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Calcular mudança de pontos baseado no ranking
  const calculatePointsChange = (winnerRank: string, loserRank: string, isWinner: boolean) => {
    const rankValues = {
      'Unranked': 0,
      'Genin': 1,
      'Chunnin': 2,
      'Jounnin': 3,
      'Anbu': 4,
      'Sanin': 5,
      'Kage': 6
    };

    const winnerValue = rankValues[winnerRank as keyof typeof rankValues] || 0;
    const loserValue = rankValues[loserRank as keyof typeof rankValues] || 0;

    let basePoints = 25;
    const rankDifference = Math.abs(winnerValue - loserValue);
    
    if (rankDifference >= 2) {
      basePoints = winnerValue > loserValue ? 15 : 35; // Menor ganho se vencer rank inferior, maior se vencer superior
    }

    return isWinner ? basePoints : -Math.floor(basePoints * 0.8);
  };

  // Reportar resultado da partida
  const reportMatchMutation = useMutation({
    mutationFn: async (matchData: MatchResult) => {
      if (!currentPlayer?.id) throw new Error("Usuário não autenticado");

      // Buscar dados dos jogadores
      const { data: players, error: playersError } = await supabase
        .from("players")
        .select("id, name, rank, current_points, wins, losses")
        .in("id", [matchData.winnerId, matchData.loserId]);

      if (playersError) throw playersError;

      const winner = players.find(p => p.id === matchData.winnerId);
      const loser = players.find(p => p.id === matchData.loserId);

      if (!winner || !loser) throw new Error("Jogadores não encontrados");

      // Calcular mudanças de pontos
      const winnerPointsChange = calculatePointsChange(winner.rank, loser.rank, true);
      const loserPointsChange = calculatePointsChange(winner.rank, loser.rank, false);

      // Criar a partida
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .insert({
          challenge_id: matchData.challengeId,
          winner_id: matchData.winnerId,
          loser_id: matchData.loserId,
          rounds_data: matchData.rounds,
          winner_points_change: winnerPointsChange,
          loser_points_change: loserPointsChange,
          match_notes: matchData.notes,
          evidence_url: matchData.evidenceUrl
        })
        .select()
        .single();

      if (matchError) throw matchError;

      // Atualizar pontos e estatísticas dos jogadores
      const { error: winnerUpdateError } = await supabase
        .from("players")
        .update({
          current_points: winner.current_points + winnerPointsChange,
          wins: winner.wins + 1,
          win_streak: winner.id === currentPlayer.id ? (currentPlayer.wins || 0) + 1 : 0
        })
        .eq("id", matchData.winnerId);

      if (winnerUpdateError) throw winnerUpdateError;

      const { error: loserUpdateError } = await supabase
        .from("players")
        .update({
          current_points: Math.max(0, loser.current_points + loserPointsChange),
          losses: loser.losses + 1,
          win_streak: 0
        })
        .eq("id", matchData.loserId);

      if (loserUpdateError) throw loserUpdateError;

      // Atualizar status do desafio
      const { error: challengeUpdateError } = await supabase
        .from("challenges")
        .update({ status: "completed" })
        .eq("id", matchData.challengeId);

      if (challengeUpdateError) throw challengeUpdateError;

      // Registrar mudanças de ranking
      await supabase.from("ranking_changes").insert([
        {
          player_id: matchData.winnerId,
          old_points: winner.current_points,
          new_points: winner.current_points + winnerPointsChange,
          match_id: match.id,
          change_reason: "match_victory",
          old_rank: winner.rank,
          new_rank: winner.rank // TODO: Implementar mudança de rank baseada em pontos
        },
        {
          player_id: matchData.loserId,
          old_points: loser.current_points,
          new_points: Math.max(0, loser.current_points + loserPointsChange),
          match_id: match.id,
          change_reason: "match_defeat",
          old_rank: loser.rank,
          new_rank: loser.rank // TODO: Implementar mudança de rank baseada em pontos
        }
      ]);

      return match;
    },
    onSuccess: () => {
      toast({
        title: "Resultado reportado!",
        description: "O resultado da partida foi registrado e os pontos atualizados.",
      });
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["ranking"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao reportar resultado",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    reportMatch: reportMatchMutation.mutate,
    isReporting: reportMatchMutation.isPending,
  };
};
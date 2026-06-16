import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface Challenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  status: string;
  match_type: string;
  message?: string;
  created_at: string;
  expires_at: string;
  accepted_at?: string | null;
  challenger_checked_in_at?: string | null;
  challenged_checked_in_at?: string | null;
  reported_by?: string | null;
  reported_winner_id?: string | null;
  reported_rounds?: { round: number; winner: string }[] | null;
  reported_notes?: string | null;
  reported_evidence_url?: string | null;
  reported_at?: string | null;
  confirmed_at?: string | null;
  dispute_reason?: string | null;
  disputed_at?: string | null;
  cancelled_at?: string | null;
  match_id?: string | null;
  challenger: { id: string; name: string; rank: string; avatar_url?: string };
  challenged: { id: string; name: string; rank: string; avatar_url?: string };
}

const CHALLENGE_SELECT = `
  id, challenger_id, challenged_id, status, match_type, message,
  created_at, expires_at, accepted_at,
  challenger_checked_in_at, challenged_checked_in_at,
  reported_by, reported_winner_id, reported_rounds, reported_notes,
  reported_evidence_url, reported_at, confirmed_at,
  dispute_reason, disputed_at, cancelled_at, match_id,
  challenger:players!challenges_challenger_id_fkey(id, name, rank, avatar_url),
  challenged:players!challenges_challenged_id_fkey(id, name, rank, avatar_url)
`;

export const useChallenges = () => {
  const { currentPlayer } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Expira desafios vencidos uma vez ao montar
  useEffect(() => {
    supabase.rpc("expire_old_challenges").then(() => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    });
  }, [queryClient]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["challenges"] });
    queryClient.invalidateQueries({ queryKey: ["players"] });
    queryClient.invalidateQueries({ queryKey: ["ranking"] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const baseQuery = (statuses: string[], orderCol: string) =>
    supabase
      .from("challenges")
      .select(CHALLENGE_SELECT)
      .in("status", statuses)
      .or(`challenger_id.eq.${currentPlayer?.id},challenged_id.eq.${currentPlayer?.id}`)
      .order(orderCol, { ascending: false });

  const { data: pendingChallenges = [], isLoading: loadingPending } = useQuery({
    queryKey: ["challenges", "pending", currentPlayer?.id],
    queryFn: async () => {
      const { data, error } = await baseQuery(["pending"], "created_at");
      if (error) throw error;
      return data as unknown as Challenge[];
    },
    enabled: !!currentPlayer?.id,
  });

  const { data: acceptedChallenges = [], isLoading: loadingAccepted } = useQuery({
    queryKey: ["challenges", "accepted", currentPlayer?.id],
    queryFn: async () => {
      const { data, error } = await baseQuery(["accepted", "reported", "disputed"], "accepted_at");
      if (error) throw error;
      return data as unknown as Challenge[];
    },
    enabled: !!currentPlayer?.id,
  });

  const { data: challengeHistory = [], isLoading: loadingHistory } = useQuery({
    queryKey: ["challenges", "history", currentPlayer?.id],
    queryFn: async () => {
      const { data, error } = await baseQuery(
        ["completed", "expired", "cancelled", "rejected"],
        "created_at"
      );
      if (error) throw error;
      return data as unknown as Challenge[];
    },
    enabled: !!currentPlayer?.id,
  });

  const createChallenge = useMutation({
    mutationFn: async ({
      challengedId,
      matchType,
      message,
    }: { challengedId: string; matchType: string; message?: string }) => {
      if (!currentPlayer?.id) throw new Error("Não autenticado");
      if (challengedId === currentPlayer.id) throw new Error("Você não pode desafiar a si mesmo");

      // Bloqueia se já houver desafio ativo entre os dois
      const { data: existing } = await supabase
        .from("challenges")
        .select("id")
        .in("status", ["pending", "accepted", "reported", "disputed"])
        .or(
          `and(challenger_id.eq.${currentPlayer.id},challenged_id.eq.${challengedId}),and(challenger_id.eq.${challengedId},challenged_id.eq.${currentPlayer.id})`
        )
        .limit(1);
      if (existing && existing.length > 0) {
        throw new Error("Já existe um desafio ativo entre vocês.");
      }

      const { data, error } = await supabase
        .from("challenges")
        .insert({
          challenger_id: currentPlayer.id,
          challenged_id: challengedId,
          match_type: matchType,
          message,
          status: "pending",
        })
        .select()
        .single();
      if (error) throw error;

      // Notifica o desafiado
      const { data: target } = await supabase
        .from("players")
        .select("user_id, name")
        .eq("id", challengedId)
        .single();
      if (target?.user_id) {
        await supabase.from("notifications").insert({
          user_id: target.user_id,
          type: "challenge_received",
          title: "Novo desafio recebido!",
          message: `${currentPlayer.name} te desafiou para uma batalha (${matchType}).`,
          data: { challenge_id: data.id },
        });
      }
      return data;
    },
    onSuccess: () => {
      toast({ title: "Desafio enviado!", description: "Seu desafio foi enviado." });
      invalidate();
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const acceptChallenge = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("challenges")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", id)
        .select("challenger_id, challenged_id")
        .single();
      if (error) throw error;
      // notifica o desafiante
      const otherId = data.challenger_id === currentPlayer?.id ? data.challenged_id : data.challenger_id;
      const { data: p } = await supabase.from("players").select("user_id").eq("id", otherId).single();
      if (p?.user_id) {
        await supabase.from("notifications").insert({
          user_id: p.user_id,
          type: "challenge_accepted",
          title: "Desafio aceito!",
          message: "Seu oponente aceitou o desafio. Façam check-in para começar.",
          data: { challenge_id: id },
        });
      }
    },
    onSuccess: () => {
      toast({ title: "Desafio aceito!", description: "Faça check-in quando estiver pronto." });
      invalidate();
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const rejectChallenge = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("challenges")
        .update({ status: "rejected" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Desafio recusado" });
      invalidate();
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const cancelChallenge = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("cancel_challenge", { p_challenge_id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Desafio cancelado" });
      invalidate();
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const checkIn = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("challenge_check_in", { p_challenge_id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Check-in realizado!", description: "Aguarde o oponente fazer check-in." });
      invalidate();
    },
    onError: (e: Error) => toast({ title: "Erro no check-in", description: e.message, variant: "destructive" }),
  });

  const confirmResult = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("confirm_challenge_result", { p_challenge_id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Resultado confirmado!", description: "Pontos e rankings atualizados." });
      invalidate();
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const disputeResult = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase.rpc("dispute_challenge_result", {
        p_challenge_id: id,
        p_reason: reason,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Resultado contestado", description: "A moderação foi notificada." });
      invalidate();
    },
    onError: (e: Error) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  return {
    pendingChallenges,
    acceptedChallenges,
    challengeHistory,
    loadingPending,
    loadingAccepted,
    loadingHistory,
    createChallenge: createChallenge.mutate,
    acceptChallenge: acceptChallenge.mutate,
    rejectChallenge: rejectChallenge.mutate,
    cancelChallenge: cancelChallenge.mutate,
    checkIn: checkIn.mutate,
    confirmResult: confirmResult.mutate,
    disputeResult: disputeResult.mutate,
    isCreating: createChallenge.isPending,
    isAccepting: acceptChallenge.isPending,
    isRejecting: rejectChallenge.isPending,
    isCancelling: cancelChallenge.isPending,
    isCheckingIn: checkIn.isPending,
    isConfirming: confirmResult.isPending,
    isDisputing: disputeResult.isPending,
  };
};

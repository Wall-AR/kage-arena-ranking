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
  accepted_at?: string;
  checked_in_at?: string;
  challenger: {
    id: string;
    name: string;
    rank: string;
    avatar_url?: string;
  };
  challenged: {
    id: string;
    name: string;
    rank: string;
    avatar_url?: string;
  };
}

export const useChallenges = () => {
  const { user, currentPlayer } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar desafios pendentes do usuário
  const { data: pendingChallenges = [], isLoading: loadingPending } = useQuery({
    queryKey: ["challenges", "pending", currentPlayer?.id],
    queryFn: async () => {
      if (!currentPlayer?.id) return [];

      const { data, error } = await supabase
        .from("challenges")
        .select(`
          id,
          challenger_id,
          challenged_id,
          status,
          match_type,
          message,
          created_at,
          expires_at,
          accepted_at,
          checked_in_at,
          challenger:players!challenges_challenger_id_fkey(id, name, rank, avatar_url),
          challenged:players!challenges_challenged_id_fkey(id, name, rank, avatar_url)
        `)
        .eq("status", "pending")
        .or(`challenger_id.eq.${currentPlayer.id},challenged_id.eq.${currentPlayer.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Challenge[];
    },
    enabled: !!currentPlayer?.id,
  });

  // Buscar desafios aceitos do usuário
  const { data: acceptedChallenges = [], isLoading: loadingAccepted } = useQuery({
    queryKey: ["challenges", "accepted", currentPlayer?.id],
    queryFn: async () => {
      if (!currentPlayer?.id) return [];

      const { data, error } = await supabase
        .from("challenges")
        .select(`
          id,
          challenger_id,
          challenged_id,
          status,
          match_type,
          message,
          created_at,
          expires_at,
          accepted_at,
          checked_in_at,
          challenger:players!challenges_challenger_id_fkey(id, name, rank, avatar_url),
          challenged:players!challenges_challenged_id_fkey(id, name, rank, avatar_url)
        `)
        .eq("status", "accepted")
        .or(`challenger_id.eq.${currentPlayer.id},challenged_id.eq.${currentPlayer.id}`)
        .order("accepted_at", { ascending: false });

      if (error) throw error;
      return data as Challenge[];
    },
    enabled: !!currentPlayer?.id,
  });

  // Buscar histórico de desafios do usuário
  const { data: challengeHistory = [], isLoading: loadingHistory } = useQuery({
    queryKey: ["challenges", "history", currentPlayer?.id],
    queryFn: async () => {
      if (!currentPlayer?.id) return [];

      const { data, error } = await supabase
        .from("challenges")
        .select(`
          id,
          challenger_id,
          challenged_id,
          status,
          match_type,
          message,
          created_at,
          expires_at,
          accepted_at,
          checked_in_at,
          challenger:players!challenges_challenger_id_fkey(id, name, rank, avatar_url),
          challenged:players!challenges_challenged_id_fkey(id, name, rank, avatar_url)
        `)
        .in("status", ["completed", "expired", "cancelled"])
        .or(`challenger_id.eq.${currentPlayer.id},challenged_id.eq.${currentPlayer.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Challenge[];
    },
    enabled: !!currentPlayer?.id,
  });

  // Criar novo desafio
  const createChallengeMutation = useMutation({
    mutationFn: async ({ 
      challengedId, 
      matchType, 
      message 
    }: { 
      challengedId: string;
      matchType: string;
      message?: string;
    }) => {
      if (!currentPlayer?.id) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("challenges")
        .insert({
          challenger_id: currentPlayer.id,
          challenged_id: challengedId,
          match_type: matchType,
          message,
          status: "pending"
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Desafio enviado!",
        description: "Seu desafio foi enviado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar desafio",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Aceitar desafio
  const acceptChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      const { data, error } = await supabase
        .from("challenges")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString()
        })
        .eq("id", challengeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Desafio aceito!",
        description: "Você aceitou o desafio. Agora faça o check-in quando estiver pronto.",
      });
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao aceitar desafio",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Recusar desafio
  const rejectChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      const { data, error } = await supabase
        .from("challenges")
        .update({
          status: "rejected"
        })
        .eq("id", challengeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Desafio recusado",
        description: "Você recusou o desafio.",
      });
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao recusar desafio",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Check-in no desafio
  const checkInMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      const { data, error } = await supabase
        .from("challenges")
        .update({
          checked_in_at: new Date().toISOString()
        })
        .eq("id", challengeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Check-in realizado!",
        description: "Você fez check-in no desafio. Aguarde o oponente.",
      });
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    },
    onError: (error) => {
      toast({
        title: "Erro no check-in",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    pendingChallenges,
    acceptedChallenges,
    challengeHistory,
    loadingPending,
    loadingAccepted,
    loadingHistory,
    createChallenge: createChallengeMutation.mutate,
    acceptChallenge: acceptChallengeMutation.mutate,
    rejectChallenge: rejectChallengeMutation.mutate,
    checkIn: checkInMutation.mutate,
    isCreating: createChallengeMutation.isPending,
    isAccepting: acceptChallengeMutation.isPending,
    isRejecting: rejectChallengeMutation.isPending,
    isCheckingIn: checkInMutation.isPending,
  };
};
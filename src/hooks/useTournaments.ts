import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface Tournament {
  id: string;
  name: string;
  description: string | null;
  tournament_type: string;
  status: string;
  max_participants: number;
  registration_start: string;
  registration_end: string;
  tournament_start: string;
  check_in_start: string | null;
  check_in_end: string | null;
  image_url: string | null;
  min_rank: string | null;
  max_rank: string | null;
  require_top_character: boolean;
  required_character: string | null;
  rules_text: string | null;
  bracket_data: any;
  current_round: number;
  /** auth user id (backend) */
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useTournaments = () => {
  return useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Tournament[];
    },
  });
};

export const useTournament = (id?: string) => {
  return useQuery({
    queryKey: ["tournament", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("tournaments")
        .select(`
          *,
          participants:tournament_participants(
            *,
            player:players(id, name, avatar_url, rank)
          ),
          rewards:tournament_rewards(
            *,
            banner:banners(name, display_name),
            achievement:achievements(name, display_name, icon)
          ),
          matches:tournament_matches(
            *,
            player1:tournament_participants!tournament_matches_player1_id_fkey(
              id,
              player:players(id, name, avatar_url)
            ),
            player2:tournament_participants!tournament_matches_player2_id_fkey(
              id,
              player:players(id, name, avatar_url)
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useTournamentDisputes = (tournamentId?: string) => {
  return useQuery({
    queryKey: ["tournament-disputes", tournamentId],
    queryFn: async () => {
      if (!tournamentId) return [];

      const { data, error } = await supabase
        .from("tournament_disputes")
        .select(`
          *,
          reporter:players!tournament_disputes_reported_by_fkey(name, avatar_url),
          match:tournament_matches!inner(
            tournament_id,
            player1:tournament_participants!tournament_matches_player1_id_fkey(
              player:players(name, avatar_url)
            ),
            player2:tournament_participants!tournament_matches_player2_id_fkey(
              player:players(name, avatar_url)
            )
          )
        `)
        .eq("match.tournament_id", tournamentId)
        .order("created_at", { ascending: false });


      if (error) throw error;
      return data || [];
    },
    enabled: !!tournamentId,
  });
};

export const useCreateTournament = () => {
  const { toast } = useToast();
  const { currentPlayer } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentData: Partial<Tournament>) => {
      if (!currentPlayer?.id) throw new Error("Faca login para criar torneios.");
      if (!currentPlayer.is_ranked && !currentPlayer.is_moderator && !currentPlayer.is_admin) {
        throw new Error("Solicite e conclua sua avaliacao antes de criar torneios.");
      }

      const { data, error } = await supabase.rpc("create_tournament_request", {
        p_name: tournamentData.name || "",
        p_description: tournamentData.description || null,
        p_image_url: tournamentData.image_url || null,
        p_tournament_type: tournamentData.tournament_type || "single_elimination",
        p_max_participants: tournamentData.max_participants || 16,
        p_registration_start: tournamentData.registration_start || null,
        p_registration_end: tournamentData.registration_end || null,
        p_tournament_start: tournamentData.tournament_start || null,
        p_check_in_start: tournamentData.check_in_start || null,
        p_check_in_end: tournamentData.check_in_end || null,
        p_min_rank: tournamentData.min_rank || null,
        p_max_rank: tournamentData.max_rank || null,
        p_require_top_character: tournamentData.require_top_character || false,
        p_required_character: tournamentData.required_character || null,
        p_rules_text: tournamentData.rules_text || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: data?.status === "pending_approval" ? "Torneio enviado!" : "Torneio criado!",
        description:
          data?.status === "pending_approval"
            ? "Um moderador precisa aprovar antes das inscricoes abrirem."
            : "O torneio ja esta com inscricoes abertas.",
      });
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar torneio",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useApproveTournament = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentId: string) => {
      const { data, error } = await supabase.rpc("approve_tournament", {
        p_tournament_id: tournamentId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Torneio aprovado!",
        description: `${data?.name || "Torneio"} abriu inscricoes.`,
      });
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["tournament"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao aprovar torneio",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useRejectTournament = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tournamentId, reason }: { tournamentId: string; reason?: string }) => {
      const { data, error } = await supabase.rpc("reject_tournament", {
        p_tournament_id: tournamentId,
        p_reason: reason || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Torneio recusado",
        description: `${data?.name || "Torneio"} foi marcado como recusado.`,
      });
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["tournament"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao recusar torneio",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTournament = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Tournament> & { id: string }) => {
      const { data, error } = await supabase
        .from("tournaments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Torneio atualizado!",
        description: "O torneio foi atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["tournament"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar torneio",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useRegisterForTournament = () => {
  const { toast } = useToast();
  const { currentPlayer } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tournamentId, playerId }: { tournamentId: string; playerId: string }) => {
      if (!currentPlayer?.id) throw new Error("Faca login para se inscrever.");
      if (!currentPlayer.is_ranked) {
        throw new Error("Solicite e conclua sua avaliacao antes de entrar em torneios.");
      }

      const { data, error } = await supabase
        .from("tournament_participants")
        .insert({
          tournament_id: tournamentId,
          player_id: playerId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Inscrição realizada!",
        description: "Você foi inscrito no torneio com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["tournament"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro na inscrição",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useCheckInTournament = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (participantId: string) => {
      const { data, error } = await supabase
        .from("tournament_participants")
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
        })
        .eq("id", participantId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Check-in realizado!",
        description: "Você fez check-in no torneio com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["tournament"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no check-in",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useReportTournamentMatch = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      winnerId,
      player1Score,
      player2Score,
      evidenceUrl,
      notes,
      reportedBy,
      player1Character,
      player2Character,
    }: {
      matchId: string;
      winnerId: string;
      player1Score: number;
      player2Score: number;
      evidenceUrl?: string;
      notes?: string;
      reportedBy?: string;
      player1Character?: string;
      player2Character?: string;
    }) => {
      const { data, error } = await supabase
        .from("tournament_matches")
        .update({
          reported_winner_id: winnerId,
          reported_by: reportedBy,
          player1_score: player1Score,
          player2_score: player2Score,
          status: "awaiting_confirmation",
          evidence_url: evidenceUrl,
          notes: notes,
          player1_character: player1Character || null,
          player2_character: player2Character || null,
        })
        .eq("id", matchId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Resultado reportado!",
        description: "Aguardando confirmação do oponente.",
      });
      queryClient.invalidateQueries({ queryKey: ["tournament"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao reportar resultado",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useConfirmTournamentMatch = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, confirmedBy }: { matchId: string; confirmedBy: string }) => {
      // First get the match to know the reported winner
      const { data: match, error: matchError } = await supabase
        .from("tournament_matches")
        .select("reported_winner_id")
        .eq("id", matchId)
        .single();

      if (matchError) throw matchError;

      // Update match to completed
      const { data, error } = await supabase
        .from("tournament_matches")
        .update({
          winner_id: match.reported_winner_id,
          confirmed_by: confirmedBy,
          confirmed_at: new Date().toISOString(),
          status: "completed",
          played_at: new Date().toISOString(),
        })
        .eq("id", matchId)
        .select()
        .single();

      if (error) throw error;

      // Advance winner to next match
      if (data.winner_id) {
        await supabase.rpc("advance_tournament_winner", {
          p_match_id: matchId,
          p_winner_id: data.winner_id,
        });
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Resultado confirmado!",
        description: "O vencedor avançou no chaveamento.",
      });
      queryClient.invalidateQueries({ queryKey: ["tournament"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao confirmar resultado",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useCreateDispute = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      reportedBy,
      reason,
      evidenceUrl,
    }: {
      matchId: string;
      reportedBy: string;
      reason: string;
      evidenceUrl?: string;
    }) => {
      // Mark match as disputed
      await supabase
        .from("tournament_matches")
        .update({ is_disputed: true, status: "disputed" })
        .eq("id", matchId);

      const { data, error } = await supabase
        .from("tournament_disputes")
        .insert({
          match_id: matchId,
          reported_by: reportedBy,
          dispute_reason: reason,
          evidence_url: evidenceUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Contestação enviada!",
        description: "Um moderador irá analisar sua contestação.",
      });
      queryClient.invalidateQueries({ queryKey: ["tournament"] });
      queryClient.invalidateQueries({ queryKey: ["tournament-disputes"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao contestar",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useResolveDispute = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      disputeId,
      matchId,
      winnerId,
      resolvedBy,
      notes,
      shouldAnnul = false,
    }: {
      disputeId: string;
      matchId: string;
      winnerId?: string;
      resolvedBy: string;
      notes: string;
      shouldAnnul?: boolean;
    }) => {
      // Update dispute
      await supabase
        .from("tournament_disputes")
        .update({
          status: "resolved",
          resolved_by: resolvedBy,
          resolved_at: new Date().toISOString(),
          resolution_notes: notes,
        })
        .eq("id", disputeId);

      // Update match
      if (shouldAnnul) {
        await supabase
          .from("tournament_matches")
          .update({
            status: "annulled",
            is_disputed: false,
          })
          .eq("id", matchId);
      } else if (winnerId) {
        const { data } = await supabase
          .from("tournament_matches")
          .update({
            winner_id: winnerId,
            status: "completed",
            is_disputed: false,
            played_at: new Date().toISOString(),
          })
          .eq("id", matchId)
          .select()
          .single();

        // Advance winner
        if (data) {
          await supabase.rpc("advance_tournament_winner", {
            p_match_id: matchId,
            p_winner_id: winnerId,
          });
        }
      }

      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Contestação resolvida!",
        description: "A decisão foi aplicada.",
      });
      queryClient.invalidateQueries({ queryKey: ["tournament"] });
      queryClient.invalidateQueries({ queryKey: ["tournament-disputes"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao resolver",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

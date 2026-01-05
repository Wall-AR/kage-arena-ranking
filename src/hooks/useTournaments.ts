import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
          match:tournament_matches(
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentData: Partial<Tournament>) => {
      const { data, error } = await supabase
        .from("tournaments")
        .insert([tournamentData as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Torneio criado!",
        description: "O torneio foi criado com sucesso.",
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tournamentId, playerId }: { tournamentId: string; playerId: string }) => {
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
    }: {
      matchId: string;
      winnerId: string;
      player1Score: number;
      player2Score: number;
      evidenceUrl?: string;
      notes?: string;
      reportedBy?: string;
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
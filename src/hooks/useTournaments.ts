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
  prize_description: string | null;
  image_url: string | null;
  min_rank: string | null;
  max_rank: string | null;
  require_top_character: boolean;
  required_character: string | null;
  rules_text: string | null;
  bracket_data: any;
  current_round: number;
  created_by: string;
  winner_id: string | null;
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
              player:players(id, name, avatar_url)
            ),
            player2:tournament_participants!tournament_matches_player2_id_fkey(
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
    }: {
      matchId: string;
      winnerId: string;
      player1Score: number;
      player2Score: number;
      evidenceUrl?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("tournament_matches")
        .update({
          winner_id: winnerId,
          player1_score: player1Score,
          player2_score: player2Score,
          status: "completed",
          played_at: new Date().toISOString(),
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
        description: "O resultado da partida foi registrado.",
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
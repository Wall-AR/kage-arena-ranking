import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Trophy, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface TournamentManagementProps {
  tournamentId: string;
  status: string;
  participants: any[];
  maxParticipants: number;
}

export function TournamentManagement({ 
  tournamentId, 
  status, 
  participants,
  maxParticipants 
}: TournamentManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);

  const generateBracket = async () => {
    setIsGenerating(true);
    try {
      // Pegar apenas participantes que fizeram check-in
      const checkedInParticipants = participants.filter(p => p.checked_in);
      
      if (checkedInParticipants.length < 2) {
        toast({
          title: "Erro",
          description: "É necessário pelo menos 2 participantes com check-in para iniciar o torneio.",
          variant: "destructive",
        });
        return;
      }

      // Calcular número de participantes para a próxima potência de 2
      const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(checkedInParticipants.length)));
      
      // Embaralhar e atribuir seeds
      const shuffled = [...checkedInParticipants].sort(() => Math.random() - 0.5);
      for (let i = 0; i < shuffled.length; i++) {
        await supabase
          .from("tournament_participants")
          .update({ seed: i + 1 })
          .eq("id", shuffled[i].id);
      }

      // Criar primeira rodada de partidas
      const matches = [];
      const totalMatches = nextPowerOf2 / 2;
      
      for (let i = 0; i < totalMatches; i++) {
        const player1 = shuffled[i * 2] || null;
        const player2 = shuffled[i * 2 + 1] || null;

        // Se um jogador está faltando, é um BYE
        const matchStatus = !player1 || !player2 ? 'bye' : 'pending';
        const winnerId = !player1 ? player2?.id : !player2 ? player1?.id : null;

        matches.push({
          tournament_id: tournamentId,
          round: 1,
          match_number: i + 1,
          player1_id: player1?.id || null,
          player2_id: player2?.id || null,
          status: matchStatus,
          winner_id: winnerId,
          bracket_position: i + 1,
        });
      }

      // Inserir partidas no banco
      const { error: matchError } = await supabase
        .from("tournament_matches")
        .insert(matches);

      if (matchError) throw matchError;

      // Atualizar status do torneio
      const { error: updateError } = await supabase
        .from("tournaments")
        .update({ 
          status: 'in_progress',
          current_round: 1 
        })
        .eq("id", tournamentId);

      if (updateError) throw updateError;

      toast({
        title: "Chaveamento gerado!",
        description: "O torneio foi iniciado com sucesso.",
      });

      queryClient.invalidateQueries({ queryKey: ["tournament", tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    } catch (error: any) {
      toast({
        title: "Erro ao gerar chaveamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const distributeRewards = async () => {
    setIsDistributing(true);
    try {
      // Chamar função do banco para distribuir recompensas
      const { error } = await supabase.rpc('distribute_tournament_rewards', {
        p_tournament_id: tournamentId
      });

      if (error) throw error;

      // Atualizar status para completed
      await supabase
        .from("tournaments")
        .update({ status: 'completed' })
        .eq("id", tournamentId);

      toast({
        title: "Recompensas distribuídas!",
        description: "Todas as premiações foram entregues aos participantes.",
      });

      queryClient.invalidateQueries({ queryKey: ["tournament", tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    } catch (error: any) {
      toast({
        title: "Erro ao distribuir recompensas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDistributing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Gerenciamento do Torneio
        </CardTitle>
        <CardDescription>
          Controle o progresso e estado do torneio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="font-medium">Status atual</p>
            <p className="text-sm text-muted-foreground">
              {participants.filter(p => p.checked_in).length} participantes confirmados
            </p>
          </div>
          <Badge>{status}</Badge>
        </div>

        {status === "check_in" && (
          <Button 
            onClick={generateBracket} 
            disabled={isGenerating}
            className="w-full"
          >
            <Play className="mr-2 h-4 w-4" />
            {isGenerating ? "Gerando..." : "Iniciar Torneio e Gerar Chaveamento"}
          </Button>
        )}

        {status === "in_progress" && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Aguarde o fim de todas as partidas para finalizar o torneio
            </p>
            <Button 
              onClick={distributeRewards} 
              disabled={isDistributing}
              variant="outline"
              className="w-full"
            >
              <Award className="mr-2 h-4 w-4" />
              {isDistributing ? "Distribuindo..." : "Finalizar e Distribuir Recompensas"}
            </Button>
          </div>
        )}

        {status === "completed" && (
          <div className="text-center py-4">
            <Trophy className="h-12 w-12 mx-auto mb-2 text-primary" />
            <p className="font-medium">Torneio Finalizado</p>
            <p className="text-sm text-muted-foreground">
              Todas as recompensas foram distribuídas
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
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
      const checkedInCount = participants.filter(p => p.checked_in).length;
      if (checkedInCount < 2) {
        toast({
          title: "Erro",
          description: "É necessário pelo menos 2 participantes com check-in para iniciar o torneio.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.rpc("generate_tournament_bracket", {
        tournament_uuid: tournamentId,
      });
      if (error) throw error;

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
      const { error } = await supabase.rpc('finalize_tournament', {
        tournament_uuid: tournamentId
      });
      if (error) throw error;


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
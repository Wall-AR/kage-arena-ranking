import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface TournamentsHistoryProps {
  playerId: string;
}

export function TournamentsHistory({ playerId }: TournamentsHistoryProps) {
  const navigate = useNavigate();

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ["player-tournaments", playerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournament_participants")
        .select(`
          *,
          tournament:tournaments(
            id,
            name,
            status,
            tournament_start,
            image_url
          )
        `)
        .eq("player_id", playerId)
        .order("registered_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <p className="text-muted-foreground">Carregando histórico...</p>;
  }

  if (!tournaments || tournaments.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">Nenhuma participação em torneios</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tournaments.map((participation: any) => {
        const tournament = participation.tournament;
        
        return (
          <Card 
            key={participation.id} 
            className="cursor-pointer hover:shadow-ninja transition-all"
            onClick={() => navigate(`/tournaments/${tournament.id}`)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{tournament.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(tournament.tournament_start), "PPP", { locale: ptBR })}
                  </CardDescription>
                </div>
                <Badge variant={tournament.status === "completed" ? "secondary" : "default"}>
                  {tournament.status === "registration" && "Inscrições"}
                  {tournament.status === "check_in" && "Check-in"}
                  {tournament.status === "in_progress" && "Em Andamento"}
                  {tournament.status === "completed" && "Finalizado"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status do check-in:</span>
                <Badge variant={participation.checked_in ? "outline" : "secondary"} className={participation.checked_in ? "border-green-500 text-green-500" : ""}>
                  {participation.checked_in ? "✓ Confirmado" : "Pendente"}
                </Badge>
              </div>
              {participation.final_position && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Colocação final:</span>
                  <Badge variant="default" className="bg-gradient-kage">
                    <Trophy className="h-3 w-3 mr-1" />
                    {participation.final_position}º Lugar
                  </Badge>
                </div>
              )}
              {participation.seed && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Seed:</span>
                  <span className="font-medium">#{participation.seed}</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
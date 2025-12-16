import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Trophy, Users } from "lucide-react";
import { Tournament } from "@/hooks/useTournaments";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface TournamentCardProps {
  tournament: Tournament;
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "registration":
        return "bg-ninja-jounin";
      case "check_in":
        return "bg-accent";
      case "in_progress":
        return "bg-primary";
      case "completed":
        return "bg-muted";
      default:
        return "bg-secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "registration":
        return "Inscrições Abertas";
      case "check_in":
        return "Check-in";
      case "in_progress":
        return "Em Andamento";
      case "completed":
        return "Finalizado";
      default:
        return status;
    }
  };

  const getTournamentTypeText = (type: string) => {
    switch (type) {
      case "single_elimination":
        return "Eliminação Simples";
      case "double_elimination":
        return "Eliminação Dupla";
      case "round_robin":
        return "Round Robin";
      default:
        return type;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-ninja transition-all cursor-pointer" onClick={() => navigate(`/tournaments/${tournament.id}`)}>
      {tournament.image_url && (
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={tournament.image_url} 
            alt={tournament.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{tournament.name}</CardTitle>
            <CardDescription className="mt-2">{tournament.description}</CardDescription>
          </div>
          <Badge className={getStatusColor(tournament.status)}>
            {getStatusText(tournament.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Trophy className="h-4 w-4" />
          <span>{getTournamentTypeText(tournament.tournament_type)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Máximo: {tournament.max_participants} participantes</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(tournament.tournament_start), "PPP 'às' HH:mm", { locale: ptBR })}</span>
        </div>
        {tournament.rules_text && (
          <div className="mt-3 p-3 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium text-primary">📜 Regras definidas</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/tournaments/${tournament.id}`);
          }}
        >
          Ver Detalhes
        </Button>
      </CardFooter>
    </Card>
  );
}
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Sword, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MatchDetailDialog } from "./MatchDetailDialog";

interface MatchHistoryProps {
  playerId: string;
}

export const MatchHistory = ({ playerId }: MatchHistoryProps) => {
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { data: matches, isLoading } = useQuery({
    queryKey: ['match-history', playerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          winner:players!matches_winner_id_fkey(id, name, avatar_url, rank_level),
          loser:players!matches_loser_id_fkey(id, name, avatar_url, rank_level),
          challenge:challenges!matches_challenge_id_fkey(match_type)
        `)
        .or(`winner_id.eq.${playerId},loser_id.eq.${playerId}`)
        .order('played_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!playerId
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-muted/20 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Sword className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Nenhuma partida encontrada
            </h3>
            <p className="text-sm text-muted-foreground">
              As partidas disputadas aparecerão aqui
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleMatchClick = (match: any) => {
    setSelectedMatch(match);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {matches.map((match) => {
          const isWinner = match.winner_id === playerId;
          const opponent = isWinner ? match.loser : match.winner;
          const pointsChange = isWinner ? match.winner_points_change : match.loser_points_change;

          return (
            <Card 
              key={match.id} 
              className="overflow-hidden cursor-pointer hover:bg-accent/5 transition-colors"
              onClick={() => handleMatchClick(match)}
            >
              <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isWinner ? 'bg-ninja-chunin/20 text-ninja-chunin' : 'bg-ninja-anbu/20 text-ninja-anbu'
                  }`}>
                    <Trophy className="w-6 h-6" />
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant={isWinner ? "default" : "destructive"}>
                        {isWinner ? "Vitória" : "Derrota"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {match.challenge?.match_type || "FT5"}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium">vs</span>
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={opponent?.avatar_url} alt={opponent?.name} />
                        <AvatarFallback className="text-xs">
                          {opponent?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{opponent?.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {opponent?.rank_level}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-1">
                    {pointsChange && pointsChange !== 0 && (
                      <>
                        {pointsChange > 0 ? (
                          <TrendingUp className="w-4 h-4 text-ninja-chunin" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-ninja-anbu" />
                        )}
                        <span className={`font-semibold ${
                          pointsChange > 0 ? 'text-ninja-chunin' : 'text-ninja-anbu'
                        }`}>
                          {pointsChange > 0 ? '+' : ''}{pointsChange}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    {format(new Date(match.played_at), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>

    <MatchDetailDialog
      match={selectedMatch}
      playerId={playerId}
      open={dialogOpen}
      onOpenChange={setDialogOpen}
    />
    </>
  );
};
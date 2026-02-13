import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, User, Trophy, Flame } from "lucide-react";

const ModMatchesTab = () => {
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['mod-matches-recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          winner:players!matches_winner_id_fkey(name, avatar_url, rank),
          loser:players!matches_loser_id_fkey(name, avatar_url, rank)
        `)
        .order('played_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Últimas 30 Partidas</h3>
      {matches.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhuma partida registrada.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {matches.map((match: any) => (
            <Card key={match.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={match.winner?.avatar_url} />
                        <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-sm flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-ninja-kage" />
                          {match.winner?.name}
                        </div>
                        <div className="text-xs text-muted-foreground">{match.winner?.rank}</div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">vs</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={match.loser?.avatar_url} />
                        <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm">{match.loser?.name}</div>
                        <div className="text-xs text-muted-foreground">{match.loser?.rank}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      {match.winner_points_change && (
                        <Badge variant="secondary" className="text-xs">
                          <Flame className="w-3 h-3 mr-1" />
                          +{match.winner_points_change}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(match.played_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModMatchesTab;

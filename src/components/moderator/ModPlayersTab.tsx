import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, User, Search, Shield } from "lucide-react";
import { useState } from "react";

const ModPlayersTab = () => {
  const [search, setSearch] = useState("");

  const { data: players = [], isLoading } = useQuery({
    queryKey: ['mod-players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('id, name, avatar_url, rank, rank_level, current_points, wins, losses, is_ranked, is_moderator, is_admin, kage_title, immunity_until')
        .order('current_points', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    }
  });

  const filtered = players.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar jogador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-2">
        {filtered.map((player) => {
          const isImmune = player.immunity_until && new Date(player.immunity_until) > new Date();
          return (
            <Card key={player.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={player.avatar_url || undefined} />
                      <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-1">
                        {player.name}
                        {player.is_admin && <Shield className="w-3 h-3 text-destructive" />}
                        {player.is_moderator && !player.is_admin && <Shield className="w-3 h-3 text-ninja-sannin" />}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {player.rank_level || player.rank} • {player.current_points} pts • {player.wins || 0}V-{player.losses || 0}D
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {player.kage_title && <Badge className="bg-ninja-kage/20 text-ninja-kage text-xs">{player.kage_title}</Badge>}
                    {isImmune && <Badge variant="secondary" className="text-xs">🛡️ Imune</Badge>}
                    {!player.is_ranked && <Badge variant="outline" className="text-xs">Unranked</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ModPlayersTab;

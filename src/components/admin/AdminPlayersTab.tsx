import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, Crown, User, Loader2, Search, Ban, CheckCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUpdatePlayerRole } from "@/hooks/usePlayers";

interface Player {
  id: string;
  name: string;
  avatar_url: string | null;
  rank: string;
  is_ranked: boolean;
  is_moderator: boolean;
  is_admin: boolean;
  role: string;
  current_points: number;
  user_id: string | null;
}

export function AdminPlayersTab() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const updatePlayerRoleMutation = useUpdatePlayerRole();

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, name, avatar_url, rank, is_ranked, is_moderator, is_admin, role, current_points, user_id')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast({
        title: "Erro ao carregar jogadores",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePlayerRole = (playerId: string, role: 'admin' | 'moderator' | 'player') => {
    setActionLoading(playerId);
    updatePlayerRoleMutation.mutate(
      { playerId, role },
      {
        onSettled: () => {
          setActionLoading(null);
          fetchPlayers();
        }
      }
    );
  };

  const getRoleIcon = (isAdmin: boolean, isModerator: boolean) => {
    if (isAdmin) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (isModerator) return <Shield className="w-4 h-4 text-blue-500" />;
    return <User className="w-4 h-4 text-muted-foreground" />;
  };

  const getRoleBadge = (isAdmin: boolean, isModerator: boolean) => {
    if (isAdmin) return <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">Admin</Badge>;
    if (isModerator) return <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/30">Avaliador</Badge>;
    return <Badge variant="outline">Jogador</Badge>;
  };

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5" />
          Gerenciar Jogadores ({players.length})
        </CardTitle>
        <CardDescription>
          Defina os cargos dos jogadores: Admin, Avaliador ou Jogador
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar jogador por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p>Carregando jogadores...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jogador</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={player.avatar_url || ""} />
                          <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(player.is_admin, player.is_moderator)}
                          <span className="font-medium">{player.name}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{player.rank}</TableCell>
                    <TableCell>{player.current_points}</TableCell>
                    <TableCell>
                      {player.is_ranked ? (
                        <Badge variant="outline" className="text-green-600 border-green-600/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Rankeado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Não rankeado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{getRoleBadge(player.is_admin, player.is_moderator)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!player.is_admin && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updatePlayerRole(player.id, 'admin')}
                            disabled={actionLoading === player.id}
                            className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                          >
                            {actionLoading === player.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Crown className="w-3 h-3 mr-1" />
                                Admin
                              </>
                            )}
                          </Button>
                        )}
                        {!player.is_moderator && !player.is_admin && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updatePlayerRole(player.id, 'moderator')}
                            disabled={actionLoading === player.id || !player.is_ranked}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            {actionLoading === player.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Shield className="w-3 h-3 mr-1" />
                                Avaliador
                              </>
                            )}
                          </Button>
                        )}
                        {(player.is_moderator || player.is_admin) && player.is_admin === false && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updatePlayerRole(player.id, 'player')}
                            disabled={actionLoading === player.id}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            {actionLoading === player.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Ban className="w-3 h-3 mr-1" />
                                Remover
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

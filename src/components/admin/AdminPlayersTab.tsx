import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, Crown, User, Loader2, Search, Ban, CheckCircle, Edit, RotateCcw } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUpdatePlayerRole } from "@/hooks/usePlayers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  wins: number;
  losses: number;
  immunity_until: string | null;
}

export function AdminPlayersTab() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [editPoints, setEditPoints] = useState("");
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
        .select('id, name, avatar_url, rank, is_ranked, is_moderator, is_admin, role, current_points, user_id, wins, losses, immunity_until')
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

  const openEditDialog = (player: Player) => {
    setSelectedPlayer(player);
    setEditPoints(String(player.current_points || 0));
    setEditDialogOpen(true);
  };

  const savePlayerPoints = async () => {
    if (!selectedPlayer) return;
    
    setActionLoading(selectedPlayer.id);
    try {
      const newPoints = parseInt(editPoints);
      if (isNaN(newPoints) || newPoints < 0) {
        toast({ title: "Pontos inválidos", variant: "destructive" });
        return;
      }

      const { error } = await supabase
        .from('players')
        .update({ current_points: newPoints, points: newPoints })
        .eq('id', selectedPlayer.id);

      if (error) throw error;

      toast({ title: "Pontos atualizados!" });
      setEditDialogOpen(false);
      fetchPlayers();
    } catch (error) {
      console.error('Error updating points:', error);
      toast({
        title: "Erro ao atualizar pontos",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const resetPlayerStats = async (playerId: string) => {
    setActionLoading(playerId);
    try {
      const { error } = await supabase
        .from('players')
        .update({ 
          wins: 0, 
          losses: 0, 
          win_streak: 0,
          current_points: 0,
          points: 0,
          rank: 'Unranked',
          rank_level: 'Unranked',
          is_ranked: false
        })
        .eq('id', playerId);

      if (error) throw error;

      toast({ title: "Estatísticas resetadas!" });
      fetchPlayers();
    } catch (error) {
      console.error('Error resetting stats:', error);
      toast({
        title: "Erro ao resetar estatísticas",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const toggleImmunity = async (playerId: string, currentImmunity: string | null) => {
    setActionLoading(playerId);
    try {
      const hasImmunity = currentImmunity && new Date(currentImmunity) > new Date();
      
      const { error } = await supabase
        .from('players')
        .update({ 
          immunity_until: hasImmunity ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', playerId);

      if (error) throw error;

      toast({ 
        title: hasImmunity ? "Imunidade removida!" : "Imunidade de 7 dias aplicada!"
      });
      fetchPlayers();
    } catch (error) {
      console.error('Error toggling immunity:', error);
      toast({
        title: "Erro ao alterar imunidade",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
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

  const hasImmunity = (immunity: string | null) => {
    return immunity && new Date(immunity) > new Date();
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
          Gerencie cargos, pontos, estatísticas e imunidade dos jogadores
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
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jogador</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>W/L</TableHead>
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
                    <TableCell>
                      <span className="font-mono">{player.current_points}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-green-600">{player.wins || 0}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-red-600">{player.losses || 0}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {player.is_ranked ? (
                          <Badge variant="outline" className="text-green-600 border-green-600/30 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Rankeado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-xs">
                            Não rankeado
                          </Badge>
                        )}
                        {hasImmunity(player.immunity_until) && (
                          <Badge variant="outline" className="text-purple-600 border-purple-600/30 text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Imune
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(player.is_admin, player.is_moderator)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 flex-wrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(player)}
                          disabled={actionLoading === player.id}
                          className="h-8 w-8 p-0"
                          title="Editar pontos"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-orange-600"
                              title="Resetar estatísticas"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Resetar estatísticas?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Isso irá zerar vitórias, derrotas, pontos e remover o rank de {player.name}. Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => resetPlayerStats(player.id)}>
                                Resetar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleImmunity(player.id, player.immunity_until)}
                          disabled={actionLoading === player.id}
                          className={`h-8 w-8 p-0 ${hasImmunity(player.immunity_until) ? 'text-purple-600' : ''}`}
                          title={hasImmunity(player.immunity_until) ? "Remover imunidade" : "Dar imunidade"}
                        >
                          <Shield className="w-3 h-3" />
                        </Button>

                        {!player.is_admin && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updatePlayerRole(player.id, 'admin')}
                            disabled={actionLoading === player.id}
                            className="h-8 px-2 text-yellow-600"
                            title="Promover a Admin"
                          >
                            <Crown className="w-3 h-3" />
                          </Button>
                        )}
                        
                        {!player.is_moderator && !player.is_admin && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updatePlayerRole(player.id, 'moderator')}
                            disabled={actionLoading === player.id || !player.is_ranked}
                            className="h-8 px-2 text-blue-600"
                            title="Promover a Avaliador"
                          >
                            <Shield className="w-3 h-3" />
                          </Button>
                        )}
                        
                        {(player.is_moderator || player.is_admin) && !player.is_admin && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updatePlayerRole(player.id, 'player')}
                            disabled={actionLoading === player.id}
                            className="h-8 px-2 text-destructive"
                            title="Remover cargo"
                          >
                            <Ban className="w-3 h-3" />
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

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Pontos</DialogTitle>
              <DialogDescription>
                Alterar pontos de {selectedPlayer?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Pontos atuais</Label>
                <Input
                  type="number"
                  value={editPoints}
                  onChange={(e) => setEditPoints(e.target.value)}
                  min="0"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
              <Button onClick={savePlayerPoints} disabled={actionLoading === selectedPlayer?.id}>
                {actionLoading === selectedPlayer?.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Salvar'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

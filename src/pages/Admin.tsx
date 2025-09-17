import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { useUpdatePlayerRole } from "@/hooks/usePlayers";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, Crown, User, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { data: currentPlayer, isLoading: playerLoading } = usePlayerProfile(user?.id);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Admin Debug - currentPlayer:', currentPlayer);
    console.log('Admin Debug - user:', user);
    console.log('Admin Debug - playerLoading:', playerLoading);
    console.log('Admin Debug - currentPlayer?.is_admin:', currentPlayer?.is_admin);
    
    if (currentPlayer?.is_admin) {
      fetchPlayers();
    }
  }, [currentPlayer]);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, name, avatar_url, rank, is_ranked, is_moderator, is_admin, role, current_points')
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

  const updatePlayerRoleMutation = useUpdatePlayerRole();

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

  const getRoleIcon = (role: string, isAdmin: boolean, isModerator: boolean) => {
    if (isAdmin) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (isModerator) return <Shield className="w-4 h-4 text-blue-500" />;
    return <User className="w-4 h-4 text-gray-500" />;
  };

  const getRoleBadge = (role: string, isAdmin: boolean, isModerator: boolean) => {
    if (isAdmin) return <Badge className="bg-yellow-500/20 text-yellow-700">Admin</Badge>;
    if (isModerator) return <Badge className="bg-blue-500/20 text-blue-700">Avaliador</Badge>;
    return <Badge variant="outline">Jogador</Badge>;
  };

  // Loading states
  if (authLoading || playerLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Access control
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
        <p>Você precisa estar logado para acessar esta página.</p>
        <p className="text-sm text-muted-foreground">User ID: {user?.id || 'undefined'}</p>
      </div>
    );
  }

  if (!currentPlayer?.is_admin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
        <p>Apenas administradores podem acessar esta página.</p>
        <p className="text-sm text-muted-foreground">User ID: {user?.id}</p>
        <p className="text-sm text-muted-foreground">Admin: {currentPlayer?.is_admin ? 'true' : 'false'}</p>
        <p className="text-sm text-muted-foreground">CurrentPlayer: {JSON.stringify(currentPlayer)}</p>
        <p className="text-sm text-muted-foreground">PlayerLoading: {playerLoading ? 'true' : 'false'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
        <p className="text-muted-foreground">
          Gerencie cargos e permissões dos jogadores
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Gerenciar Jogadores
          </CardTitle>
          <CardDescription>
            Defina os cargos dos jogadores: Admin, Avaliador ou Jogador
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p>Carregando jogadores...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {players.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={player.avatar_url || ""} />
                      <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(player.role, player.is_admin, player.is_moderator)}
                        <h3 className="font-semibold">{player.name}</h3>
                        {getRoleBadge(player.role, player.is_admin, player.is_moderator)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {player.rank} • {player.current_points} pontos
                        {player.is_ranked && " • Rankeado"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
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
                    {!player.is_moderator && (
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
                    {(player.is_moderator || player.is_admin) && !player.is_admin && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updatePlayerRole(player.id, 'player')}
                        disabled={actionLoading === player.id}
                        className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                      >
                        {actionLoading === player.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <User className="w-3 h-3 mr-1" />
                            Remover
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
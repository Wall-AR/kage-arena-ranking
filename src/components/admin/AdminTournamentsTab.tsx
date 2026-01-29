import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Loader2, Search, Play, Pause, Trash2, Eye, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import { useNavigate } from "react-router-dom";

interface Tournament {
  id: string;
  name: string;
  status: string;
  tournament_start: string;
  max_participants: number;
  participant_count: number;
}

export function AdminTournamentsTab() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const { data: tournamentsData, error } = await supabase
        .from('tournaments')
        .select(`
          id,
          name,
          status,
          tournament_start,
          max_participants,
          tournament_participants(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = tournamentsData?.map(t => ({
        ...t,
        participant_count: (t.tournament_participants as any)?.[0]?.count || 0
      })) || [];

      setTournaments(formatted);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast({
        title: "Erro ao carregar torneios",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTournamentStatus = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('tournaments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status atualizado!",
        description: `Torneio agora está ${status === 'active' ? 'ativo' : status === 'completed' ? 'finalizado' : status}.`,
      });

      fetchTournaments();
    } catch (error) {
      console.error('Error updating tournament:', error);
      toast({
        title: "Erro ao atualizar torneio",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteTournament = async (id: string) => {
    setActionLoading(id);
    try {
      // First delete related data
      await supabase.from('tournament_rewards').delete().eq('tournament_id', id);
      await supabase.from('tournament_matches').delete().eq('tournament_id', id);
      await supabase.from('tournament_participants').delete().eq('tournament_id', id);
      
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Torneio excluído!",
        description: "O torneio foi removido permanentemente.",
      });

      fetchTournaments();
    } catch (error) {
      console.error('Error deleting tournament:', error);
      toast({
        title: "Erro ao excluir torneio",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'registration':
        return <Badge className="bg-blue-500/20 text-blue-700">Inscrições</Badge>;
      case 'check_in':
        return <Badge className="bg-yellow-500/20 text-yellow-700">Check-in</Badge>;
      case 'active':
        return <Badge className="bg-green-500/20 text-green-700">Em andamento</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500/20 text-gray-700">Finalizado</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-700">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredTournaments = tournaments.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Gerenciar Torneios ({tournaments.length})
        </CardTitle>
        <CardDescription>
          Controle o status, visualize participantes e gerencie torneios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar torneio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p>Carregando torneios...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Torneio</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Participantes</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTournaments.map((tournament) => (
                  <TableRow key={tournament.id}>
                    <TableCell className="font-medium">{tournament.name}</TableCell>
                    <TableCell>{getStatusBadge(tournament.status)}</TableCell>
                    <TableCell>
                      {format(new Date(tournament.tournament_start), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {tournament.participant_count}/{tournament.max_participants}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/tournaments/${tournament.id}`)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Ver
                        </Button>
                        
                        {tournament.status === 'registration' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTournamentStatus(tournament.id, 'check_in')}
                            disabled={actionLoading === tournament.id}
                            className="text-yellow-600"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Check-in
                          </Button>
                        )}

                        {tournament.status === 'check_in' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTournamentStatus(tournament.id, 'active')}
                            disabled={actionLoading === tournament.id}
                            className="text-green-600"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Iniciar
                          </Button>
                        )}

                        {tournament.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTournamentStatus(tournament.id, 'completed')}
                            disabled={actionLoading === tournament.id}
                            className="text-blue-600"
                          >
                            <Pause className="w-3 h-3 mr-1" />
                            Finalizar
                          </Button>
                        )}

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir torneio?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação é irreversível. O torneio "{tournament.name}" e todos os dados
                                relacionados (participantes, partidas, recompensas) serão excluídos permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteTournament(tournament.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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

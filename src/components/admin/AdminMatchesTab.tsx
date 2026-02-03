import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Swords, Loader2, Search, Trash2, Eye, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Match {
  id: string;
  played_at: string;
  winner_points_change: number | null;
  loser_points_change: number | null;
  match_notes: string | null;
  evidence_url: string | null;
  winner: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  loser: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

export function AdminMatchesTab() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          played_at,
          winner_points_change,
          loser_points_change,
          match_notes,
          evidence_url,
          winner:players!matches_winner_id_fkey(id, name, avatar_url),
          loser:players!matches_loser_id_fkey(id, name, avatar_url)
        `)
        .order('played_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Erro ao carregar partidas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteMatch = async (id: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Partida excluída!" });
      fetchMatches();
    } catch (error) {
      console.error('Error deleting match:', error);
      toast({
        title: "Erro ao excluir partida",
        description: "Somente moderadores podem excluir partidas registradas.",
        variant: "destructive"
      });
    }
  };

  const filteredMatches = matches.filter(m =>
    m.winner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.loser?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Swords className="w-5 h-5" />
          Partidas Rankeadas ({matches.length})
        </CardTitle>
        <CardDescription>
          Visualize e gerencie todas as partidas registradas no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por jogador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p>Carregando partidas...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vencedor</TableHead>
                  <TableHead>Perdedor</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMatches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={match.winner?.avatar_url || ""} />
                          <AvatarFallback>{match.winner?.name?.charAt(0) || "?"}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-green-600">{match.winner?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={match.loser?.avatar_url || ""} />
                          <AvatarFallback>{match.loser?.name?.charAt(0) || "?"}</AvatarFallback>
                        </Avatar>
                        <span className="text-red-600">{match.loser?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="text-green-600">+{match.winner_points_change || 0}</span>
                        <span className="text-red-600">{match.loser_points_change || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(match.played_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedMatch(match)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir partida?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação remove a partida do histórico. Os pontos dos jogadores NÃO serão revertidos automaticamente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMatch(match.id)}
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

        <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes da Partida</DialogTitle>
              <DialogDescription>
                Informações completas sobre esta partida
              </DialogDescription>
            </DialogHeader>
            {selectedMatch && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedMatch.winner?.avatar_url || ""} />
                      <AvatarFallback>{selectedMatch.winner?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedMatch.winner?.name}</p>
                      <Badge className="bg-green-500/20 text-green-700">Vencedor</Badge>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-green-600">+{selectedMatch.winner_points_change || 0}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedMatch.loser?.avatar_url || ""} />
                      <AvatarFallback>{selectedMatch.loser?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedMatch.loser?.name}</p>
                      <Badge className="bg-red-500/20 text-red-700">Perdedor</Badge>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-red-600">{selectedMatch.loser_points_change || 0}</span>
                </div>

                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data:</span>
                    <span>{format(new Date(selectedMatch.played_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                  </div>
                  {selectedMatch.match_notes && (
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Observações:</span>
                      <span className="p-2 bg-muted rounded">{selectedMatch.match_notes}</span>
                    </div>
                  )}
                  {selectedMatch.evidence_url && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Evidência:</span>
                      <a href={selectedMatch.evidence_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Ver evidência
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

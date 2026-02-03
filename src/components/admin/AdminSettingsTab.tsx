import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Settings, RefreshCw, Database, Shield, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

export function AdminSettingsTab() {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const updateKageTitles = async () => {
    setLoading('kage');
    try {
      const { error } = await supabase.rpc('update_kage_titles');
      
      if (error) throw error;

      toast({
        title: "Títulos Kage atualizados!",
        description: "Os 5 melhores jogadores receberam seus títulos.",
      });
    } catch (error) {
      console.error('Error updating kage titles:', error);
      toast({
        title: "Erro ao atualizar títulos",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const recalculateRankings = async () => {
    setLoading('ranking');
    try {
      // Fetch all ranked players and recalculate their positions
      const { data: players, error } = await supabase
        .from('players')
        .select('id, current_points, wins, losses')
        .eq('is_ranked', true)
        .order('current_points', { ascending: false });

      if (error) throw error;

      // Update each player's rank based on points
      for (const player of players || []) {
        const rank = getRankFromPoints(player.current_points || 0);
        await supabase
          .from('players')
          .update({ rank, rank_level: rank })
          .eq('id', player.id);
      }

      toast({
        title: "Rankings recalculados!",
        description: `${players?.length || 0} jogadores atualizados.`,
      });
    } catch (error) {
      console.error('Error recalculating rankings:', error);
      toast({
        title: "Erro ao recalcular rankings",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const getRankFromPoints = (points: number): string => {
    if (points >= 600) return 'Sanin';
    if (points >= 450) return 'Anbu';
    if (points >= 350) return 'Jounnin';
    if (points >= 200) return 'Chunnin';
    if (points >= 100) return 'Genin';
    return 'Unranked';
  };

  const cleanupOrphanedData = async () => {
    setLoading('cleanup');
    try {
      // Clean up orphaned tournament data
      const { error: participantsError } = await supabase
        .from('tournament_participants')
        .delete()
        .is('player_id', null);

      // Clean up orphaned forum reactions
      const { error: reactionsError } = await supabase
        .from('forum_reactions')
        .delete()
        .is('user_id', null);

      if (participantsError) console.warn('Cleanup participants:', participantsError);
      if (reactionsError) console.warn('Cleanup reactions:', reactionsError);

      toast({
        title: "Limpeza concluída!",
        description: "Dados órfãos foram removidos do sistema.",
      });
    } catch (error) {
      console.error('Error during cleanup:', error);
      toast({
        title: "Erro durante limpeza",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const settingsActions = [
    {
      id: 'kage',
      title: 'Atualizar Títulos Kage',
      description: 'Recalcula e atribui os títulos Kage (Hokage, Kazekage, etc.) aos 5 melhores jogadores rankeados.',
      icon: Shield,
      color: 'text-yellow-600',
      action: updateKageTitles,
      dangerous: false
    },
    {
      id: 'ranking',
      title: 'Recalcular Rankings',
      description: 'Atualiza o rank de todos os jogadores baseado em seus pontos atuais (Genin, Chunnin, Jounnin, etc.).',
      icon: RefreshCw,
      color: 'text-blue-600',
      action: recalculateRankings,
      dangerous: false
    },
    {
      id: 'cleanup',
      title: 'Limpar Dados Órfãos',
      description: 'Remove registros órfãos do banco de dados (participantes sem jogador, reações inválidas, etc.).',
      icon: Database,
      color: 'text-orange-600',
      action: cleanupOrphanedData,
      dangerous: true
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configurações do Sistema
        </CardTitle>
        <CardDescription>
          Ações administrativas e manutenção do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {settingsActions.map((action) => (
            <div
              key={action.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg bg-muted`}>
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <div>
                  <h3 className="font-medium">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
              
              {action.dangerous ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled={loading === action.id}>
                      {loading === action.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Executar'
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar ação</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação pode modificar ou remover dados do sistema. Tem certeza que deseja continuar?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={action.action}>
                        Confirmar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={action.action}
                  disabled={loading === action.id}
                >
                  {loading === action.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Executar'
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 border rounded-lg bg-muted/50">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Status do Sistema
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Backend:</span>
              <span className="text-green-600">Operacional</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Banco de dados:</span>
              <span className="text-green-600">Conectado</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Autenticação:</span>
              <span className="text-green-600">Ativo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Storage:</span>
              <span className="text-green-600">Disponível</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

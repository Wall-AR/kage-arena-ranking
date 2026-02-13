import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, Calendar } from "lucide-react";

const ModTournamentsTab = () => {
  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['mod-tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*, tournament_participants(id)')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  const statusColors: Record<string, string> = {
    registration: "bg-ninja-jounin/20 text-ninja-jounin",
    ongoing: "bg-primary/20 text-primary",
    check_in: "bg-ninja-chunin/20 text-ninja-chunin",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive/20 text-destructive",
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Torneios Recentes</h3>
      {tournaments.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum torneio encontrado.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {tournaments.map((t: any) => (
            <Card key={t.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{t.tournament_participants?.length || 0}/{t.max_participants || 32}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(t.tournament_start).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <Badge className={statusColors[t.status] || "bg-muted text-muted-foreground"}>
                    {t.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModTournamentsTab;

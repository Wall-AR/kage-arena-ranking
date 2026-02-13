import { Card, CardContent } from "@/components/ui/card";
import { ClipboardCheck, Swords, Users, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ModOverviewCard = () => {
  const { data: pendingEvals = 0 } = useQuery({
    queryKey: ['mod-pending-evals'],
    queryFn: async () => {
      const { count } = await supabase
        .from('evaluations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      return count || 0;
    }
  });

  const { data: acceptedEvals = 0 } = useQuery({
    queryKey: ['mod-accepted-evals'],
    queryFn: async () => {
      const { count } = await supabase
        .from('evaluations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted');
      return count || 0;
    }
  });

  const { data: recentMatchesCount = 0 } = useQuery({
    queryKey: ['mod-recent-matches'],
    queryFn: async () => {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { count } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .gte('played_at', weekAgo);
      return count || 0;
    }
  });

  const { data: forumTopicsCount = 0 } = useQuery({
    queryKey: ['mod-forum-topics'],
    queryFn: async () => {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { count } = await supabase
        .from('forum_topics')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo);
      return count || 0;
    }
  });

  const stats = [
    { icon: ClipboardCheck, label: "Avaliações Pendentes", value: pendingEvals, color: "text-primary" },
    { icon: ClipboardCheck, label: "Em Andamento", value: acceptedEvals, color: "text-ninja-chunin" },
    { icon: Swords, label: "Partidas (7 dias)", value: recentMatchesCount, color: "text-ninja-jounin" },
    { icon: MessageSquare, label: "Tópicos (7 dias)", value: forumTopicsCount, color: "text-ninja-sannin" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i} className="bg-gradient-card border-border/50">
            <CardContent className="pt-4 pb-3 text-center">
              <Icon className={`w-6 h-6 mx-auto mb-1 ${stat.color}`} />
              <div className="font-ninja text-xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ModOverviewCard;

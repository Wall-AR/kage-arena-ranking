import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, ClipboardCheck, MessageSquare, Award, Ticket } from "lucide-react";

interface Stats {
  totalPlayers: number;
  rankedPlayers: number;
  totalTournaments: number;
  activeTournaments: number;
  pendingEvaluations: number;
  totalForumTopics: number;
  totalAchievements: number;
  totalBanners: number;
  activeCodes: number;
}

export function AdminStatsCard() {
  const [stats, setStats] = useState<Stats>({
    totalPlayers: 0,
    rankedPlayers: 0,
    totalTournaments: 0,
    activeTournaments: 0,
    pendingEvaluations: 0,
    totalForumTopics: 0,
    totalAchievements: 0,
    totalBanners: 0,
    activeCodes: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        playersRes,
        rankedRes,
        tournamentsRes,
        activeRes,
        evaluationsRes,
        topicsRes,
        achievementsRes,
        bannersRes,
        codesRes
      ] = await Promise.all([
        supabase.from('players').select('id', { count: 'exact', head: true }),
        supabase.from('players').select('id', { count: 'exact', head: true }).eq('is_ranked', true),
        supabase.from('tournaments').select('id', { count: 'exact', head: true }),
        supabase.from('tournaments').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('evaluations').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('forum_topics').select('id', { count: 'exact', head: true }),
        supabase.from('achievements').select('id', { count: 'exact', head: true }),
        supabase.from('banners').select('id', { count: 'exact', head: true }),
        supabase.from('redemption_codes').select('id', { count: 'exact', head: true }).eq('is_active', true)
      ]);

      setStats({
        totalPlayers: playersRes.count || 0,
        rankedPlayers: rankedRes.count || 0,
        totalTournaments: tournamentsRes.count || 0,
        activeTournaments: activeRes.count || 0,
        pendingEvaluations: evaluationsRes.count || 0,
        totalForumTopics: topicsRes.count || 0,
        totalAchievements: achievementsRes.count || 0,
        totalBanners: bannersRes.count || 0,
        activeCodes: codesRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statItems = [
    {
      label: "Jogadores",
      value: stats.totalPlayers,
      sublabel: `${stats.rankedPlayers} rankeados`,
      icon: Users,
      color: "text-blue-600"
    },
    {
      label: "Torneios",
      value: stats.totalTournaments,
      sublabel: `${stats.activeTournaments} ativos`,
      icon: Trophy,
      color: "text-orange-600"
    },
    {
      label: "Avaliações Pendentes",
      value: stats.pendingEvaluations,
      sublabel: "aguardando",
      icon: ClipboardCheck,
      color: "text-yellow-600"
    },
    {
      label: "Tópicos no Fórum",
      value: stats.totalForumTopics,
      sublabel: "criados",
      icon: MessageSquare,
      color: "text-green-600"
    },
    {
      label: "Conquistas",
      value: stats.totalAchievements,
      sublabel: `${stats.totalBanners} banners`,
      icon: Award,
      color: "text-purple-600"
    },
    {
      label: "Códigos Ativos",
      value: stats.activeCodes,
      sublabel: "disponíveis",
      icon: Ticket,
      color: "text-pink-600"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {statItems.map((item) => (
        <Card key={item.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <item.icon className={`w-4 h-4 ${item.color}`} />
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">{item.sublabel}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

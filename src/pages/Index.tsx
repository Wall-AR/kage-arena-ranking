import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/ui/navigation";
import RankingCard from "@/components/ui/ranking-card";
import heroImage from "@/assets/hero-naruto-sasuke.jpg";
import kageArenaLogo from "@/assets/kage-arena-logo.png";
import { Trophy, Swords, Users, Target, TrendingUp, Flame, User, Calendar, Shield, BookOpen, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTopPlayers } from "@/hooks/usePlayers";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import TopKagesSection from "@/components/home/TopKagesSection";
import QuickLinksSection from "@/components/home/QuickLinksSection";
import RecentUpdatesSection from "@/components/home/RecentUpdatesSection";
import FooterSection from "@/components/home/FooterSection";

const Index = () => {
  const { user, loading } = useAuth();
  const { data: topKages = [] } = useTopPlayers(3);

  const { data: allPlayers = [] } = useQuery({
    queryKey: ['all-players-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('id, wins, losses, last_match_date, is_ranked')
        .eq('is_ranked', true);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: tournaments = [] } = useQuery({
    queryKey: ['active-tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('id, status')
        .in('status', ['registration', 'ongoing']);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: recentMatches = [] } = useQuery({
    queryKey: ['recent-matches'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('matches')
        .select('id, played_at')
        .gte('played_at', today);
      if (error) throw error;
      return data || [];
    }
  });

  const totalWins = allPlayers.reduce((acc, p) => acc + (p.wins || 0), 0);
  const totalLosses = allPlayers.reduce((acc, p) => acc + (p.losses || 0), 0);
  const avgWinRate = totalWins + totalLosses > 0 ? Math.round((totalWins / (totalWins + totalLosses)) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="home" />
      
      <HeroSection user={user} loading={loading} />
      
      <StatsSection
        playersCount={allPlayers.length}
        matchesToday={recentMatches.length}
        tournamentsActive={tournaments.length}
        avgWinRate={avgWinRate}
      />
      
      <QuickLinksSection user={user} />
      
      <TopKagesSection topKages={topKages} />
      
      <RecentUpdatesSection
        playersCount={allPlayers.length}
        tournamentsCount={tournaments.length}
        matchesCount={recentMatches.length}
      />
      
      <FooterSection />
    </div>
  );
};

export default Index;

import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Users, Zap, TrendingUp, Flame, Target } from "lucide-react";

interface ForumStatsProps {
  totalTopics: number;
  totalPosts: number;
  activeUsers: number;
  onlineNow: number;
}

const ForumStats = ({ totalTopics, totalPosts, activeUsers, onlineNow }: ForumStatsProps) => {
  const stats = [
    {
      label: "Tópicos",
      value: totalTopics,
      icon: MessageSquare,
      color: "from-ninja-chunin to-ninja-chunin/60",
      glowColor: "shadow-[0_0_20px_hsl(var(--chunin-green)/0.3)]"
    },
    {
      label: "Posts",
      value: totalPosts,
      icon: Flame,
      color: "from-primary to-primary/60",
      glowColor: "shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
    },
    {
      label: "Guerreiros",
      value: activeUsers,
      icon: Users,
      color: "from-ninja-jounin to-ninja-jounin/60",
      glowColor: "shadow-[0_0_20px_hsl(var(--jounin-blue)/0.3)]"
    },
    {
      label: "Online",
      value: onlineNow,
      icon: Zap,
      color: "from-accent to-accent/60",
      glowColor: "shadow-[0_0_20px_hsl(var(--accent)/0.3)]",
      pulse: true
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.label}
            className={`relative overflow-hidden bg-gradient-card border-border/30 hover:border-border/60 transition-all duration-300 hover:scale-[1.02] ${stat.glowColor}`}
          >
            {/* Background glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
            
            <CardContent className="relative p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
                {stat.pulse && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-ninja-chunin rounded-full animate-pulse" />
                    <span className="text-[10px] text-ninja-chunin font-medium uppercase">Live</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="font-ninja text-2xl md:text-3xl font-bold text-foreground">
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>

              {/* Progress indicator decoration */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/30">
                <div 
                  className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-500`}
                  style={{ width: `${Math.min((stat.value / 100) * 100, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ForumStats;

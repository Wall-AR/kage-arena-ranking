import { Card, CardContent } from "@/components/ui/card";
import { Users, Swords, Trophy, Target } from "lucide-react";

interface StatsSectionProps {
  playersCount: number;
  matchesToday: number;
  tournamentsActive: number;
  avgWinRate: number;
}

const StatsSection = ({ playersCount, matchesToday, tournamentsActive, avgWinRate }: StatsSectionProps) => {
  const stats = [
    { icon: Users, label: "Ninjas Ativos", value: playersCount.toString(), color: "text-ninja-jounin" },
    { icon: Swords, label: "Batalhas Hoje", value: matchesToday.toString(), color: "text-primary" },
    { icon: Trophy, label: "Torneios Ativos", value: tournamentsActive.toString(), color: "text-ninja-kage" },
    { icon: Target, label: "Taxa Média", value: `${avgWinRate}%`, color: "text-ninja-chunin" },
  ];

  return (
    <section className="py-12 bg-card/50 border-y border-border/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-gradient-card border-border/50 hover:border-primary/30 transition-all duration-300 group">
                <CardContent className="pt-6 text-center">
                  <Icon className={`w-7 h-7 mx-auto mb-2 ${stat.color} group-hover:scale-110 transition-transform`} />
                  <div className="font-ninja text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;

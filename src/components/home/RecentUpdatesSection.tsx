import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Swords, Users } from "lucide-react";

interface RecentUpdatesSectionProps {
  playersCount: number;
  tournamentsCount: number;
  matchesCount: number;
}

const RecentUpdatesSection = ({ playersCount, tournamentsCount, matchesCount }: RecentUpdatesSectionProps) => {
  const updates = [
    {
      title: "Sistema de Ranking",
      description: `${playersCount} ninjas rankeados competindo na arena`,
      icon: Users,
      type: "ranking",
      color: "text-ninja-jounin",
    },
    {
      title: "Torneios Ativos",
      description: `${tournamentsCount} torneios disponíveis para participação`,
      icon: Trophy,
      type: "torneio",
      color: "text-ninja-kage",
    },
    {
      title: "Batalhas Recentes",
      description: `${matchesCount} partidas disputadas hoje`,
      icon: Swords,
      type: "partidas",
      color: "text-primary",
    },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-ninja text-3xl md:text-4xl font-bold text-foreground mb-3">
            VISÃO GERAL
          </h2>
          <p className="text-lg text-muted-foreground">
            Status atual da arena ninja
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {updates.map((update, index) => {
            const Icon = update.icon;
            return (
              <Card key={index} className="bg-gradient-card border-border/50 hover:shadow-card transition-all duration-300 group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className={`w-5 h-5 ${update.color}`} />
                      </div>
                      <CardTitle className="text-base font-semibold">{update.title}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">{update.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground text-sm">
                    {update.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RecentUpdatesSection;

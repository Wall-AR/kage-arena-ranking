import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import RankingCard from "@/components/ui/ranking-card";

interface TopKagesSectionProps {
  topKages: any[];
}

const TopKagesSection = ({ topKages }: TopKagesSectionProps) => {
  return (
    <section className="py-16 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-ninja text-3xl md:text-4xl font-bold text-foreground mb-3">
            TOP KAGES
          </h2>
          <p className="text-lg text-muted-foreground">
            Os 3 ninjas mais poderosos do ranking atual
          </p>
        </div>
        
        <div className="space-y-4 max-w-6xl mx-auto">
          {topKages.length > 0 ? (
            topKages.map((player) => (
              <RankingCard key={player.id} player={player} />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">Nenhum ninja rankeado ainda.</p>
              <p className="text-sm mt-2">Seja o primeiro a entrar na arena!</p>
            </div>
          )}
        </div>
        
        <div className="text-center mt-8">
          <Button asChild variant="outline" size="lg" className="border-primary/30 hover:border-primary hover:bg-primary/5">
            <Link to="/ranking">
              <TrendingUp className="w-5 h-5 mr-2" />
              Ver Ranking Completo
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TopKagesSection;

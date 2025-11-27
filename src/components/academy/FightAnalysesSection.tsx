import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayCircle, TrendingUp, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const fightAnalyses = [
  {
    id: "fight_001",
    title: "Naruto vs Sasuke – Meta Atual",
    characters: ["Naruto", "Sasuke"],
    thumbnail: "https://api.dicebear.com/7.x/avataaars/svg?seed=naruto-sasuke",
    tags: ["meta", "top-tier", "rivalidade"],
    description: "Análise completa do matchup clássico entre Naruto e Sasuke no meta atual.",
    analysis: "Este é um dos matchups mais equilibrados do jogo. Naruto tem vantagem em versatilidade e dano consistente, enquanto Sasuke se destaca em combos e controle de espaço. A chave está em: Naruto deve pressionar constantemente, usar Rasengan para quebrar defesa. Sasuke precisa manter distância, usar Chidori em punishes garantidos e aproveitar o Sharingan para counters."
  },
  {
    id: "fight_002",
    title: "Kakashi vs Obito – Análise Tática",
    characters: ["Kakashi", "Obito"],
    thumbnail: "https://api.dicebear.com/7.x/avataaars/svg?seed=kakashi-obito",
    tags: ["técnico", "avançado", "sharingan"],
    description: "Battle entre mestres do Sharingan: estratégias, counters e mind games.",
    analysis: "Matchup extremamente técnico que favorece quem conhece melhor frame data. Kakashi tem melhor zoning com Raikiri e jutsus à distância. Obito domina no mix-up com Kamui. Vantagens: Kakashi - melhor neutral, mais seguro. Obito - maior potencial de dano, intangibilidade. A vitória depende de reads e adaptação."
  },
  {
    id: "fight_003",
    title: "Rock Lee vs Gaara – Velocidade vs Defesa",
    characters: ["Rock Lee", "Gaara"],
    thumbnail: "https://api.dicebear.com/7.x/avataaars/svg?seed=lee-gaara",
    tags: ["clássico", "estilos-opostos"],
    description: "Choque de estilos: velocidade pura contra defesa impenetrável.",
    analysis: "Um dos matchups mais interessantes. Lee precisa manter pressão constante, usar velocidade para evitar defesas de areia. Gaara deve controlar espaço, punir aproximações com areia. Lee tem vantagem se conseguir abrir o oponente. Gaara domina em neutral e zoning. Matchup 6-4 para Gaara se jogado pacientemente."
  },
  {
    id: "fight_004",
    title: "Itachi vs Pain – Poder Absoluto",
    characters: ["Itachi", "Pain"],
    thumbnail: "https://api.dicebear.com/7.x/avataaars/svg?seed=itachi-pain",
    tags: ["top-tier", "meta", "broken"],
    description: "Dois dos personagens mais fortes: quem leva vantagem?",
    analysis: "Matchup de altíssimo nível. Itachi tem Tsukuyomi e Amaterasu para controle. Pain domina com múltiplos corpos e jutsus devastadores. 5-5 equilibrado. Vence quem gerenciar melhor recursos. Itachi deve ser agressivo no timing certo. Pain precisa controlar espaço e acumular vantagem aos poucos."
  },
  {
    id: "fight_005",
    title: "Minato vs Tobirama – Mestres da Velocidade",
    characters: ["Minato", "Tobirama"],
    thumbnail: "https://api.dicebear.com/7.x/avataaars/svg?seed=minato-tobirama",
    tags: ["técnico", "hiraishin", "meta"],
    description: "Batalha entre os ninjas mais rápidos: teleporte vs teleporte.",
    analysis: "Matchup espelho de alto nível técnico. Ambos usam Hiraishin para mobilidade extrema. Minato tem Rasengan para dano garantido. Tobirama possui mais jutsus versáteis. Vantagem mínima para Minato (5.5-4.5) pelo potencial de one-shot. Requer reflexos excepcionais e reads perfeitos."
  }
];

export const FightAnalysesSection = () => {
  const [selectedFight, setSelectedFight] = useState<typeof fightAnalyses[0] | null>(null);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-ninja font-bold text-foreground mb-2">
          Análises Profissionais de Matchups
        </h2>
        <p className="text-muted-foreground">
          Estude as melhores estratégias e domine seus matchups
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fightAnalyses.map((fight) => (
          <Card 
            key={fight.id}
            className="bg-gradient-card border-border/50 hover:shadow-glow transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
            onClick={() => setSelectedFight(fight)}
          >
            <CardHeader className="space-y-4">
              <div className="w-full h-48 rounded-md overflow-hidden bg-muted/30">
                <img 
                  src={fight.thumbnail} 
                  alt={fight.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-ninja-anbu" />
                <span className="text-sm font-medium text-muted-foreground">
                  {fight.characters.join(" vs ")}
                </span>
              </div>

              <CardTitle className="text-xl font-ninja">{fight.title}</CardTitle>
              
              <div className="flex flex-wrap gap-2">
                {fight.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <CardDescription className="line-clamp-2">
                {fight.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Button className="w-full group-hover:bg-primary/90">
                <TrendingUp className="w-4 h-4 mr-2" />
                Ver Análise Completa
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fight Analysis Dialog */}
      <Dialog open={!!selectedFight} onOpenChange={() => setSelectedFight(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-6 h-6 text-ninja-anbu" />
              <span className="text-lg font-medium text-muted-foreground">
                {selectedFight?.characters.join(" vs ")}
              </span>
            </div>
            <DialogTitle className="text-3xl font-ninja">{selectedFight?.title}</DialogTitle>
            <DialogDescription className="text-base pt-2">
              {selectedFight?.description}
            </DialogDescription>
            
            <div className="flex flex-wrap gap-2 pt-4">
              {selectedFight?.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            <div className="w-full h-80 rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <PlayCircle className="w-20 h-20 mx-auto mb-3 opacity-50" />
                <p className="text-lg">Vídeo da análise será exibido aqui</p>
              </div>
            </div>
            
            <Card className="bg-muted/30 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-ninja-anbu" />
                  Análise Tática
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {selectedFight?.analysis}
                </p>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

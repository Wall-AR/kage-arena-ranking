import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayCircle, Clock, Target } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const tutorials = [
  {
    id: "tut_001",
    title: "Movimentação e Dash Básico",
    level: "basic",
    duration: "5 min",
    thumbnail: "https://api.dicebear.com/7.x/shapes/svg?seed=movement",
    description: "Aprenda os fundamentos de movimentação, dash e esquiva. Essencial para iniciantes.",
    content: "Neste tutorial você aprenderá: Como executar dash corretamente, timing de esquiva, posicionamento estratégico e como se manter seguro durante o combate."
  },
  {
    id: "tut_002",
    title: "Sistema de Chakra",
    level: "basic",
    duration: "8 min",
    thumbnail: "https://api.dicebear.com/7.x/shapes/svg?seed=chakra",
    description: "Entenda como funciona o sistema de chakra e como gerenciá-lo efetivamente.",
    content: "Chakra é o recurso mais importante. Aprenda: Como acumular chakra, quando gastar, combos que economizam chakra e técnicas de gerenciamento."
  },
  {
    id: "tut_003",
    title: "Combos Básicos",
    level: "intermediate",
    duration: "12 min",
    thumbnail: "https://api.dicebear.com/7.x/shapes/svg?seed=combos",
    description: "Domine os combos fundamentais que todo jogador intermediário deve saber.",
    content: "Combos básicos garantem dano consistente. Neste guia: Sequências de golpes básicas, cancelamentos, timing de inputs e prática recomendada."
  },
  {
    id: "tut_004",
    title: "Defesa Avançada",
    level: "intermediate",
    duration: "15 min",
    thumbnail: "https://api.dicebear.com/7.x/shapes/svg?seed=defense",
    description: "Técnicas avançadas de bloqueio, counter e leitura de oponente.",
    content: "Defesa é tão importante quanto ataque. Aprenda: Block timing perfeito, counters, tech recovery e como ler padrões do oponente."
  },
  {
    id: "tut_005",
    title: "Frame Data Avançado",
    level: "advanced",
    duration: "20 min",
    thumbnail: "https://api.dicebear.com/7.x/shapes/svg?seed=frames",
    description: "Entenda frame data e como usar para vantagem competitiva.",
    content: "Frame data é conhecimento avançado. Descubra: O que são frames, frame advantage/disadvantage, punishes garantidos e otimização de combos."
  },
  {
    id: "tut_006",
    title: "Mix-ups Profissionais",
    level: "advanced",
    duration: "18 min",
    thumbnail: "https://api.dicebear.com/7.x/shapes/svg?seed=mixups",
    description: "Técnicas de mix-up usadas por jogadores profissionais.",
    content: "Mix-ups quebram a defesa do oponente. Neste guia avançado: High/low mix-ups, left/right mix-ups, throw tech e condicionamento do oponente."
  }
];

const levelColors = {
  basic: "bg-ninja-genin/20 text-ninja-genin border-ninja-genin/50",
  intermediate: "bg-ninja-chunin/20 text-ninja-chunin border-ninja-chunin/50",
  advanced: "bg-ninja-kage/20 text-ninja-kage border-ninja-kage/50"
};

const levelLabels = {
  basic: "Básico",
  intermediate: "Intermediário",
  advanced: "Avançado"
};

export const TutorialsSection = () => {
  const [selectedTutorial, setSelectedTutorial] = useState<typeof tutorials[0] | null>(null);
  const [filter, setFilter] = useState<"all" | "basic" | "intermediate" | "advanced">("all");

  const filteredTutorials = filter === "all" 
    ? tutorials 
    : tutorials.filter(t => t.level === filter);

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap justify-center">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          className="font-medium"
        >
          Todos
        </Button>
        <Button
          variant={filter === "basic" ? "default" : "outline"}
          onClick={() => setFilter("basic")}
          className="font-medium"
        >
          <Target className="w-4 h-4 mr-2" />
          Básico
        </Button>
        <Button
          variant={filter === "intermediate" ? "default" : "outline"}
          onClick={() => setFilter("intermediate")}
          className="font-medium"
        >
          <Target className="w-4 h-4 mr-2" />
          Intermediário
        </Button>
        <Button
          variant={filter === "advanced" ? "default" : "outline"}
          onClick={() => setFilter("advanced")}
          className="font-medium"
        >
          <Target className="w-4 h-4 mr-2" />
          Avançado
        </Button>
      </div>

      {/* Tutorials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTutorials.map((tutorial) => (
          <Card 
            key={tutorial.id} 
            className="bg-gradient-card border-border/50 hover:shadow-glow transition-all duration-300 hover:scale-105 cursor-pointer group"
            onClick={() => setSelectedTutorial(tutorial)}
          >
            <CardHeader className="space-y-3">
              <div className="w-full h-40 rounded-md overflow-hidden bg-muted/30">
                <img 
                  src={tutorial.thumbnail} 
                  alt={tutorial.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={levelColors[tutorial.level as keyof typeof levelColors]}>
                  {levelLabels[tutorial.level as keyof typeof levelLabels]}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{tutorial.duration}</span>
                </div>
              </div>
              <CardTitle className="text-lg font-ninja">{tutorial.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {tutorial.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full group-hover:bg-primary/90" size="sm">
                <PlayCircle className="w-4 h-4 mr-2" />
                Assistir Tutorial
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tutorial Detail Dialog */}
      <Dialog open={!!selectedTutorial} onOpenChange={() => setSelectedTutorial(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className={selectedTutorial ? levelColors[selectedTutorial.level as keyof typeof levelColors] : ""}>
                {selectedTutorial && levelLabels[selectedTutorial.level as keyof typeof levelLabels]}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{selectedTutorial?.duration}</span>
              </div>
            </div>
            <DialogTitle className="text-2xl font-ninja">{selectedTutorial?.title}</DialogTitle>
            <DialogDescription className="text-base pt-2">
              {selectedTutorial?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="w-full h-64 rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <PlayCircle className="w-16 h-16 mx-auto mb-2 opacity-50" />
                <p>Vídeo do tutorial será exibido aqui</p>
              </div>
            </div>
            
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground">{selectedTutorial?.content}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

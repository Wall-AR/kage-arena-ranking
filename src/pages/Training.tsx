import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, BookOpen, Users, Target, Star } from "lucide-react";
import Navigation from "@/components/ui/navigation";

// Página de Treinamento - Kage Arena
// Criado por Wall - Centro de tutoriais e guias para melhorar habilidades
const Training = () => {
  const trainingCategories = [
    {
      id: "beginner",
      title: "Iniciante",
      description: "Fundamentos básicos para novos ninjas",
      icon: BookOpen,
      color: "ninja-genin",
      tutorials: [
        { title: "Controles Básicos", duration: "5 min", difficulty: "Fácil" },
        { title: "Movimentos Essenciais", duration: "8 min", difficulty: "Fácil" },
        { title: "Sistema de Chakra", duration: "6 min", difficulty: "Fácil" }
      ]
    },
    {
      id: "intermediate", 
      title: "Intermediário",
      description: "Técnicas avançadas e estratégias",
      icon: Target,
      color: "ninja-chunin",
      tutorials: [
        { title: "Combos Básicos", duration: "12 min", difficulty: "Médio" },
        { title: "Defesa Avançada", duration: "15 min", difficulty: "Médio" },
        { title: "Controle de Distância", duration: "10 min", difficulty: "Médio" }
      ]
    },
    {
      id: "advanced",
      title: "Avançado", 
      description: "Técnicas de nível Kage",
      icon: Star,
      color: "ninja-kage",
      tutorials: [
        { title: "Frame Data Avançado", duration: "20 min", difficulty: "Difícil" },
        { title: "Mix-ups Profissionais", duration: "18 min", difficulty: "Difícil" },
        { title: "Leitura de Oponente", duration: "25 min", difficulty: "Difícil" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-ninja text-4xl font-bold text-foreground mb-2">
            📚 ACADEMIA NINJA
          </h1>
          <p className="text-muted-foreground">
            Aprimore suas habilidades e torne-se um verdadeiro mestre
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trainingCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.id} className="bg-gradient-card border-border/50">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-${category.color}/20 flex items-center justify-center mb-4`}>
                    <Icon className={`w-8 h-8 text-${category.color}`} />
                  </div>
                  <CardTitle className="font-ninja text-xl">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {category.tutorials.map((tutorial, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <PlayCircle className="w-5 h-5 text-accent" />
                        <div>
                          <div className="font-medium text-sm">{tutorial.title}</div>
                          <div className="text-xs text-muted-foreground">{tutorial.duration}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {tutorial.difficulty}
                      </Badge>
                    </div>
                  ))}
                  <Button className="w-full mt-4">
                    Ver Todos os Tutoriais
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Training;
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/ui/navigation";
import { TutorialsSection } from "@/components/academy/TutorialsSection";
import { FightAnalysesSection } from "@/components/academy/FightAnalysesSection";
import { CharactersSection } from "@/components/academy/CharactersSection";
import { BookOpen, Swords, Users } from "lucide-react";

const Academy = () => {
  const [activeTab, setActiveTab] = useState("tutorials");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="font-ninja text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-ninja-kage via-ninja-sannin to-ninja-anbu bg-clip-text text-transparent">
            🎓 ACADEMIA NINJA
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Aprimore suas habilidades, domine personagens e torne-se um verdadeiro mestre do combate
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 p-1 h-auto">
            <TabsTrigger 
              value="tutorials" 
              className="flex items-center gap-2 data-[state=active]:bg-ninja-kage/20 data-[state=active]:text-ninja-kage py-3"
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Tutoriais</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analyses" 
              className="flex items-center gap-2 data-[state=active]:bg-ninja-anbu/20 data-[state=active]:text-ninja-anbu py-3"
            >
              <Swords className="w-5 h-5" />
              <span className="font-medium">Análises de Lutas</span>
            </TabsTrigger>
            <TabsTrigger 
              value="characters" 
              className="flex items-center gap-2 data-[state=active]:bg-ninja-sannin/20 data-[state=active]:text-ninja-sannin py-3"
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Personagens</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tutorials" className="animate-fade-in">
            <TutorialsSection />
          </TabsContent>

          <TabsContent value="analyses" className="animate-fade-in">
            <FightAnalysesSection />
          </TabsContent>

          <TabsContent value="characters" className="animate-fade-in">
            <CharactersSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Academy;

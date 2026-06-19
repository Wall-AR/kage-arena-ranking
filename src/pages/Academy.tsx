import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/ui/navigation";
import { Users, BookOpen, Swords } from "lucide-react";
import { CharacterSelectorPS2 } from "@/components/academy/CharacterSelectorPS2";
import { AcademyTopicsSection } from "@/components/academy/AcademyTopicsSection";
import { CommentedMatchesSection } from "@/components/academy/CommentedMatchesSection";

const Academy = () => {
  const [activeTab, setActiveTab] = useState("characters");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* HERO */}
      <div className="relative overflow-hidden border-b border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, hsl(var(--primary) / 0.4), transparent 50%), radial-gradient(circle at 80% 70%, hsl(45 93% 58% / 0.3), transparent 50%)",
          }}
        />
        <div className="container mx-auto px-4 py-12 relative text-center animate-fade-in">
          <h1
            className="font-ninja text-5xl md:text-6xl font-black mb-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent"
            style={{ textShadow: "0 0 40px hsl(var(--primary) / 0.3)" }}
          >
            ACADEMIA NINJA
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Domine personagens, estude mecânicas e evolua com partidas comentadas pelos mestres.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8 bg-muted/50 p-1 h-auto">
            <TabsTrigger
              value="characters"
              className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary py-3"
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Personagens</span>
            </TabsTrigger>
            <TabsTrigger
              value="topics"
              className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary py-3"
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Mecânicas</span>
            </TabsTrigger>
            <TabsTrigger
              value="matches"
              className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary py-3"
            >
              <Swords className="w-5 h-5" />
              <span className="font-medium">Partidas Comentadas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="characters" className="animate-fade-in">
            <CharacterSelectorPS2 />
          </TabsContent>

          <TabsContent value="topics" className="animate-fade-in">
            <AcademyTopicsSection />
          </TabsContent>

          <TabsContent value="matches" className="animate-fade-in">
            <CommentedMatchesSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Academy;

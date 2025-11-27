import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Shield, Swords, TrendingUp, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CharacterDetailProps {
  character: {
    id: string;
    name: string;
    tier: string;
    gif: string;
    attributes: {
      strength: number;
      speed: number;
      technique: number;
      defense: number;
      mobility: number;
      versatility: number;
    };
    description: string;
    moves: Array<{
      id: string;
      name: string;
      type: string;
      video: string;
      description: string;
    }>;
    matchups: {
      favorable_against: string[];
      unfavorable_against: string[];
    };
  };
  onBack: () => void;
}

const tierColors = {
  "S+": "bg-gradient-to-r from-ninja-kage via-yellow-500 to-ninja-kage text-white",
  "S": "bg-ninja-kage/20 text-ninja-kage border-ninja-kage",
  "A+": "bg-ninja-sannin/20 text-ninja-sannin border-ninja-sannin",
  "A": "bg-ninja-anbu/20 text-ninja-anbu border-ninja-anbu",
  "B": "bg-ninja-jounin/20 text-ninja-jounin border-ninja-jounin",
  "C": "bg-ninja-chunin/20 text-ninja-chunin border-ninja-chunin"
};

const moveTypeColors = {
  special: "bg-ninja-anbu/20 text-ninja-anbu",
  ultimate: "bg-ninja-kage/20 text-ninja-kage",
  setup: "bg-ninja-jounin/20 text-ninja-jounin",
  counter: "bg-ninja-sannin/20 text-ninja-sannin",
  projectile: "bg-ninja-chunin/20 text-ninja-chunin",
  defensive: "bg-blue-500/20 text-blue-500",
  command_grab: "bg-purple-500/20 text-purple-500",
  buff: "bg-green-500/20 text-green-500",
  stance: "bg-orange-500/20 text-orange-500",
  transformation: "bg-pink-500/20 text-pink-500",
  auto_guard: "bg-cyan-500/20 text-cyan-500",
  versatile: "bg-indigo-500/20 text-indigo-500"
};

export const CharacterDetail = ({ character, onBack }: CharacterDetailProps) => {
  const maxAttr = 10;
  const attrs = character.attributes;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <Button variant="outline" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para Lista
      </Button>

      {/* Character Header */}
      <Card className="bg-gradient-card border-border/50 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center p-8">
            <img
              src={character.gif}
              alt={character.name}
              className="w-64 h-64 object-cover animate-scale-in"
            />
            <div className="absolute top-4 right-4">
              <Badge className={`${tierColors[character.tier as keyof typeof tierColors]} font-bold text-2xl px-4 py-2 shadow-lg`}>
                Tier {character.tier}
              </Badge>
            </div>
          </div>

          <CardHeader className="space-y-4">
            <CardTitle className="text-4xl font-ninja">{character.name}</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              {character.description}
            </CardDescription>
          </CardHeader>
        </div>
      </Card>

      {/* Attributes Radar Chart */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl font-ninja flex items-center gap-2">
            <Shield className="w-6 h-6 text-ninja-jounin" />
            Atributos do Personagem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Força</span>
                  <span className="text-muted-foreground">{attrs.strength}/10</span>
                </div>
                <Progress value={(attrs.strength / maxAttr) * 100} className="h-3" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Velocidade</span>
                  <span className="text-muted-foreground">{attrs.speed}/10</span>
                </div>
                <Progress value={(attrs.speed / maxAttr) * 100} className="h-3" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Técnica</span>
                  <span className="text-muted-foreground">{attrs.technique}/10</span>
                </div>
                <Progress value={(attrs.technique / maxAttr) * 100} className="h-3" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Defesa</span>
                  <span className="text-muted-foreground">{attrs.defense}/10</span>
                </div>
                <Progress value={(attrs.defense / maxAttr) * 100} className="h-3" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Mobilidade</span>
                  <span className="text-muted-foreground">{attrs.mobility}/10</span>
                </div>
                <Progress value={(attrs.mobility / maxAttr) * 100} className="h-3" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Versatilidade</span>
                  <span className="text-muted-foreground">{attrs.versatility}/10</span>
                </div>
                <Progress value={(attrs.versatility / maxAttr) * 100} className="h-3" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Moves List */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl font-ninja flex items-center gap-2">
            <Swords className="w-6 h-6 text-ninja-anbu" />
            Golpes & Habilidades
          </CardTitle>
          <CardDescription>
            Todos os moves principais e como utilizá-los
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {character.moves.map((move) => (
              <Card key={move.id} className="bg-muted/30 border-border/30 hover:border-border transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg font-medium flex items-center gap-2">
                        {move.name}
                        <Badge variant="outline" className={moveTypeColors[move.type as keyof typeof moveTypeColors]}>
                          {move.type.replace('_', ' ')}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{move.description}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0">
                      <Play className="w-4 h-4 mr-2" />
                      Ver Demo
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Matchups */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl font-ninja">Matchups</CardTitle>
          <CardDescription>
            Vantagens e desvantagens contra outros personagens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-green-500">
                <TrendingUp className="w-5 h-5" />
                Vantagem Contra
              </h3>
              <div className="flex flex-wrap gap-2">
                {character.matchups.favorable_against.map((char) => (
                  <Badge key={char} variant="outline" className="bg-green-500/10 text-green-500 border-green-500/50">
                    {char}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-red-500">
                <TrendingDown className="w-5 h-5" />
                Desvantagem Contra
              </h3>
              <div className="flex flex-wrap gap-2">
                {character.matchups.unfavorable_against.map((char) => (
                  <Badge key={char} variant="outline" className="bg-red-500/10 text-red-500 border-red-500/50">
                    {char}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

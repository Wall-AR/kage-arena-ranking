import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Star } from "lucide-react";
import { CharacterDetail } from "./CharacterDetail";
import { academyCharacters, tierColors, CharacterData } from "@/data/academyCharacters";

export const CharactersSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterData | null>(null);

  const filteredCharacters = academyCharacters.filter(char =>
    char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    char.tier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedCharacter) {
    return (
      <CharacterDetail 
        character={selectedCharacter} 
        onBack={() => setSelectedCharacter(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-ninja font-bold text-foreground mb-2">
          Guia de Personagens & Tier List
        </h2>
        <p className="text-muted-foreground">
          65 personagens com estatísticas, moves e matchups
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar personagem ou tier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Characters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCharacters.map((character) => (
          <Card
            key={character.id}
            className="bg-gradient-card border-border/50 hover:shadow-glow transition-all duration-300 hover:scale-105 cursor-pointer group overflow-hidden"
            onClick={() => setSelectedCharacter(character)}
          >
            <div className="relative">
              <div className="w-full h-48 bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center overflow-hidden">
                <img
                  src={character.gif}
                  alt={character.name}
                  className="w-32 h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="absolute top-3 right-3">
                <Badge 
                  className={`${tierColors[character.tier]} font-bold text-lg px-3 py-1 shadow-lg`}
                >
                  {character.tier}
                </Badge>
              </div>
            </div>

            <CardHeader>
              <CardTitle className="text-xl font-ninja flex items-center gap-2">
                {character.name}
                {(character.tier === "S+" || character.tier === "S") && (
                  <Star className="w-5 h-5 text-ninja-kage fill-ninja-kage" />
                )}
              </CardTitle>
              <CardDescription className="line-clamp-3">
                {character.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{character.moves.length} Moves</span>
                <span className="flex items-center gap-1">
                  Ver detalhes →
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCharacters.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">Nenhum personagem encontrado</p>
          <p className="text-sm">Tente buscar por outro nome ou tier</p>
        </div>
      )}
    </div>
  );
};

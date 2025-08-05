import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Search, User } from "lucide-react";
import { NARUTO_CHARACTERS } from "@/hooks/useProfile";

interface CharacterSelectorProps {
  selectedCharacters: string[];
  onCharactersChange: (characters: string[]) => void;
  maxSelection?: number;
}

export const CharacterSelector = ({ 
  selectedCharacters, 
  onCharactersChange, 
  maxSelection = 3 
}: CharacterSelectorProps) => {
  const [search, setSearch] = useState("");

  const filteredCharacters = NARUTO_CHARACTERS.filter(character =>
    character.toLowerCase().includes(search.toLowerCase()) &&
    !selectedCharacters.includes(character)
  );

  const handleCharacterSelect = (character: string) => {
    if (selectedCharacters.length < maxSelection) {
      onCharactersChange([...selectedCharacters, character]);
    }
  };

  const handleCharacterRemove = (character: string) => {
    onCharactersChange(selectedCharacters.filter(c => c !== character));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="character-search">
          Personagens Favoritos ({selectedCharacters.length}/{maxSelection})
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          Selecione até {maxSelection} personagens favoritos
        </p>
      </div>

      {/* Personagens selecionados */}
      {selectedCharacters.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selecionados:</Label>
          <div className="flex flex-wrap gap-2">
            {selectedCharacters.map((character) => (
              <Badge 
                key={character} 
                variant="secondary" 
                className="flex items-center gap-1 px-3 py-1"
              >
                {character}
                <button
                  onClick={() => handleCharacterRemove(character)}
                  className="hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Busca de personagens */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          id="character-search"
          placeholder="Buscar personagens..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Lista de personagens disponíveis */}
      <ScrollArea className="h-48 w-full border rounded-md">
        <div className="p-2 space-y-1">
          {filteredCharacters.length > 0 ? (
            filteredCharacters.map((character) => (
              <Button
                key={character}
                variant="ghost"
                size="sm"
                onClick={() => handleCharacterSelect(character)}
                disabled={selectedCharacters.length >= maxSelection}
                className="w-full justify-start h-auto p-2 text-left"
              >
                <User className="w-4 h-4 mr-2 shrink-0" />
                {character}
              </Button>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {search ? "Nenhum personagem encontrado" : "Digite para buscar personagens"}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
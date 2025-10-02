import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Search, User } from "lucide-react";
import { NARUTO_CHARACTERS } from "@/hooks/useProfile";
import { useCharacterImages, getCharacterImageUrl } from "@/hooks/useCharacterImages";

interface CharacterSelectorProps {
  selectedCharacters: string[];
  onCharactersChange: (characters: string[]) => void;
  maxSelection?: number;
  disabled?: boolean;
}

export const CharacterSelector = ({ 
  selectedCharacters, 
  onCharactersChange, 
  maxSelection = 3,
  disabled = false
}: CharacterSelectorProps) => {
  const [search, setSearch] = useState("");
  const { data: characterImages = [] } = useCharacterImages();

  const filteredCharacters = NARUTO_CHARACTERS.filter(character =>
    character.toLowerCase().includes(search.toLowerCase()) &&
    !selectedCharacters.includes(character)
  );

  const handleCharacterSelect = (character: string) => {
    if (selectedCharacters.length < maxSelection && !selectedCharacters.includes(character)) {
      const newSelection = [...selectedCharacters, character];
      onCharactersChange(newSelection);
      setSearch(""); // Limpar busca após seleção
    }
  };

  const handleCharacterRemove = (character: string) => {
    if (disabled) return;
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
              <div 
                key={character} 
                className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage 
                    src={getCharacterImageUrl(character, characterImages)} 
                    alt={character}
                  />
                  <AvatarFallback className="text-xs">
                    {character.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{character}</span>
                <button
                  onClick={() => !disabled && handleCharacterRemove(character)}
                  disabled={disabled}
                  className="hover:bg-destructive/20 rounded-full p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
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
                onClick={(e) => {
                  e.preventDefault();
                  if (!disabled) {
                    handleCharacterSelect(character);
                  }
                }}
                disabled={selectedCharacters.length >= maxSelection || disabled}
                className="w-full justify-start h-auto p-3 text-left hover:bg-accent/10"
              >
                <Avatar className="w-8 h-8 mr-3 shrink-0">
                  <AvatarImage 
                    src={getCharacterImageUrl(character, characterImages)} 
                    alt={character}
                  />
                  <AvatarFallback className="text-xs">
                    {character.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{character}</span>
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
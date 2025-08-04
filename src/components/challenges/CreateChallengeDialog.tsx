import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Target, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useChallenges } from "@/hooks/useChallenges";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";

interface CreateChallengeDialogProps {
  children: React.ReactNode;
}

export const CreateChallengeDialog = ({ children }: CreateChallengeDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [matchType, setMatchType] = useState<string>("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { currentPlayer } = useAuth();
  const { createChallenge, isCreating } = useChallenges();

  // Buscar jogadores disponíveis para desafio
  const { data: availablePlayers = [] } = useQuery({
    queryKey: ["players", "available", searchTerm],
    queryFn: async () => {
      if (!currentPlayer?.id) return [];

      let query = supabase
        .from("players")
        .select("id, name, rank, avatar_url, current_points")
        .eq("is_ranked", true)
        .neq("id", currentPlayer.id)
        .order("current_points", { ascending: false });

      if (searchTerm.trim()) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      const { data, error } = await query.limit(10);
      if (error) throw error;
      return data;
    },
    enabled: open && !!currentPlayer?.id,
  });

  const handleCreateChallenge = () => {
    if (!selectedPlayer || !matchType) return;

    createChallenge({
      challengedId: selectedPlayer,
      matchType,
      message: message.trim() || undefined
    });

    // Reset form
    setSelectedPlayer("");
    setMatchType("");
    setMessage("");
    setSearchTerm("");
    setOpen(false);
  };

  const selectedPlayerData = availablePlayers.find(p => p.id === selectedPlayer);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Criar Novo Desafio
          </DialogTitle>
          <DialogDescription>
            Desafie outro ninja para uma batalha épica na arena!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Buscar Jogador */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar Jogador</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Digite o nome do ninja..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Lista de Jogadores */}
          {searchTerm && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <Label>Jogadores Disponíveis</Label>
              {availablePlayers.length > 0 ? (
                <div className="space-y-2">
                  {availablePlayers.map((player) => (
                    <div
                      key={player.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPlayer === player.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedPlayer(player.id)}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={player.avatar_url || ""} />
                        <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{player.name}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {player.rank}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {player.current_points} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum jogador encontrado
                </p>
              )}
            </div>
          )}

          {/* Jogador Selecionado */}
          {selectedPlayerData && (
            <div className="space-y-2">
              <Label>Oponente Selecionado</Label>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/5 border border-primary/30">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedPlayerData.avatar_url || ""} />
                  <AvatarFallback>{selectedPlayerData.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedPlayerData.name}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {selectedPlayerData.rank}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {selectedPlayerData.current_points} pts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tipo de Partida */}
          <div className="space-y-2">
            <Label htmlFor="match-type">Tipo de Partida</Label>
            <Select value={matchType} onValueChange={setMatchType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FT5">Melhor de 9 (FT5)</SelectItem>
                <SelectItem value="FT7">Melhor de 13 (FT7)</SelectItem>
                <SelectItem value="FT10">Melhor de 19 (FT10)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mensagem Opcional */}
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem (Opcional)</Label>
            <Textarea
              id="message"
              placeholder="Digite uma mensagem para o desafio..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateChallenge}
            disabled={!selectedPlayer || !matchType || isCreating}
          >
            {isCreating ? "Enviando..." : "Enviar Desafio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
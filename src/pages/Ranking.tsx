import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navigation from "@/components/ui/navigation";
import RankingCard from "@/components/ui/ranking-card";
import { Search, Filter, ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { useRankedPlayers } from "@/hooks/usePlayers";

// Página de Ranking - Kage Arena
// Criado por Wall - Ranking completo com filtros e paginação
const Ranking = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRank, setSelectedRank] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Buscar todos os players rankeados
  const { data: allPlayers = [], isLoading } = useRankedPlayers();

  // Filtros de busca e categoria
  const filteredPlayers = allPlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    const playerRank = player.rank_level || player.rank;
    const matchesRank = selectedRank === "all" || 
      (selectedRank === "Kage" ? Boolean(player.kage_title) : playerRank === selectedRank);
    return matchesSearch && matchesRank;
  });

  // Paginação - 10 players por página
  const playersPerPage = 10;
  const totalPages = Math.ceil(filteredPlayers.length / playersPerPage);
  const startIndex = (currentPage - 1) * playersPerPage;
  const currentPlayers = filteredPlayers.slice(startIndex, startIndex + playersPerPage);

  const rankOptions = [
    { value: "all", label: "Todos os Ranks" },
    { value: "Kage", label: "🥇 Kage" },
    { value: "Sannin", label: "🔮 Sannin" },
    { value: "Anbu", label: "⚔️ Anbu" },
    { value: "Jounin", label: "🔷 Jounin" },
    { value: "Chunin", label: "🟢 Chunin" },
    { value: "Genin", label: "⚪ Genin" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="ranking" />
      
      {/* Header da Página */}
      <section className="py-12 bg-gradient-card border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="font-ninja text-5xl font-bold text-foreground mb-4">
              🏆 RANKING NINJA
            </h1>
            <p className="text-xl text-muted-foreground">
              Os melhores guerreiros de Ultimate Ninja 5
            </p>
          </div>
          
          {/* Estatísticas do Ranking */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="font-ninja text-2xl font-bold text-ninja-kage">{isLoading ? <Skeleton className="h-8 w-12 mx-auto" /> : allPlayers.length}</div>
              <div className="text-sm text-muted-foreground">Ninjas Rankeados</div>
            </div>
            <div className="text-center">
              <div className="font-ninja text-2xl font-bold text-ninja-jounin">
                {isLoading ? <Skeleton className="h-8 w-12 mx-auto" /> : allPlayers.filter(p => p.kage_title).length}
              </div>
              <div className="text-sm text-muted-foreground">Kages Ativos</div>
            </div>
            <div className="text-center">
              <div className="font-ninja text-2xl font-bold text-primary">
                {isLoading || allPlayers.length === 0 ? <Skeleton className="h-8 w-12 mx-auto" /> : `${Math.round(allPlayers.reduce((acc, p) => acc + p.winRate, 0) / allPlayers.length)}%`}
              </div>
              <div className="text-sm text-muted-foreground">Taxa Média</div>
            </div>
            <div className="text-center">
              <div className="font-ninja text-2xl font-bold text-ninja-chunin">
                {isLoading ? <Skeleton className="h-8 w-12 mx-auto" /> : allPlayers.filter(p => p.isImmune).length}
              </div>
              <div className="text-sm text-muted-foreground">Com Imunidade</div>
            </div>
          </div>

        </div>
      </section>

      {/* Filtros e Busca */}
      <section className="py-8 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between max-w-4xl mx-auto">
            {/* Busca por Nome */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ninja por nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-border/50 focus:border-primary"
              />
            </div>
            
            {/* Filtro por Rank */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedRank} onValueChange={setSelectedRank}>
                <SelectTrigger className="w-48 border-border/50 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rankOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Info dos Resultados */}
            <Badge variant="secondary" className="text-sm">
              {filteredPlayers.length} ninjas encontrados
            </Badge>
          </div>
        </div>
      </section>

      {/* Lista do Ranking */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="space-y-4 max-w-6xl mx-auto">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : currentPlayers.length > 0 ? (
              currentPlayers.map((player) => (
                <RankingCard key={player.id} player={player} />
              ))
            ) : (
              <div className="text-center py-16">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <div className="text-muted-foreground text-lg">
                  {allPlayers.length === 0 ? "Nenhum ninja rankeado ainda. Seja o primeiro!" : "Nenhum ninja encontrado com os filtros aplicados."}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Paginação */}
      {totalPages > 1 && (
        <section className="py-8 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border-border/50"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={page === currentPage ? "bg-primary" : "border-border/50"}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="border-border/50"
              >
                Próximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            <div className="text-center mt-4 text-sm text-muted-foreground">
              Página {currentPage} de {totalPages} • {filteredPlayers.length} ninjas total
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Ranking;

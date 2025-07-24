import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/ui/navigation";
import RankingCard from "@/components/ui/ranking-card";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

// Página de Ranking - Kage Arena
// Criado por Wall - Ranking completo com filtros e paginação
const Ranking = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRank, setSelectedRank] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Mock de dados completos do ranking (13 jogadores conforme especificação)
  const allPlayers = [
    {
      id: 1, name: "Wall", rank: "Kage", position: 1, points: 2450,
      wins: 45, losses: 8, winRate: 84.9, lastMatch: "14/01/2025",
      favoriteCharacters: ["Naruto", "Sasuke", "Kakashi"],
      achievements: ["champion", "undefeated", "veteran"],
      isImmune: true, avatar: "/placeholder.svg"
    },
    {
      id: 2, name: "ShadowNinja", rank: "Kage", position: 2, points: 2200,
      wins: 38, losses: 12, winRate: 76.0, lastMatch: "13/01/2025",
      favoriteCharacters: ["Itachi", "Sasuke", "Orochimaru"],
      achievements: ["streak", "veteran"], avatar: "/placeholder.svg"
    },
    {
      id: 3, name: "FireLord", rank: "Kage", position: 3, points: 2150,
      wins: 42, losses: 18, winRate: 70.0, lastMatch: "12/01/2025",
      favoriteCharacters: ["Jiraiya", "Naruto", "Gaara"],
      achievements: ["champion"], avatar: "/placeholder.svg"
    },
    {
      id: 4, name: "ThunderGod", rank: "Sannin", position: 4, points: 1980,
      wins: 35, losses: 15, winRate: 70.0, lastMatch: "11/01/2025",
      favoriteCharacters: ["Sasuke", "Itachi", "Kakashi"],
      achievements: ["streak"], avatar: "/placeholder.svg"
    },
    {
      id: 5, name: "WindMaster", rank: "Sannin", position: 5, points: 1850,
      wins: 32, losses: 18, winRate: 64.0, lastMatch: "10/01/2025",
      favoriteCharacters: ["Temari", "Gaara", "Shikamaru"],
      achievements: ["veteran"], avatar: "/placeholder.svg"
    },
    {
      id: 6, name: "BloodRaven", rank: "Anbu", position: 6, points: 1720,
      wins: 28, losses: 22, winRate: 56.0, lastMatch: "09/01/2025",
      favoriteCharacters: ["Itachi", "Orochimaru", "Sasuke"],
      achievements: [], avatar: "/placeholder.svg"
    },
    {
      id: 7, name: "LeafStorm", rank: "Anbu", position: 7, points: 1650,
      wins: 25, losses: 20, winRate: 55.6, lastMatch: "08/01/2025",
      favoriteCharacters: ["Rock Lee", "Might Guy", "Naruto"],
      achievements: [], avatar: "/placeholder.svg"
    },
    {
      id: 8, name: "SandViper", rank: "Jounin", position: 8, points: 1580,
      wins: 22, losses: 18, winRate: 55.0, lastMatch: "07/01/2025",
      favoriteCharacters: ["Gaara", "Temari", "Kankuro"],
      achievements: [], avatar: "/placeholder.svg"
    },
    {
      id: 9, name: "MistWalker", rank: "Jounin", position: 9, points: 1520,
      wins: 20, losses: 16, winRate: 55.6, lastMatch: "06/01/2025",
      favoriteCharacters: ["Kisame", "Jiraiya", "Naruto"],
      achievements: [], avatar: "/placeholder.svg"
    },
    {
      id: 10, name: "StoneFist", rank: "Chunin", position: 10, points: 1450,
      wins: 18, losses: 15, winRate: 54.5, lastMatch: "05/01/2025",
      favoriteCharacters: ["Rock Lee", "Choji", "Naruto"],
      achievements: [], avatar: "/placeholder.svg"
    },
    {
      id: 11, name: "NightBlade", rank: "Chunin", position: 11, points: 1380,
      wins: 16, losses: 14, winRate: 53.3, lastMatch: "04/01/2025",
      favoriteCharacters: ["Sasuke", "Kakashi", "Shikamaru"],
      achievements: [], avatar: "/placeholder.svg"
    },
    {
      id: 12, name: "FlameRider", rank: "Genin", position: 12, points: 1320,
      wins: 14, losses: 13, winRate: 51.9, lastMatch: "03/01/2025",
      favoriteCharacters: ["Naruto", "Jiraiya", "Sasuke"],
      achievements: [], avatar: "/placeholder.svg"
    },
    {
      id: 13, name: "CloudWatcher", rank: "Genin", position: 13, points: 1280,
      wins: 12, losses: 12, winRate: 50.0, lastMatch: "02/01/2025",
      favoriteCharacters: ["Hinata", "Neji", "Shino"],
      achievements: [], avatar: "/placeholder.svg"
    }
  ];

  // Filtros de busca e categoria
  const filteredPlayers = allPlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRank = selectedRank === "all" || player.rank === selectedRank;
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
              <div className="font-ninja text-2xl font-bold text-ninja-kage">{allPlayers.length}</div>
              <div className="text-sm text-muted-foreground">Ninjas Rankeados</div>
            </div>
            <div className="text-center">
              <div className="font-ninja text-2xl font-bold text-ninja-jounin">
                {allPlayers.filter(p => p.rank === "Kage").length}
              </div>
              <div className="text-sm text-muted-foreground">Kages Ativos</div>
            </div>
            <div className="text-center">
              <div className="font-ninja text-2xl font-bold text-primary">
                {Math.round(allPlayers.reduce((acc, p) => acc + p.winRate, 0) / allPlayers.length)}%
              </div>
              <div className="text-sm text-muted-foreground">Taxa Média</div>
            </div>
            <div className="text-center">
              <div className="font-ninja text-2xl font-bold text-ninja-chunin">
                {allPlayers.filter(p => p.isImmune).length}
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
            {currentPlayers.length > 0 ? (
              currentPlayers.map((player) => (
                <RankingCard key={player.id} player={player} />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground text-lg">
                  Nenhum ninja encontrado com os filtros aplicados.
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
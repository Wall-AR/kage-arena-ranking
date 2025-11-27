import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Star } from "lucide-react";
import { CharacterDetail } from "./CharacterDetail";

const characters = [
  {
    id: "char_001",
    name: "Naruto Uzumaki",
    tier: "S+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=naruto",
    attributes: { strength: 8, speed: 7, technique: 9, defense: 6, mobility: 8, versatility: 9 },
    description: "O Hokage da Vila da Folha domina o campo de batalha com versatilidade incomparável. Seu arsenal inclui clones de sombra, Rasengan e modo Sennin. Excelente em todas as distâncias, com mixups poderosos e dano consistente. Ideal para jogadores que gostam de pressão constante e múltiplas opções de ataque.",
    moves: [
      { id: "move_001", name: "Rasengan", type: "special", video: "", description: "Golpe especial de médio alcance com ótimo dano. Startup moderado mas seguro em block. Excelente para finalizar combos ou punir dashes." },
      { id: "move_002", name: "Kage Bunshin", type: "setup", video: "", description: "Cria clones para mixup e pressure. Versátil para high/low e esquerda/direita. Gasta chakra mas abre muitas possibilidades." },
      { id: "move_003", name: "Rasen Shuriken", type: "ultimate", video: "", description: "Ultimate devastador de longo alcance. Requer setup mas causa dano massivo. Melhor usado após knockdown ou em combo." }
    ],
    matchups: {
      favorable_against: ["Rock Lee", "Gaara", "Neji"],
      unfavorable_against: ["Itachi", "Pain", "Madara"]
    }
  },
  {
    id: "char_002",
    name: "Sasuke Uchiha",
    tier: "S",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=sasuke",
    attributes: { strength: 7, speed: 9, technique: 9, defense: 5, mobility: 9, versatility: 8 },
    description: "O último dos Uchiha combina velocidade mortal com técnicas poderosas. Sharingan permite counters precisos e leitura do oponente. Chidori oferece alto dano em punishes. Forte em combos e controle de espaço, mas defesa moderada exige jogo mais técnico.",
    moves: [
      { id: "move_004", name: "Chidori", type: "special", video: "", description: "Rush elétrico devastador. Alto risco, alto retorno. Punishável em miss mas garantido em vários setups." },
      { id: "move_005", name: "Sharingan Counter", type: "counter", video: "", description: "Counter de precisão que vira o jogo. Timing perfeito necessário. Recompensa leitura com dano garantido." },
      { id: "move_006", name: "Kirin", type: "ultimate", video: "", description: "Relâmpago massivo do céu. Lento mas imbloquável. Melhor usado em setups específicos ou read de fireball." }
    ],
    matchups: {
      favorable_against: ["Sakura", "Hinata", "Shikamaru"],
      unfavorable_against: ["Naruto", "Killer Bee", "Minato"]
    }
  },
  {
    id: "char_003",
    name: "Kakashi Hatake",
    tier: "A+",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=kakashi",
    attributes: { strength: 7, speed: 8, technique: 10, defense: 7, mobility: 7, versatility: 10 },
    description: "O Ninja Copiador possui o toolkit mais versátil do jogo. Sharingan, Raikiri e diversos jutsus copiados oferecem resposta para qualquer situação. Excelente em neutral, zoning e footsies. Requer conhecimento técnico mas recompensa com consistência.",
    moves: [
      { id: "move_007", name: "Raikiri", type: "special", video: "", description: "Versão aprimorada do Chidori. Mais rápido e seguro. Ótimo para whiff punish e anti-air." },
      { id: "move_008", name: "Kamui", type: "special", video: "", description: "Teleporte dimensional. Esquiva projéteis e cria mix-up. Uso avançado permite combos estendidos." },
      { id: "move_009", name: "Jutsu Copiado", type: "versatile", video: "", description: "Usa o último jutsu do oponente contra ele. Altíssima skill cap mas extremamente versátil." }
    ],
    matchups: {
      favorable_against: ["Deidara", "Sasori", "Hidan"],
      unfavorable_against: ["Obito", "Pain", "Madara"]
    }
  },
  {
    id: "char_004",
    name: "Itachi Uchiha",
    tier: "S",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=itachi",
    attributes: { strength: 6, speed: 8, technique: 10, defense: 6, mobility: 7, versatility: 9 },
    description: "Gênio tático com arsenal devastador. Tsukuyomi controla mente, Amaterasu queima tudo, Susanoo protege. Domina através de leitura e timing perfeito. Menos força bruta, mais estratégia e execução. Top tier nas mãos certas.",
    moves: [
      { id: "move_010", name: "Tsukuyomi", type: "command_grab", video: "", description: "Genjutsu que paralisa. Funciona como command grab. Quebra turtle e abre combos." },
      { id: "move_011", name: "Amaterasu", type: "projectile", video: "", description: "Chamas negras imbloquáveis. Lento mas constante chip damage. Controla espaço e limita movimento." },
      { id: "move_012", name: "Susanoo", type: "defensive", video: "", description: "Armadura massiva. Absorve hits e permite counters. Gasta muito chakra mas vira partidas." }
    ],
    matchups: {
      favorable_against: ["Naruto", "Jiraiya", "Orochimaru"],
      unfavorable_against: ["Sasuke EMS", "Kabuto Sage", "Madara"]
    }
  },
  {
    id: "char_005",
    name: "Rock Lee",
    tier: "A",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=rocklee",
    attributes: { strength: 9, speed: 10, technique: 6, defense: 5, mobility: 10, versatility: 5 },
    description: "Velocidade pura e taijutsu devastador. Não usa ninjutsu mas compensa com agilidade extrema. Drunken Fist e os 8 Portões oferecem poder absurdo. Rushdown implacável que não dá respiro. Glass cannon que recompensa agressão.",
    moves: [
      { id: "move_013", name: "Lotus Primária", type: "special", video: "", description: "Combo aéreo devastador. Requer setup mas dano garantido. Vulnerável mas pode decidir rounds." },
      { id: "move_014", name: "Drunken Fist", type: "stance", video: "", description: "Stance de movimento imprevisível. Confunde oponente e abre novas opções. Alta skill cap." },
      { id: "move_015", name: "8 Portões", type: "buff", video: "", description: "Power-up temporário massivo. Aumenta tudo mas drena vida. All-in que pode virar ou perder partida." }
    ],
    matchups: {
      favorable_against: ["Tenten", "Kiba", "Choji"],
      unfavorable_against: ["Gaara", "Neji", "Temari"]
    }
  },
  {
    id: "char_006",
    name: "Gaara",
    tier: "A",
    gif: "https://api.dicebear.com/7.x/avataaars/svg?seed=gaara",
    attributes: { strength: 6, speed: 5, technique: 8, defense: 10, mobility: 6, versatility: 8 },
    description: "Mestre da defesa absoluta. Areia protege automaticamente e contra-ataca. Excelente em zoning e controle de espaço. Shukaku oferece poder devastador. Jogo paciente que frustra rushdown e domina neutro.",
    moves: [
      { id: "move_016", name: "Defesa de Areia", type: "auto_guard", video: "", description: "Bloqueio automático. Protege de certos ataques e permite punish. Core do gameplan defensivo." },
      { id: "move_017", name: "Caixão de Areia", type: "command_grab", video: "", description: "Grab à distância que captura e esmaga. Lento mas devastador. Ótimo contra turtle." },
      { id: "move_018", name: "Transformação Shukaku", type: "transformation", video: "", description: "Forma bijuu. Aumenta range e poder. Modo de vantagem para finalizar rounds." }
    ],
    matchups: {
      favorable_against: ["Rock Lee", "Kiba", "Sakura"],
      unfavorable_against: ["Deidara", "Sasuke", "Killer Bee"]
    }
  }
];

const tierColors = {
  "S+": "bg-gradient-to-r from-ninja-kage via-yellow-500 to-ninja-kage text-white",
  "S": "bg-ninja-kage/20 text-ninja-kage border-ninja-kage",
  "A+": "bg-ninja-sannin/20 text-ninja-sannin border-ninja-sannin",
  "A": "bg-ninja-anbu/20 text-ninja-anbu border-ninja-anbu",
  "B": "bg-ninja-jounin/20 text-ninja-jounin border-ninja-jounin",
  "C": "bg-ninja-chunin/20 text-ninja-chunin border-ninja-chunin"
};

export const CharactersSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState<typeof characters[0] | null>(null);

  const filteredCharacters = characters.filter(char =>
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
          Domine cada personagem com estatísticas, moves e matchups
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
                  className={`${tierColors[character.tier as keyof typeof tierColors]} font-bold text-lg px-3 py-1 shadow-lg`}
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

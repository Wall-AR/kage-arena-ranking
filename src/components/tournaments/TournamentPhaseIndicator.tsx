import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Scroll, Flame, Shield, Crown, Star, Swords, Trophy } from "lucide-react";

interface TournamentPhaseIndicatorProps {
  round: number;
  totalRounds: number;
  isActive?: boolean;
  matchCount?: number;
}

// Nomes de fases temáticos Naruto
const PHASE_CONFIGS = [
  { 
    name: "Exame Chūnin", 
    subtitle: "Primeira Fase",
    icon: Scroll,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30"
  },
  { 
    name: "Arena da Floresta", 
    subtitle: "Segunda Fase",
    icon: Shield,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30"
  },
  { 
    name: "Batalha Anbu", 
    subtitle: "Quartas de Final",
    icon: Swords,
    color: "from-purple-500 to-violet-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30"
  },
  { 
    name: "Guerra Ninja", 
    subtitle: "Semifinal",
    icon: Flame,
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30"
  },
  { 
    name: "Final Hokage", 
    subtitle: "Grande Final",
    icon: Crown,
    color: "from-yellow-400 to-amber-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30"
  },
];

export function TournamentPhaseIndicator({ 
  round, 
  totalRounds, 
  isActive = false,
  matchCount = 0 
}: TournamentPhaseIndicatorProps) {
  // Map round to phase config based on position relative to final
  const getRoundConfig = () => {
    const roundsFromEnd = totalRounds - round;
    
    if (roundsFromEnd === 0) return PHASE_CONFIGS[4]; // Final
    if (roundsFromEnd === 1) return PHASE_CONFIGS[3]; // Semifinal
    if (roundsFromEnd === 2) return PHASE_CONFIGS[2]; // Quartas
    if (roundsFromEnd === 3) return PHASE_CONFIGS[1]; // Segunda Fase
    return PHASE_CONFIGS[0]; // Primeira Fase
  };

  const config = getRoundConfig();
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        "relative p-4 rounded-xl border-2 transition-all duration-300",
        config.bgColor,
        config.borderColor,
        isActive && "shadow-lg ring-2 ring-primary/30"
      )}
    >
      {/* Animated background for active phase */}
      {isActive && (
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r opacity-20 animate-pulse",
            config.color
          )} />
        </div>
      )}

      <div className="relative flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-lg bg-gradient-to-br",
          config.color,
          isActive && "animate-pulse"
        )}>
          <Icon className="h-5 w-5 text-white" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold">{config.name}</span>
            {isActive && (
              <Badge variant="outline" className="text-xs animate-pulse border-primary text-primary">
                <Star className="h-3 w-3 mr-1" />
                Ativo
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {config.subtitle} • {matchCount} {matchCount === 1 ? "partida" : "partidas"}
          </p>
        </div>

        <Badge 
          variant="outline" 
          className={cn(
            "text-lg font-bold",
            isActive && "border-primary text-primary"
          )}
        >
          R{round}
        </Badge>
      </div>
    </div>
  );
}

export function TournamentPhaseProgress({ currentRound, totalRounds }: { currentRound: number; totalRounds: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: totalRounds }, (_, i) => i + 1).map((round) => (
        <div key={round} className="flex items-center">
          <div 
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-sm transition-all",
              round < currentRound && "bg-primary border-primary text-primary-foreground",
              round === currentRound && "bg-primary/20 border-primary text-primary animate-pulse",
              round > currentRound && "bg-muted border-muted-foreground/30 text-muted-foreground"
            )}
          >
            {round < currentRound ? (
              <Trophy className="h-4 w-4" />
            ) : (
              round
            )}
          </div>
          {round < totalRounds && (
            <div 
              className={cn(
                "w-8 h-1 transition-all",
                round < currentRound && "bg-primary",
                round >= currentRound && "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

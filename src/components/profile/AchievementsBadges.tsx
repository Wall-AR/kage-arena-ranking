import { Trophy, Medal, Star, Crown, Shield, Flame, Target, Zap, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { Achievement } from "@/hooks/useAchievements";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AchievementsBadgesProps {
  achievements: Achievement[];
  className?: string;
  compact?: boolean; // Modo compacto para ranking cards
}

const getAchievementIcon = (iconType: Achievement['icon']) => {
  const iconMap = {
    trophy: Trophy,
    medal: Medal,
    star: Star,
    crown: Crown,
    shield: Shield,
    fire: Flame,
    target: Target,
    zap: Zap,
    award: Award,
  };
  return iconMap[iconType] || Trophy;
};

const getColorClasses = (color: Achievement['color']) => {
  const colorMap = {
    gold: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
    silver: "bg-gray-400/20 text-gray-600 border-gray-400/30",
    bronze: "bg-amber-600/20 text-amber-700 border-amber-600/30",
    primary: "bg-primary/20 text-primary border-primary/30",
    accent: "bg-accent/20 text-accent border-accent/30",
    success: "bg-green-500/20 text-green-600 border-green-500/30",
    warning: "bg-orange-500/20 text-orange-600 border-orange-500/30",
    destructive: "bg-red-500/20 text-red-600 border-red-500/30",
  };
  return colorMap[color];
};

export const AchievementsBadges = ({ achievements, className, compact = false }: AchievementsBadgesProps) => {
  if (achievements.length === 0) {
    return (
      <div className={cn("text-center py-4", className)}>
        <div className="text-muted-foreground text-sm">
          Nenhuma conquista ainda. Continue jogando para desbloquear medalhas!
        </div>
      </div>
    );
  }

  // Modo compacto para ranking cards - apenas ícones
  if (compact) {
    return (
      <TooltipProvider>
        <div className={cn("flex items-center gap-1", className)}>
          {achievements.slice(0, 5).map((achievement) => {
            const Icon = getAchievementIcon(achievement.icon);
            const colorClasses = getColorClasses(achievement.color);
            
            return (
              <Tooltip key={achievement.id}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "p-1.5 rounded-full border transition-all duration-300 hover:scale-110 cursor-pointer",
                      colorClasses
                    )}
                  >
                    <Icon className="w-3 h-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center text-xs">
                    <div className="font-medium">{achievement.name}</div>
                    <div className="text-muted-foreground mt-0.5">
                      {achievement.description}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    );
  }

  // Modo completo para páginas de perfil
  return (
    <TooltipProvider>
      <div className={cn("space-y-3", className)}>
        <div className="flex flex-wrap gap-2">
          {achievements.map((achievement) => {
            const Icon = getAchievementIcon(achievement.icon);
            const colorClasses = getColorClasses(achievement.color);
            
            return (
              <Tooltip key={achievement.id}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-300 hover:scale-105 cursor-pointer",
                      colorClasses
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium truncate max-w-[120px]">
                      {achievement.name}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <div className="font-medium">{achievement.name}</div>
                    <div className="text-muted-foreground text-xs mt-1">
                      {achievement.description}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};
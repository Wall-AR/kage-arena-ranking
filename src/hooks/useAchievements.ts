import { useMemo } from "react";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: "trophy" | "medal" | "star" | "crown" | "shield" | "fire" | "target" | "zap";
  color: "gold" | "silver" | "bronze" | "primary" | "accent" | "success" | "warning" | "destructive";
}

export const usePlayerAchievements = (playerData: any) => {
  return useMemo(() => {
    const achievements: Achievement[] = [];
    
    if (!playerData) return achievements;

    // Kage titles
    if (playerData.kage_title) {
      achievements.push({
        id: `kage-${playerData.kage_title}`,
        name: playerData.kage_title,
        description: "Título de Kage - Top 5 do ranking",
        icon: "crown",
        color: "gold"
      });
    }

    // Win streak achievements
    const winStreak = playerData.win_streak || 0;
    if (winStreak >= 10) {
      achievements.push({
        id: "win-streak-10",
        name: "Sequência Lendária",
        description: "10+ vitórias consecutivas",
        icon: "fire",
        color: "gold"
      });
    } else if (winStreak >= 5) {
      achievements.push({
        id: "win-streak-5",
        name: "Sequência Épica",
        description: "5+ vitórias consecutivas",
        icon: "fire",
        color: "silver"
      });
    }

    // Points achievements
    const points = playerData.current_points || 0;
    if (points >= 2000) {
      achievements.push({
        id: "points-2000",
        name: "Ninja Lendário",
        description: "2000+ pontos no ranking",
        icon: "star",
        color: "gold"
      });
    } else if (points >= 1500) {
      achievements.push({
        id: "points-1500",
        name: "Ninja Élite",
        description: "1500+ pontos no ranking",
        icon: "star",
        color: "silver"
      });
    }

    // Win rate achievements
    const totalGames = (playerData.wins || 0) + (playerData.losses || 0);
    const winRate = totalGames > 0 ? (playerData.wins / totalGames) * 100 : 0;
    
    if (totalGames >= 10 && winRate >= 80) {
      achievements.push({
        id: "winrate-80",
        name: "Dominador",
        description: "80%+ taxa de vitória (10+ jogos)",
        icon: "target",
        color: "gold"
      });
    }

    // Role-based achievements
    if (playerData.is_admin) {
      achievements.push({
        id: "admin",
        name: "Administrador",
        description: "Líder da comunidade",
        icon: "crown",
        color: "destructive"
      });
    } else if (playerData.is_moderator) {
      achievements.push({
        id: "moderator",
        name: "Moderador",
        description: "Guardião da comunidade",
        icon: "shield",
        color: "primary"
      });
    }

    // Immunity achievement
    if (playerData.immunity_until && new Date(playerData.immunity_until) > new Date()) {
      achievements.push({
        id: "immunity",
        name: "Protegido",
        description: "Proteção temporária no ranking",
        icon: "shield",
        color: "accent"
      });
    }

    return achievements;
  }, [playerData]);
};
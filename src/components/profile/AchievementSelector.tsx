import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Trophy, Star, Award, Medal, Crown, Zap, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlayerAchievements, useUpdateDisplayedAchievements } from "@/hooks/useAchievements";

interface AchievementSelectorProps {
  playerId: string;
}

const getAchievementIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    trophy: Trophy,
    star: Star,
    award: Award,
    medal: Medal,
    crown: Crown,
    zap: Zap,
    target: Target
  };
  return icons[iconName] || Trophy;
};

const getColorClasses = (color: string) => {
  const colors: Record<string, string> = {
    gold: "border-yellow-500 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20",
    silver: "border-gray-400 bg-gray-400/10 text-gray-600 hover:bg-gray-400/20",
    bronze: "border-orange-600 bg-orange-600/10 text-orange-700 hover:bg-orange-600/20",
    primary: "border-primary bg-primary/10 text-primary hover:bg-primary/20"
  };
  return colors[color] || colors.primary;
};

export const AchievementSelector = ({ playerId }: AchievementSelectorProps) => {
  const { data: playerAchievements = [] } = usePlayerAchievements(playerId);
  const updateDisplayed = useUpdateDisplayedAchievements();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const displayed = playerAchievements
      .filter(pa => pa.is_displayed)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      .map(pa => pa.achievement.id);
    setSelectedIds(displayed);
  }, [playerAchievements]);

  const handleToggle = (achievementId: string) => {
    if (selectedIds.includes(achievementId)) {
      setSelectedIds(selectedIds.filter(id => id !== achievementId));
    } else if (selectedIds.length < 5) {
      setSelectedIds([...selectedIds, achievementId]);
    }
  };

  const handleSave = () => {
    updateDisplayed.mutate({ playerId, achievementIds: selectedIds });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Conquistas</CardTitle>
        <CardDescription>
          Selecione até 5 conquistas para exibir no seu perfil e ranking ({selectedIds.length}/5 selecionadas)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {playerAchievements.map((pa) => {
            const achievement = pa.achievement;
            const Icon = getAchievementIcon(achievement.icon);
            const isSelected = selectedIds.includes(achievement.id);
            const selectionOrder = selectedIds.indexOf(achievement.id) + 1;

            return (
              <div
                key={pa.id}
                className={cn(
                  "relative rounded-lg border-2 p-4 cursor-pointer transition-all",
                  isSelected && "ring-2 ring-accent",
                  !isSelected && "hover:border-accent/50",
                  getColorClasses(achievement.color)
                )}
                onClick={() => handleToggle(achievement.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1 flex items-center justify-between">
                      {achievement.display_name}
                      {isSelected && (
                        <Badge variant="default" className="text-xs ml-2">
                          #{selectionOrder}
                        </Badge>
                      )}
                    </h4>
                    <p className="text-xs opacity-80 mb-2">{achievement.description}</p>
                    <p className="text-xs opacity-60">
                      Desbloqueado em {new Date(pa.unlocked_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {playerAchievements.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Lock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Você ainda não desbloqueou nenhuma conquista</p>
            <p className="text-sm mt-2">Continue jogando para desbloquear conquistas especiais!</p>
          </div>
        )}

        {playerAchievements.length > 0 && (
          <Button 
            onClick={handleSave}
            disabled={updateDisplayed.isPending}
            className="w-full"
          >
            {updateDisplayed.isPending ? 'Salvando...' : 'Salvar Conquistas'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

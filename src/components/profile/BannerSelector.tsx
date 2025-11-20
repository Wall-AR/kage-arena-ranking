import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBanners, usePlayerBanners, useSelectBanner } from "@/hooks/useBanners";

interface BannerSelectorProps {
  playerId: string;
  selectedBannerId?: string;
}

export const BannerSelector = ({ playerId, selectedBannerId }: BannerSelectorProps) => {
  const { data: allBanners = [] } = useBanners();
  const { data: playerBanners = [] } = usePlayerBanners(playerId);
  const selectBanner = useSelectBanner();
  const [selectedId, setSelectedId] = useState(selectedBannerId);

  const unlockedBannerIds = new Set(playerBanners.map(pb => pb.banner_id));

  const handleSelectBanner = (bannerId: string) => {
    setSelectedId(bannerId);
    selectBanner.mutate({ playerId, bannerId });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecionar Tema</CardTitle>
        <CardDescription>
          Escolha um banner para personalizar seu perfil e ranking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allBanners.map((banner) => {
            const isUnlocked = unlockedBannerIds.has(banner.id);
            const isSelected = selectedId === banner.id;

            return (
              <div
                key={banner.id}
                className={cn(
                  "relative rounded-lg border-2 overflow-hidden transition-all cursor-pointer",
                  isSelected && "border-accent ring-2 ring-accent/50",
                  !isSelected && "border-border hover:border-accent/50",
                  !isUnlocked && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => isUnlocked && handleSelectBanner(banner.id)}
              >
                {/* Banner preview */}
                <div 
                  className="h-32 flex items-center justify-center relative bg-gradient-to-br from-muted to-muted-foreground/20"
                  style={
                    banner.image_url 
                      ? { 
                          backgroundImage: `url(${banner.image_url})`, 
                          backgroundSize: 'cover', 
                          backgroundPosition: 'center'
                        }
                      : {}
                  }
                >
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                      <Lock className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  {isSelected && isUnlocked && (
                    <div className="absolute top-2 right-2 bg-accent text-accent-foreground rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  {!banner.image_url && (
                    <span className="text-2xl font-bold text-muted-foreground">
                      {banner.display_name}
                    </span>
                  )}
                </div>

                {/* Banner info */}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm">{banner.display_name}</h4>
                    {isUnlocked ? (
                      <Badge variant="outline" className="text-xs">Desbloqueado</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Bloqueado</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {banner.description || "Banner exclusivo"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {allBanners.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum banner disponível no momento</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

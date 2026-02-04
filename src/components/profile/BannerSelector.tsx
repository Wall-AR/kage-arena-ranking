import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Check, Sparkles, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBanners, usePlayerBanners, useSelectBanner } from "@/hooks/useBanners";

interface BannerSelectorProps {
  playerId: string;
  selectedBannerId?: string;
}

/**
 * Sistema de Banners do Perfil
 * 
 * Resolução recomendada para criação de banners: 1920x480px (proporção 4:1)
 * - Largura: 1920px (garante qualidade em telas grandes)
 * - Altura: 480px (proporção ideal para headers de perfil)
 * - Formato: JPG ou WebP para menor tamanho de arquivo
 * - Tamanho máximo recomendado: 500KB
 * 
 * Os banners são exibidos no perfil e nos cards de ranking,
 * com overlay de gradiente para garantir legibilidade do texto.
 */

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'legendary':
      return 'from-yellow-500 via-orange-500 to-red-500';
    case 'epic':
      return 'from-purple-500 via-pink-500 to-purple-600';
    case 'rare':
      return 'from-blue-500 via-cyan-500 to-blue-600';
    case 'uncommon':
      return 'from-green-500 via-emerald-500 to-green-600';
    default:
      return 'from-gray-400 via-gray-500 to-gray-600';
  }
};

const getRarityLabel = (rarity: string) => {
  switch (rarity) {
    case 'legendary':
      return 'Lendário';
    case 'epic':
      return 'Épico';
    case 'rare':
      return 'Raro';
    case 'uncommon':
      return 'Incomum';
    default:
      return 'Comum';
  }
};

const getRarityBadgeClass = (rarity: string) => {
  switch (rarity) {
    case 'legendary':
      return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0';
    case 'epic':
      return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0';
    case 'rare':
      return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0';
    case 'uncommon':
      return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const BannerSelector = ({ playerId, selectedBannerId }: BannerSelectorProps) => {
  const { data: allBanners = [], isLoading: loadingBanners } = useBanners();
  const { data: playerBanners = [], isLoading: loadingPlayerBanners } = usePlayerBanners(playerId);
  const selectBanner = useSelectBanner();
  const [selectedId, setSelectedId] = useState(selectedBannerId);

  const unlockedBannerIds = new Set(playerBanners.map(pb => pb.banner_id));

  const handleSelectBanner = (bannerId: string) => {
    if (!unlockedBannerIds.has(bannerId)) return;
    setSelectedId(bannerId);
    selectBanner.mutate({ playerId, bannerId });
  };

  // Agrupar banners por categoria
  const groupedBanners = allBanners.reduce((acc, banner) => {
    const category = banner.category || 'Geral';
    if (!acc[category]) acc[category] = [];
    acc[category].push(banner);
    return acc;
  }, {} as Record<string, typeof allBanners>);

  if (loadingBanners || loadingPlayerBanners) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Selecionar Banner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          Selecionar Banner
        </CardTitle>
        <CardDescription>
          Escolha um banner para personalizar seu perfil e ranking.
          <br />
          <span className="text-xs text-muted-foreground">
            Resolução recomendada: <strong>1920x480px</strong> (proporção 4:1)
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedBanners).map(([category, banners]) => (
          <div key={category}>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              {category}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map((banner) => {
                const isUnlocked = unlockedBannerIds.has(banner.id);
                const isSelected = selectedId === banner.id;

                return (
                  <div
                    key={banner.id}
                    className={cn(
                      "relative rounded-lg border-2 overflow-hidden transition-all cursor-pointer group",
                      isSelected && "border-accent ring-2 ring-accent/50 shadow-lg",
                      !isSelected && isUnlocked && "border-border hover:border-accent/50 hover:shadow-md",
                      !isUnlocked && "opacity-60 cursor-not-allowed border-muted"
                    )}
                    onClick={() => isUnlocked && handleSelectBanner(banner.id)}
                  >
                    {/* Banner preview - proporção 4:1 */}
                    <div 
                      className="relative h-28 flex items-center justify-center overflow-hidden"
                    >
                      {banner.image_url ? (
                        <>
                          <img 
                            src={banner.image_url} 
                            alt={banner.display_name}
                            className={cn(
                              "w-full h-full object-cover transition-transform duration-300",
                              isUnlocked && "group-hover:scale-105"
                            )}
                          />
                          {/* Gradiente para texto no preview */}
                          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                        </>
                      ) : (
                        <div className={cn(
                          "w-full h-full bg-gradient-to-br",
                          getRarityColor(banner.rarity)
                        )}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white/80 drop-shadow-lg">
                              {banner.display_name}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Overlay de bloqueado */}
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
                          <Lock className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-xs text-muted-foreground">Bloqueado</span>
                        </div>
                      )}
                      
                      {/* Indicador de selecionado */}
                      {isSelected && isUnlocked && (
                        <div className="absolute top-2 right-2 bg-accent text-accent-foreground rounded-full p-1.5 shadow-lg">
                          <Check className="w-4 h-4" />
                        </div>
                      )}

                      {/* Badge de raridade */}
                      <div className="absolute top-2 left-2">
                        <Badge className={cn("text-xs", getRarityBadgeClass(banner.rarity))}>
                          {getRarityLabel(banner.rarity)}
                        </Badge>
                      </div>
                    </div>

                    {/* Banner info */}
                    <div className="p-3 bg-card">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm truncate">
                          {banner.display_name}
                        </h4>
                        {isUnlocked ? (
                          <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">
                            <Check className="w-3 h-3 mr-1" />
                            Desbloqueado
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <Lock className="w-3 h-3 mr-1" />
                            Bloqueado
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {banner.description || "Banner exclusivo para seu perfil"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {allBanners.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum banner disponível no momento</p>
            <p className="text-sm mt-2">
              Participe de torneios e eventos para desbloquear banners exclusivos!
            </p>
          </div>
        )}

        <div className="text-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            💡 Dica: Desbloqueie novos banners participando de torneios, 
            completando conquistas ou resgatando códigos promocionais.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Check, Sparkles, Image as ImageIcon, Crown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBanners, useAvailableBanners, useSelectBanner } from "@/hooks/useBanners";

interface BannerSelectorProps {
  playerId: string;
  selectedBannerId?: string | null;
}

const RARITY_GRADIENT: Record<string, string> = {
  legendary: 'from-yellow-500 via-orange-500 to-red-500',
  epic: 'from-purple-500 via-pink-500 to-purple-600',
  rare: 'from-blue-500 via-cyan-500 to-blue-600',
  uncommon: 'from-green-500 via-emerald-500 to-green-600',
  common: 'from-gray-400 via-gray-500 to-gray-600',
};

const RARITY_LABEL: Record<string, string> = {
  legendary: 'Lendário',
  epic: 'Épico',
  rare: 'Raro',
  uncommon: 'Incomum',
  common: 'Comum',
};

const RARITY_BADGE: Record<string, string> = {
  legendary: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0',
  epic: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0',
  rare: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0',
  uncommon: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0',
  common: 'bg-muted text-muted-foreground',
};

const CATEGORY_LABEL: Record<string, string> = {
  general: 'Geral',
  tournament: 'Torneios',
  event: 'Eventos',
  special: 'Especiais',
  character: 'Personagem (TOP 1)',
};

export const BannerSelector = ({ playerId, selectedBannerId }: BannerSelectorProps) => {
  const { data: allBanners = [], isLoading: loadingBanners } = useBanners();
  const { data: available = [], isLoading: loadingAvailable } = useAvailableBanners(playerId);
  const selectBanner = useSelectBanner();
  const [selectedId, setSelectedId] = useState<string | null>(selectedBannerId ?? null);

  const availableMap = new Map(available.map((a) => [a.banner_id, a.source]));

  const handleSelect = (bannerId: string) => {
    if (!availableMap.has(bannerId)) return;
    setSelectedId(bannerId);
    selectBanner.mutate({ playerId, bannerId });
  };

  const handleRemove = () => {
    setSelectedId(null);
    selectBanner.mutate({ playerId, bannerId: null });
  };

  // Agrupar por categoria — banners de personagem vão para grupo separado
  const grouped = allBanners.reduce((acc, b) => {
    const cat = b.character_name ? 'character' : (b.category || 'general');
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(b);
    return acc;
  }, {} as Record<string, typeof allBanners>);

  const categoryOrder = ['character', 'special', 'tournament', 'event', 'general'];
  const sortedCategories = Object.keys(grouped).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  if (loadingBanners || loadingAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" /> Selecionar Banner
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
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Selecionar Banner
            </CardTitle>
            <CardDescription className="mt-1">
              Escolha um banner para personalizar seu perfil e ranking.
              <br />
              <span className="text-xs">
                Resolução recomendada: <strong>1920×480px</strong> (proporção 4:1) ·
                formato ideal: <strong>WebP</strong> ou <strong>JPG</strong> (até ~500KB)
              </span>
            </CardDescription>
          </div>
          {selectedId && (
            <Button variant="ghost" size="sm" onClick={handleRemove} className="gap-1">
              <X className="w-4 h-4" /> Remover
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {sortedCategories.map((cat) => (
          <div key={cat}>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide flex items-center gap-2">
              {cat === 'character' && <Crown className="w-4 h-4 text-yellow-500" />}
              {CATEGORY_LABEL[cat] ?? cat}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {grouped[cat].map((banner) => {
                const source = availableMap.get(banner.id);
                const isUnlocked = !!source;
                const isTop1 = source === 'character_top1';
                const isSelected = selectedId === banner.id;
                const rarity = banner.rarity || 'common';

                return (
                  <div
                    key={banner.id}
                    className={cn(
                      "relative rounded-lg border-2 overflow-hidden transition-all group",
                      isUnlocked ? "cursor-pointer" : "cursor-not-allowed opacity-60 border-muted",
                      isSelected && "border-accent ring-2 ring-accent/50 shadow-lg",
                      !isSelected && isUnlocked && "border-border hover:border-accent/50 hover:shadow-md",
                    )}
                    onClick={() => handleSelect(banner.id)}
                  >
                    {/* 4:1 ratio preview */}
                    <div className="relative aspect-[4/1] w-full overflow-hidden bg-muted">
                      {banner.image_url ? (
                        <>
                          <img
                            src={banner.image_url}
                            alt={banner.display_name}
                            loading="lazy"
                            className={cn(
                              "w-full h-full object-cover transition-transform duration-300",
                              isUnlocked && "group-hover:scale-105"
                            )}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                        </>
                      ) : (
                        <div className={cn("w-full h-full bg-gradient-to-br flex items-center justify-center", RARITY_GRADIENT[rarity])}>
                          <span className="text-xl font-bold text-white/90 drop-shadow-lg px-3 text-center">
                            {banner.display_name}
                          </span>
                        </div>
                      )}

                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
                          <Lock className="w-7 h-7 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">
                            {banner.character_name
                              ? `Exclusivo TOP 1 — ${banner.character_name}`
                              : 'Bloqueado'}
                          </span>
                        </div>
                      )}

                      {isSelected && isUnlocked && (
                        <div className="absolute top-2 right-2 bg-accent text-accent-foreground rounded-full p-1.5 shadow-lg">
                          <Check className="w-4 h-4" />
                        </div>
                      )}

                      <div className="absolute top-2 left-2 flex gap-1">
                        <Badge className={cn("text-xs", RARITY_BADGE[rarity])}>
                          {RARITY_LABEL[rarity] ?? rarity}
                        </Badge>
                        {isTop1 && (
                          <Badge className="text-xs bg-yellow-500 text-white border-0 gap-1">
                            <Crown className="w-3 h-3" /> TOP 1
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-card">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <h4 className="font-semibold text-sm truncate">{banner.display_name}</h4>
                        {isUnlocked ? (
                          <Badge variant="outline" className="text-xs text-green-500 border-green-500/30 shrink-0">
                            <Check className="w-3 h-3 mr-1" /> Disponível
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            <Lock className="w-3 h-3 mr-1" /> Bloqueado
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {banner.description ||
                          (banner.character_name
                            ? `Banner exclusivo do TOP 1 do ranking de ${banner.character_name}.`
                            : 'Banner exclusivo para seu perfil')}
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
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum banner cadastrado ainda</p>
            <p className="text-sm mt-2">
              Participe de torneios e eventos para desbloquear banners exclusivos!
            </p>
          </div>
        )}

        <div className="text-center pt-4 border-t space-y-1">
          <p className="text-xs text-muted-foreground">
            💡 Desbloqueie banners participando de torneios, completando conquistas ou resgatando códigos.
          </p>
          <p className="text-xs text-muted-foreground">
            👑 Banners de personagem são exclusivos para o TOP 1 do ranking daquele personagem.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

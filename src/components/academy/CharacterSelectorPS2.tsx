import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Search, Star, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAcademyCharacters, type AcademyCharacter } from "@/hooks/useAcademy";
import { cn } from "@/lib/utils";

const TIER_COLORS: Record<string, string> = {
  "S+": "bg-gradient-to-r from-yellow-400 to-orange-500 text-black",
  S: "bg-gradient-to-r from-orange-500 to-red-500 text-white",
  "A+": "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  A: "bg-purple-500 text-white",
  "B+": "bg-blue-500 text-white",
  B: "bg-blue-600 text-white",
  "C+": "bg-green-600 text-white",
  C: "bg-green-700 text-white",
  D: "bg-zinc-600 text-white",
};

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Fácil",
  medium: "Média",
  hard: "Difícil",
  expert: "Expert",
};

export const CharacterSelectorPS2 = () => {
  const { data: characters = [], isLoading } = useAcademyCharacters();
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState<AcademyCharacter | null>(null);
  const navigate = useNavigate();

  const filtered = useMemo(
    () =>
      characters.filter((c) =>
        search.trim() ? c.name.toLowerCase().includes(search.toLowerCase().trim()) : true,
      ),
    [characters, search],
  );

  const showcase = hovered || filtered[0] || null;

  if (isLoading) {
    return (
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {Array.from({ length: 16 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-[500px] rounded-xl" />
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
        <p className="text-muted-foreground">Nenhum personagem cadastrado ainda.</p>
        <p className="text-xs text-muted-foreground mt-1">Admins e moderadores podem adicionar pelo painel.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar personagem..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card/60 border-primary/30"
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* PS2 grid */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-background p-4 shadow-[inset_0_0_40px_hsl(var(--primary)/0.08)]">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-6 xl:grid-cols-7 gap-2">
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onMouseEnter={() => setHovered(c)}
                onFocus={() => setHovered(c)}
                onClick={() => navigate(`/academy/character/${c.slug}`)}
                aria-label={`Ver ${c.name}`}
                className={cn(
                  "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200",
                  "bg-gradient-to-b from-muted/30 to-muted/10",
                  hovered?.id === c.id
                    ? "border-primary scale-105 shadow-[0_0_20px_hsl(var(--primary)/0.6)] z-10"
                    : "border-border/60 hover:border-primary/60 hover:scale-105",
                )}
              >
                <img
                  src={c.image_url}
                  alt={c.name}
                  loading="lazy"
                  className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
                />
                <span
                  className={cn(
                    "absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold leading-none",
                    TIER_COLORS[c.tier] || "bg-zinc-600 text-white",
                  )}
                >
                  {c.tier}
                </span>
                {c.is_featured && (
                  <Star className="absolute top-1 right-1 w-3 h-3 text-yellow-400 fill-yellow-400 drop-shadow" />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1 pt-3">
                  <p className="text-[10px] font-medium text-white truncate text-center">{c.name}</p>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full text-center text-sm text-muted-foreground py-8">
                Nenhum personagem encontrado.
              </p>
            )}
          </div>
        </div>

        {/* Showcase panel */}
        {showcase && (
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-card to-background overflow-hidden flex flex-col animate-fade-in shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
            <div className="relative aspect-square bg-gradient-to-b from-primary/10 via-transparent to-background">
              <img
                src={showcase.image_url}
                alt={showcase.name}
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <span
                className={cn(
                  "absolute top-3 left-3 px-3 py-1 rounded-md text-sm font-black tracking-wider shadow-lg",
                  TIER_COLORS[showcase.tier] || "bg-zinc-600 text-white",
                )}
              >
                TIER {showcase.tier}
              </span>
              <div className="absolute bottom-0 inset-x-0 p-4">
                <h3
                  className="font-ninja text-2xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] leading-tight"
                  style={{ textShadow: "0 0 12px hsl(var(--primary) / 0.6)" }}
                >
                  {showcase.name.toUpperCase()}
                </h3>
                {showcase.playstyle && (
                  <p className="text-xs text-primary font-semibold tracking-wide mt-0.5">
                    {showcase.playstyle.toUpperCase()}
                  </p>
                )}
              </div>
            </div>
            <div className="p-4 space-y-3 flex-1">
              {showcase.short_description && (
                <p className="text-sm text-muted-foreground leading-snug">{showcase.short_description}</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {showcase.difficulty && (
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    <Zap className="w-3 h-3 mr-1" />
                    {DIFFICULTY_LABEL[showcase.difficulty] || showcase.difficulty}
                  </Badge>
                )}
                {showcase.is_featured && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
                    <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                    Destaque
                  </Badge>
                )}
              </div>
              <Button
                onClick={() => navigate(`/academy/character/${showcase.slug}`)}
                className="w-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-600 text-white font-bold tracking-wide shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                size="lg"
              >
                ENTRAR NO DOJO →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, Zap, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAcademyCharacters, type AcademyCharacter } from "@/hooks/useAcademy";
import { CHARACTER_IMAGE_MAP, DEFAULT_CHARACTER_IMAGE } from "@/data/characterImages";
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

type SelectorEntry = {
  key: string;
  name: string;
  image_url: string;
  locked: boolean;
  character?: AcademyCharacter;
};

export const CharacterSelectorPS2 = () => {
  const { data: characters = [], isLoading } = useAcademyCharacters();
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState<SelectorEntry | null>(null);
  const navigate = useNavigate();

  const entries: SelectorEntry[] = useMemo(() => {
    const dbByName = new Map(characters.map((c) => [c.name.toLowerCase(), c]));
    // Start with DB characters (sorted by sort_order/name from query)
    const list: SelectorEntry[] = characters.map((c) => ({
      key: c.id,
      name: c.name,
      image_url: c.image_url,
      locked: false,
      character: c,
    }));
    // Append locked ones from the master image map
    for (const [name, img] of Object.entries(CHARACTER_IMAGE_MAP)) {
      if (dbByName.has(name.toLowerCase())) continue;
      list.push({
        key: `locked-${name}`,
        name,
        image_url: img || DEFAULT_CHARACTER_IMAGE,
        locked: true,
      });
    }
    return list;
  }, [characters]);

  const filtered = useMemo(
    () =>
      entries.filter((e) =>
        search.trim() ? e.name.toLowerCase().includes(search.toLowerCase().trim()) : true,
      ),
    [entries, search],
  );

  const showcase = hovered || filtered.find((e) => !e.locked) || filtered[0] || null;

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

  const totalUnlocked = entries.filter((e) => !e.locked).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-md flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar personagem..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card/60 border-primary/30"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="text-primary font-bold">{totalUnlocked}</span> /{" "}
          {entries.length} personagens disponíveis
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* PS2 grid */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-background p-4 shadow-[inset_0_0_40px_hsl(var(--primary)/0.08)]">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-6 xl:grid-cols-7 gap-2">
            {filtered.map((e) => {
              const isHovered = hovered?.key === e.key;
              return (
                <button
                  key={e.key}
                  type="button"
                  onMouseEnter={() => setHovered(e)}
                  onFocus={() => setHovered(e)}
                  onClick={() =>
                    e.locked || !e.character
                      ? null
                      : navigate(`/academy/character/${e.character.slug}`)
                  }
                  disabled={e.locked}
                  aria-label={e.locked ? `${e.name} bloqueado` : `Ver ${e.name}`}
                  className={cn(
                    "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200",
                    "bg-gradient-to-b from-muted/30 to-muted/10",
                    e.locked
                      ? "border-border/40 cursor-not-allowed"
                      : isHovered
                        ? "border-primary scale-105 shadow-[0_0_20px_hsl(var(--primary)/0.6)] z-10"
                        : "border-border/60 hover:border-primary/60 hover:scale-105",
                  )}
                >
                  <img
                    src={e.image_url}
                    alt={e.name}
                    loading="lazy"
                    className={cn(
                      "w-full h-full object-cover object-top transition-transform duration-300",
                      e.locked ? "grayscale opacity-50" : "group-hover:scale-110",
                    )}
                  />
                  {e.locked ? (
                    <>
                      <div className="absolute inset-0 bg-black/50" />
                      <Lock className="absolute inset-0 m-auto w-6 h-6 text-white/90 drop-shadow-lg" />
                    </>
                  ) : (
                    <>
                      {e.character && (
                        <span
                          className={cn(
                            "absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold leading-none",
                            TIER_COLORS[e.character.tier] || "bg-zinc-600 text-white",
                          )}
                        >
                          {e.character.tier}
                        </span>
                      )}
                      {e.character?.is_featured && (
                        <Star className="absolute top-1 right-1 w-3 h-3 text-yellow-400 fill-yellow-400 drop-shadow" />
                      )}
                    </>
                  )}
                  <div
                    className={cn(
                      "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1 pt-3",
                      e.locked && "from-black/95",
                    )}
                  >
                    <p
                      className={cn(
                        "text-[10px] font-medium truncate text-center",
                        e.locked ? "text-white/60" : "text-white",
                      )}
                    >
                      {e.name}
                    </p>
                  </div>
                </button>
              );
            })}
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
                className={cn(
                  "absolute inset-0 w-full h-full object-cover object-top",
                  showcase.locked && "grayscale opacity-70",
                )}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              {showcase.locked ? (
                <span className="absolute top-3 left-3 px-3 py-1 rounded-md text-xs font-bold tracking-wider shadow-lg bg-zinc-700 text-white flex items-center gap-1">
                  <Lock className="w-3 h-3" /> EM BREVE
                </span>
              ) : (
                showcase.character && (
                  <span
                    className={cn(
                      "absolute top-3 left-3 px-3 py-1 rounded-md text-sm font-black tracking-wider shadow-lg",
                      TIER_COLORS[showcase.character.tier] || "bg-zinc-600 text-white",
                    )}
                  >
                    TIER {showcase.character.tier}
                  </span>
                )
              )}
              <div className="absolute bottom-0 inset-x-0 p-4">
                <h3
                  className="font-ninja text-2xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] leading-tight"
                  style={{ textShadow: "0 0 12px hsl(var(--primary) / 0.6)" }}
                >
                  {showcase.name.toUpperCase()}
                </h3>
                {showcase.character?.playstyle && (
                  <p className="text-xs text-primary font-semibold tracking-wide mt-0.5">
                    {showcase.character.playstyle.toUpperCase()}
                  </p>
                )}
              </div>
            </div>
            <div className="p-4 space-y-3 flex-1">
              {showcase.locked ? (
                <p className="text-sm text-muted-foreground leading-snug">
                  Este personagem ainda não tem ficha completa na Academia. Em breve nossos
                  moderadores vão liberar todas as habilidades, combos e estratégias.
                </p>
              ) : (
                <>
                  {showcase.character?.short_description && (
                    <p className="text-sm text-muted-foreground leading-snug">
                      {showcase.character.short_description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {showcase.character?.difficulty && (
                      <Badge variant="outline" className="border-primary/40 text-primary">
                        <Zap className="w-3 h-3 mr-1" />
                        {DIFFICULTY_LABEL[showcase.character.difficulty] ||
                          showcase.character.difficulty}
                      </Badge>
                    )}
                    {showcase.character?.is_featured && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
                        <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                        Destaque
                      </Badge>
                    )}
                  </div>
                </>
              )}
              <Button
                disabled={showcase.locked || !showcase.character}
                onClick={() =>
                  showcase.character &&
                  navigate(`/academy/character/${showcase.character.slug}`)
                }
                className={cn(
                  "w-full font-bold tracking-wide",
                  showcase.locked
                    ? "bg-zinc-700 text-white/60"
                    : "bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-600 text-white shadow-[0_0_20px_hsl(var(--primary)/0.4)]",
                )}
                size="lg"
              >
                {showcase.locked ? (
                  <>
                    <Lock className="w-4 h-4 mr-2" /> BLOQUEADO
                  </>
                ) : (
                  "ENTRAR NO DOJO →"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

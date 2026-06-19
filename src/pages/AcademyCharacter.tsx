import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Zap, Swords, Sparkles, Shield, Crosshair, ChevronLeft } from "lucide-react";
import Navigation from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAcademyCharacterBySlug,
  useAcademyMoves,
  useAcademyCombos,
} from "@/hooks/useAcademy";
import { CharacterRadarChart } from "@/components/academy/CharacterRadarChart";
import { VideoEmbed } from "@/components/academy/VideoEmbed";
import { cn } from "@/lib/utils";

const TIER_COLORS: Record<string, string> = {
  "S+": "bg-gradient-to-r from-yellow-400 to-orange-500 text-black",
  S: "bg-gradient-to-r from-orange-500 to-red-500 text-white",
  "A+": "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  A: "bg-purple-500 text-white",
  "B+": "bg-blue-500 text-white",
  B: "bg-blue-600 text-white",
  C: "bg-green-700 text-white",
  D: "bg-zinc-600 text-white",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "border-green-500/40 text-green-400",
  medium: "border-yellow-500/40 text-yellow-400",
  hard: "border-orange-500/40 text-orange-400",
  expert: "border-red-500/40 text-red-400",
};

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Fácil",
  medium: "Média",
  hard: "Difícil",
  expert: "Expert",
};

const MOVE_TYPE_LABEL: Record<string, string> = {
  special: "Especial",
  ultimate: "Ultimate",
  setup: "Setup",
  counter: "Counter",
  projectile: "Projétil",
  command_grab: "Agarrão",
  defensive: "Defensivo",
  stance: "Postura",
  buff: "Buff",
  auto_guard: "Auto-Guard",
  transformation: "Transformação",
  versatile: "Versátil",
  combo: "Combo",
};

const MOVE_TYPE_COLOR: Record<string, string> = {
  ultimate: "bg-red-500/20 text-red-400 border-red-500/40",
  special: "bg-primary/20 text-primary border-primary/40",
  counter: "bg-purple-500/20 text-purple-400 border-purple-500/40",
  setup: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  projectile: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
  transformation: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  defensive: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  command_grab: "bg-pink-500/20 text-pink-400 border-pink-500/40",
  buff: "bg-orange-500/20 text-orange-400 border-orange-500/40",
};

const AcademyCharacter = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: character, isLoading } = useAcademyCharacterBySlug(slug);
  const { data: moves = [] } = useAcademyMoves(character?.id);
  const { data: combos = [] } = useAcademyCombos(character?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground mb-4">Personagem não encontrado.</p>
          <Button onClick={() => navigate("/academy")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Academia
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* HERO */}
      <div className="relative overflow-hidden border-b border-primary/20">
        <div
          className="absolute inset-0 opacity-30 blur-xl"
          style={{ backgroundImage: `url(${character.image_url})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />

        <div className="container mx-auto px-4 py-8 relative">
          <Button
            onClick={() => navigate("/academy")}
            variant="ghost"
            size="sm"
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Voltar à Academia
          </Button>

          <div className="grid lg:grid-cols-[400px_1fr] gap-8 items-end">
            <div className="relative rounded-2xl overflow-hidden border-2 border-primary/40 shadow-[0_0_40px_hsl(var(--primary)/0.4)] aspect-[3/4] max-w-sm mx-auto lg:mx-0">
              <img src={character.image_url} alt={character.name} className="w-full h-full object-cover object-top" />
              <span
                className={cn(
                  "absolute top-3 left-3 px-3 py-1 rounded-md text-sm font-black tracking-wider shadow-lg",
                  TIER_COLORS[character.tier] || "bg-zinc-600 text-white",
                )}
              >
                TIER {character.tier}
              </span>
            </div>

            <div className="space-y-3">
              {character.playstyle && (
                <p className="text-primary font-bold tracking-widest text-sm uppercase">{character.playstyle}</p>
              )}
              <h1
                className="font-ninja text-4xl md:text-6xl font-black text-foreground leading-tight"
                style={{ textShadow: "0 0 24px hsl(var(--primary) / 0.5)" }}
              >
                {character.name.toUpperCase()}
              </h1>
              {character.short_description && (
                <p className="text-lg text-muted-foreground max-w-2xl">{character.short_description}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {character.difficulty && (
                  <Badge variant="outline" className={cn("border-2", DIFFICULTY_COLOR[character.difficulty])}>
                    <Zap className="w-3 h-3 mr-1" /> {DIFFICULTY_LABEL[character.difficulty] || character.difficulty}
                  </Badge>
                )}
                {character.recommended_for && (
                  <Badge variant="outline" className="border-primary/40">
                    Para: {character.recommended_for}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Quick row: radar + strengths/weaknesses */}
        <div className="grid lg:grid-cols-[400px_1fr] gap-6">
          <Card className="bg-gradient-to-br from-card to-background border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="w-4 h-4 text-primary" /> Atributos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CharacterRadarChart attributes={character.attributes} />
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-green-500/5 to-card border-green-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-green-400">
                  <Shield className="w-4 h-4" /> Pontos Fortes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-sm">
                  {character.strengths.length === 0 && (
                    <li className="text-muted-foreground text-xs">Sem dados.</li>
                  )}
                  {character.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">▸</span>
                      <span className="text-foreground/90">{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-500/5 to-card border-red-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-red-400">
                  <Crosshair className="w-4 h-4" /> Pontos Fracos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 text-sm">
                  {character.weaknesses.length === 0 && (
                    <li className="text-muted-foreground text-xs">Sem dados.</li>
                  )}
                  {character.weaknesses.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">▸</span>
                      <span className="text-foreground/90">{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            {character.full_description && (
              <Card className="sm:col-span-2 bg-card/60">
                <CardContent className="pt-6">
                  <p className="text-sm text-foreground/85 leading-relaxed">{character.full_description}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Tabs defaultValue="moves" className="w-full">
          <TabsList className="grid grid-cols-3 max-w-md">
            <TabsTrigger value="moves">
              <Sparkles className="w-4 h-4 mr-1" /> Habilidades
            </TabsTrigger>
            <TabsTrigger value="combos">
              <Swords className="w-4 h-4 mr-1" /> Combos
            </TabsTrigger>
            <TabsTrigger value="matchups">
              <Crosshair className="w-4 h-4 mr-1" /> Matchups
            </TabsTrigger>
          </TabsList>

          <TabsContent value="moves" className="mt-6 space-y-4 animate-fade-in">
            {moves.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">Nenhuma habilidade cadastrada ainda.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {moves.map((m) => (
                  <Card key={m.id} className="bg-gradient-to-br from-card to-background border-border/60">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{m.name}</CardTitle>
                        <Badge variant="outline" className={cn("text-[10px]", MOVE_TYPE_COLOR[m.move_type] || "")}>
                          {MOVE_TYPE_LABEL[m.move_type] || m.move_type}
                        </Badge>
                      </div>
                      {m.command && (
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono w-fit text-primary">
                          {m.command}
                        </code>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {m.video_url && <VideoEmbed url={m.video_url} title={m.name} />}
                      <p className="text-sm text-muted-foreground">{m.description}</p>
                      <div className="flex gap-3 text-xs">
                        {m.damage_rating != null && (
                          <span className="text-foreground/80">
                            Dano: <strong className="text-primary">{m.damage_rating}/10</strong>
                          </span>
                        )}
                        {m.difficulty && (
                          <span className={cn("font-semibold", DIFFICULTY_COLOR[m.difficulty]?.split(" ")[1])}>
                            {DIFFICULTY_LABEL[m.difficulty]}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="combos" className="mt-6 space-y-4 animate-fade-in">
            {combos.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">Nenhum combo cadastrado ainda.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {combos.map((c) => (
                  <Card key={c.id} className="bg-gradient-to-br from-card to-background border-border/60">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{c.name}</CardTitle>
                        <Badge variant="outline" className={cn(DIFFICULTY_COLOR[c.difficulty])}>
                          {DIFFICULTY_LABEL[c.difficulty] || c.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <code className="block text-sm bg-muted/70 border border-border p-3 rounded font-mono text-primary leading-relaxed">
                        {c.inputs}
                      </code>
                      {c.video_url && <VideoEmbed url={c.video_url} title={c.name} />}
                      <div className="flex gap-4 text-xs flex-wrap">
                        {c.damage_estimate && (
                          <span>
                            Dano: <strong className="text-primary">{c.damage_estimate}</strong>
                          </span>
                        )}
                        {c.situation && (
                          <span>
                            Situação: <strong className="text-foreground">{c.situation}</strong>
                          </span>
                        )}
                      </div>
                      {c.notes && <p className="text-xs text-muted-foreground italic">{c.notes}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="matchups" className="mt-6 grid sm:grid-cols-2 gap-4 animate-fade-in">
            <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-card">
              <CardHeader>
                <CardTitle className="text-base text-green-400">Vantagem contra</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {character.favorable_against.length === 0 && (
                    <p className="text-xs text-muted-foreground">Sem dados.</p>
                  )}
                  {character.favorable_against.map((c) => (
                    <Badge key={c} className="bg-green-500/20 text-green-300 border border-green-500/40">
                      {c}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-500/30 bg-gradient-to-br from-red-500/5 to-card">
              <CardHeader>
                <CardTitle className="text-base text-red-400">Desvantagem contra</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {character.unfavorable_against.length === 0 && (
                    <p className="text-xs text-muted-foreground">Sem dados.</p>
                  )}
                  {character.unfavorable_against.map((c) => (
                    <Badge key={c} className="bg-red-500/20 text-red-300 border border-red-500/40">
                      {c}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AcademyCharacter;

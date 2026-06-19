import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Swords, Star, Trophy } from "lucide-react";
import { useAcademyCommentedMatches } from "@/hooks/useAcademy";
import { VideoEmbed } from "./VideoEmbed";

const TIER_LABEL: Record<string, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export const CommentedMatchesSection = () => {
  const { data: matches = [], isLoading } = useAcademyCommentedMatches();

  if (isLoading) {
    return (
      <div className="grid lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-xl" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
        <Swords className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">Nenhuma partida comentada publicada ainda.</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {matches.map((m) => {
        const winnerA = m.winner === "a";
        const winnerB = m.winner === "b";
        return (
          <Card
            key={m.id}
            className="overflow-hidden border-border/60 bg-gradient-to-br from-card to-background hover:border-primary/40 transition-all"
          >
            <VideoEmbed url={m.video_url} title={m.title} />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {m.is_featured && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
                    <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                    Destaque
                  </Badge>
                )}
                {m.tier && (
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    {TIER_LABEL[m.tier] || m.tier}
                  </Badge>
                )}
                {m.tags.slice(0, 3).map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">
                    #{t}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-lg">{m.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {m.description && (
                <p className="text-sm text-muted-foreground">{m.description}</p>
              )}
              {(m.player_a_name || m.player_b_name) && (
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
                  <div className={`text-right ${winnerA ? "text-yellow-400 font-bold" : ""}`}>
                    {winnerA && <Trophy className="w-3 h-3 inline mr-1" />}
                    {m.player_a_name || "?"}
                    {m.character_a && <span className="block text-xs text-muted-foreground">{m.character_a}</span>}
                  </div>
                  <span className="text-muted-foreground font-bold">VS</span>
                  <div className={`text-left ${winnerB ? "text-yellow-400 font-bold" : ""}`}>
                    {m.player_b_name || "?"}
                    {winnerB && <Trophy className="w-3 h-3 inline ml-1" />}
                    {m.character_b && <span className="block text-xs text-muted-foreground">{m.character_b}</span>}
                  </div>
                </div>
              )}
              {m.commentator && (
                <p className="text-xs text-muted-foreground italic">Comentário: {m.commentator}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pin, BookOpen, Sparkles } from "lucide-react";
import { useAcademyTopics, type AcademyTopic } from "@/hooks/useAcademy";
import { VideoEmbed } from "./VideoEmbed";

const CATEGORY_LABEL: Record<string, string> = {
  mechanics: "Mecânicas",
  basics: "Fundamentos",
  advanced: "Avançado",
  strategy: "Estratégia",
  meta: "Meta",
};

const CATEGORY_COLOR: Record<string, string> = {
  mechanics: "bg-primary/20 text-primary border-primary/40",
  basics: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  advanced: "bg-purple-500/20 text-purple-400 border-purple-500/40",
  strategy: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  meta: "bg-pink-500/20 text-pink-400 border-pink-500/40",
};

export const AcademyTopicsSection = () => {
  const { data: topics = [], isLoading } = useAcademyTopics();
  const [open, setOpen] = useState<AcademyTopic | null>(null);

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-xl" />
        ))}
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
        <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">Nenhum tópico publicado ainda.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((t) => (
          <Card
            key={t.id}
            className="group relative cursor-pointer overflow-hidden border-border/60 bg-gradient-to-br from-card to-background hover:border-primary/60 transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_hsl(var(--primary)/0.15)]"
            onClick={() => setOpen(t)}
          >
            {t.is_pinned && (
              <div className="absolute top-3 right-3 z-10">
                <Pin className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              </div>
            )}
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={CATEGORY_COLOR[t.category] || ""}>
                  {CATEGORY_LABEL[t.category] || t.category}
                </Badge>
              </div>
              <CardTitle className="text-base group-hover:text-primary transition-colors leading-snug">
                {t.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {t.summary && (
                <p className="text-sm text-muted-foreground line-clamp-3">{t.summary}</p>
              )}
              <Button variant="link" size="sm" className="px-0 mt-2 text-primary">
                Ler mais →
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {open && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={CATEGORY_COLOR[open.category] || ""}>
                    {CATEGORY_LABEL[open.category] || open.category}
                  </Badge>
                  {open.is_pinned && (
                    <Badge variant="outline" className="border-yellow-500/40 text-yellow-400">
                      <Pin className="w-3 h-3 mr-1" /> Fixado
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {open.title}
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-1 pr-4">
                {open.video_url && <VideoEmbed url={open.video_url} title={open.title} className="mb-4" />}
                <article className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-foreground/90">
                  {open.content}
                </article>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

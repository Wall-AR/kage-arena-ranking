import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { SmilePlus } from "lucide-react";
import { cn } from "@/lib/utils";

export type ReactionType =
  | "shuriken"
  | "hype"
  | "fire"
  | "laugh"
  | "dislike"
  | "rasengan"
  | "sharingan"
  | "heart";

export const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "shuriken", emoji: "🌟", label: "Shuriken" },
  { type: "hype",     emoji: "🔥", label: "Hype!" },
  { type: "rasengan", emoji: "🌀", label: "Rasengan" },
  { type: "sharingan", emoji: "👁️", label: "Sharingan" },
  { type: "fire",     emoji: "💥", label: "Explosivo" },
  { type: "laugh",    emoji: "😂", label: "Hilário" },
  { type: "heart",    emoji: "❤️", label: "Amei" },
  { type: "dislike",  emoji: "👎", label: "Não curti" },
];

const EMOJI_BY_TYPE: Record<ReactionType, string> = Object.fromEntries(
  REACTIONS.map((r) => [r.type, r.emoji])
) as Record<ReactionType, string>;

export interface ReactionCounts {
  counts: Partial<Record<ReactionType, number>>;
  myReaction: ReactionType | null;
}

interface ReactionBarProps {
  data: ReactionCounts;
  onReact: (type: ReactionType) => void;
  disabled?: boolean;
  compact?: boolean;
}

const ReactionBar = ({ data, onReact, disabled, compact }: ReactionBarProps) => {
  const [open, setOpen] = useState(false);
  const entries = (Object.entries(data.counts) as [ReactionType, number][])
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {entries.map(([type, count]) => {
        const mine = data.myReaction === type;
        return (
          <button
            key={type}
            type="button"
            disabled={disabled}
            onClick={() => onReact(type)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-all",
              "hover:scale-105 active:scale-95",
              mine
                ? "border-primary/60 bg-primary/15 text-primary shadow-[0_0_10px_hsl(var(--primary)/0.25)]"
                : "border-border/50 bg-muted/30 text-foreground/80 hover:border-primary/40 hover:bg-primary/10",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            aria-label={`Reagir ${type}`}
          >
            <span className="text-sm leading-none">{EMOJI_BY_TYPE[type]}</span>
            <span className="font-medium tabular-nums">{count}</span>
          </button>
        );
      })}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className={cn(
              "h-6 px-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10",
              compact && "h-6"
            )}
          >
            <SmilePlus className="w-3.5 h-3.5 mr-1" />
            <span className="text-xs">Reagir</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto p-2 bg-popover/95 backdrop-blur border-primary/30"
        >
          <div className="grid grid-cols-4 gap-1">
            {REACTIONS.map((r) => {
              const mine = data.myReaction === r.type;
              return (
                <button
                  key={r.type}
                  type="button"
                  title={r.label}
                  onClick={() => {
                    onReact(r.type);
                    setOpen(false);
                  }}
                  className={cn(
                    "h-10 w-10 rounded-md flex items-center justify-center text-xl transition-all",
                    "hover:scale-125 hover:bg-primary/15",
                    mine && "bg-primary/20 ring-1 ring-primary/60"
                  )}
                >
                  {r.emoji}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2 px-1">
            Uma reação por mensagem · clique novamente para remover
          </p>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ReactionBar;

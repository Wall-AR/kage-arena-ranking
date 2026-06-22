import { useMemo } from "react";
import { Shield, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  useAcademyReactions,
  useSetAcademyReaction,
  type AcademyCardType,
} from "@/hooks/useAcademy";
import ReactionBar, {
  type ReactionType,
  type ReactionCounts,
} from "@/components/forum/ReactionBar";

interface Props {
  cardType: AcademyCardType;
  cardId: string;
  allCardIds: string[];
  author?: {
    id: string;
    name: string;
    avatar_url: string | null;
    is_admin: boolean | null;
    is_moderator: boolean | null;
  } | null;
}

export const AcademyCardFooter = ({ cardType, cardId, allCardIds, author }: Props) => {
  const { user } = useAuth();
  const { data: rows = [] } = useAcademyReactions(cardType, allCardIds);
  const setReaction = useSetAcademyReaction();

  const data: ReactionCounts = useMemo(() => {
    const counts: Partial<Record<ReactionType, number>> = {};
    let mine: ReactionType | null = null;
    for (const r of rows) {
      if (r.card_id !== cardId) continue;
      counts[r.reaction_type as ReactionType] =
        (counts[r.reaction_type as ReactionType] || 0) + 1;
      if (user && r.user_id === user.id) mine = r.reaction_type as ReactionType;
    }
    return { counts, myReaction: mine };
  }, [rows, cardId, user]);

  return (
    <div className="border-t border-border/40 pt-2 mt-2 space-y-2">
      {author && (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {author.avatar_url ? (
            <img
              src={author.avatar_url}
              alt={author.name}
              className="w-5 h-5 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40" />
          )}
          <span>Adicionado por</span>
          <strong className="text-foreground/90 inline-flex items-center gap-1">
            {author.name}
            {author.is_admin ? (
              <ShieldCheck className="w-3 h-3 text-yellow-400" />
            ) : author.is_moderator ? (
              <Shield className="w-3 h-3 text-primary" />
            ) : null}
          </strong>
        </div>
      )}
      <ReactionBar
        data={data}
        disabled={!user || setReaction.isPending}
        onReact={(type) => setReaction.mutate({ cardType, cardId, reactionType: type })}
      />
    </div>
  );
};

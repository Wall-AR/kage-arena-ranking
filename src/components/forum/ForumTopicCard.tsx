import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pin, TrendingUp, MessageCircle, Eye, Clock, Award, Flame, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Topic {
  id: number;
  title: string;
  author: string;
  authorRank: string;
  authorAvatar?: string;
  category: string;
  isPinned: boolean;
  isHot: boolean;
  isNew?: boolean;
  replies: number;
  views: number;
  lastReply: string;
  lastReplyBy: string;
  xpReward?: number;
}

interface ForumTopicCardProps {
  topic: Topic;
  onClick?: () => void;
}

const rankColors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  'Kage': { 
    bg: 'bg-ninja-kage/20', 
    text: 'text-ninja-kage', 
    border: 'border-ninja-kage/30',
    glow: 'shadow-[0_0_10px_hsl(var(--kage-gold)/0.3)]'
  },
  'Sannin': { 
    bg: 'bg-ninja-sannin/20', 
    text: 'text-ninja-sannin', 
    border: 'border-ninja-sannin/30',
    glow: 'shadow-[0_0_10px_hsl(var(--sannin-purple)/0.3)]'
  },
  'Anbu': { 
    bg: 'bg-ninja-anbu/20', 
    text: 'text-ninja-anbu', 
    border: 'border-ninja-anbu/30',
    glow: 'shadow-[0_0_10px_hsl(var(--anbu-red)/0.3)]'
  },
  'Jounin': { 
    bg: 'bg-ninja-jounin/20', 
    text: 'text-ninja-jounin', 
    border: 'border-ninja-jounin/30',
    glow: 'shadow-[0_0_10px_hsl(var(--jounin-blue)/0.3)]'
  },
  'Chunin': { 
    bg: 'bg-ninja-chunin/20', 
    text: 'text-ninja-chunin', 
    border: 'border-ninja-chunin/30',
    glow: 'shadow-[0_0_10px_hsl(var(--chunin-green)/0.3)]'
  },
  'Genin': { 
    bg: 'bg-ninja-genin/20', 
    text: 'text-ninja-genin', 
    border: 'border-ninja-genin/30',
    glow: ''
  }
};

const ForumTopicCard = ({ topic, onClick }: ForumTopicCardProps) => {
  const rankStyle = rankColors[topic.authorRank] || rankColors['Genin'];

  return (
    <Card 
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden cursor-pointer transition-all duration-300",
        "bg-gradient-card border-border/30 hover:border-border/60",
        "hover:shadow-card hover:scale-[1.01]",
        topic.isPinned && "border-ninja-kage/30"
      )}
    >
      {/* Left accent bar */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 transition-all duration-300",
        topic.isPinned ? "bg-gradient-to-b from-ninja-kage to-accent" :
        topic.isHot ? "bg-gradient-to-b from-ninja-anbu to-primary" :
        "bg-gradient-to-b from-muted to-muted/50 group-hover:from-primary group-hover:to-primary/50"
      )} />

      <CardContent className="p-4 pl-5">
        <div className="flex items-start gap-4">
          {/* Author Avatar with rank ring */}
          <div className="relative flex-shrink-0">
            <Avatar className={cn(
              "w-12 h-12 ring-2 transition-all duration-300",
              rankStyle.border,
              rankStyle.glow
            )}>
              <AvatarImage src={topic.authorAvatar} />
              <AvatarFallback className={cn("font-bold text-sm", rankStyle.bg, rankStyle.text)}>
                {topic.author.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Rank icon for Kage */}
            {topic.authorRank === 'Kage' && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-ninja-kage rounded-full flex items-center justify-center">
                <Crown className="w-3 h-3 text-accent-foreground" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Topic badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {topic.isPinned && (
                <Badge variant="outline" className="border-ninja-kage/50 text-ninja-kage bg-ninja-kage/10 text-xs">
                  <Pin className="w-3 h-3 mr-1" />
                  Fixado
                </Badge>
              )}
              {topic.isHot && (
                <Badge variant="outline" className="border-ninja-anbu/50 text-ninja-anbu bg-ninja-anbu/10 text-xs">
                  <Flame className="w-3 h-3 mr-1" />
                  Em Alta
                </Badge>
              )}
              {topic.isNew && (
                <Badge variant="outline" className="border-ninja-chunin/50 text-ninja-chunin bg-ninja-chunin/10 text-xs">
                  Novo
                </Badge>
              )}
              {topic.xpReward && (
                <Badge variant="outline" className="border-accent/50 text-accent bg-accent/10 text-xs">
                  <Award className="w-3 h-3 mr-1" />
                  +{topic.xpReward} XP
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 mb-2 line-clamp-2">
              {topic.title}
            </h3>

            {/* Author info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <span>por</span>
              <span className={cn("font-medium", rankStyle.text)}>{topic.author}</span>
              <Badge variant="outline" className={cn("text-xs py-0 px-1.5", rankStyle.border, rankStyle.text)}>
                {topic.authorRank}
              </Badge>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{topic.replies}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{topic.views}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{topic.lastReply}</span>
              </div>
            </div>
          </div>

          {/* Stats column on right (desktop) */}
          <div className="hidden md:flex flex-col items-end gap-2 flex-shrink-0">
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-foreground">{topic.replies}</div>
                <div className="text-xs text-muted-foreground">Respostas</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-foreground">{topic.views}</div>
                <div className="text-xs text-muted-foreground">Views</div>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground text-right">
              <span>Última por </span>
              <span className="text-foreground font-medium">{topic.lastReplyBy}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForumTopicCard;

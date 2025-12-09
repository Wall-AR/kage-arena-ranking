import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Star, MessageSquare, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopContributor {
  id: string;
  name: string;
  rank: string;
  avatar?: string;
  posts: number;
  reputation: number;
}

interface ForumLeaderboardProps {
  contributors: TopContributor[];
}

const rankColors: Record<string, { text: string; bg: string }> = {
  'Kage': { text: 'text-ninja-kage', bg: 'bg-ninja-kage/20' },
  'Sannin': { text: 'text-ninja-sannin', bg: 'bg-ninja-sannin/20' },
  'Anbu': { text: 'text-ninja-anbu', bg: 'bg-ninja-anbu/20' },
  'Jounin': { text: 'text-ninja-jounin', bg: 'bg-ninja-jounin/20' },
  'Chunin': { text: 'text-ninja-chunin', bg: 'bg-ninja-chunin/20' },
  'Genin': { text: 'text-ninja-genin', bg: 'bg-ninja-genin/20' }
};

const positionIcons = [
  { icon: Trophy, color: 'text-ninja-kage', bgColor: 'bg-ninja-kage/20' },
  { icon: Medal, color: 'text-ninja-genin', bgColor: 'bg-ninja-genin/20' },
  { icon: Star, color: 'text-primary', bgColor: 'bg-primary/20' }
];

const ForumLeaderboard = ({ contributors }: ForumLeaderboardProps) => {
  return (
    <Card className="bg-gradient-card border-border/30 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ninja-kage to-accent flex items-center justify-center">
            <Trophy className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <span className="font-ninja text-sm uppercase tracking-wider">Top Contribuidores</span>
            <p className="text-xs text-muted-foreground font-normal mt-0.5">Esta semana</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {contributors.slice(0, 5).map((contributor, index) => {
            const rankStyle = rankColors[contributor.rank] || rankColors['Genin'];
            const PositionIcon = positionIcons[index]?.icon || TrendingUp;
            const positionColor = positionIcons[index]?.color || 'text-muted-foreground';
            const positionBg = positionIcons[index]?.bgColor || 'bg-muted/20';

            return (
              <div
                key={contributor.id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-all duration-300",
                  "hover:bg-muted/30",
                  index === 0 && "bg-ninja-kage/5"
                )}
              >
                {/* Position */}
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  positionBg
                )}>
                  {index < 3 ? (
                    <PositionIcon className={cn("w-4 h-4", positionColor)} />
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">{index + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="w-10 h-10 ring-2 ring-border/30">
                  <AvatarImage src={contributor.avatar} />
                  <AvatarFallback className={cn("text-sm font-bold", rankStyle.bg, rankStyle.text)}>
                    {contributor.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className={cn("font-medium text-sm truncate", rankStyle.text)}>
                    {contributor.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {contributor.rank}
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 text-sm font-bold text-foreground">
                    <MessageSquare className="w-3 h-3 text-muted-foreground" />
                    {contributor.posts}
                  </div>
                  <div className="text-xs text-accent">
                    +{contributor.reputation} rep
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View all link */}
        <button className="w-full mt-4 py-2 text-sm text-primary hover:text-primary/80 transition-colors text-center">
          Ver ranking completo →
        </button>
      </CardContent>
    </Card>
  );
};

export default ForumLeaderboard;

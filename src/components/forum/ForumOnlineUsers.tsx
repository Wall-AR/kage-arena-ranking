import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Wifi, Crown, Shield, Sword } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnlineUser {
  id: string;
  name: string;
  rank: string;
  avatar?: string;
  isAdmin?: boolean;
  isModerator?: boolean;
}

interface ForumOnlineUsersProps {
  users: OnlineUser[];
  totalOnline: number;
}

const rankColors: Record<string, string> = {
  'Kage': 'text-ninja-kage border-ninja-kage/30',
  'Sannin': 'text-ninja-sannin border-ninja-sannin/30',
  'Anbu': 'text-ninja-anbu border-ninja-anbu/30',
  'Jounin': 'text-ninja-jounin border-ninja-jounin/30',
  'Chunin': 'text-ninja-chunin border-ninja-chunin/30',
  'Genin': 'text-ninja-genin border-ninja-genin/30'
};

const ForumOnlineUsers = ({ users, totalOnline }: ForumOnlineUsersProps) => {
  return (
    <Card className="bg-gradient-card border-border/30 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ninja-chunin to-ninja-chunin/60 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-ninja text-sm uppercase tracking-wider">Guerreiros Online</span>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-2 h-2 bg-ninja-chunin rounded-full animate-pulse" />
                <span className="text-xs text-muted-foreground">{totalOnline} ativos agora</span>
              </div>
            </div>
          </div>
          <Wifi className="w-4 h-4 text-ninja-chunin animate-pulse" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {users.slice(0, 8).map((user) => (
            <div
              key={user.id}
              className={cn(
                "group flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300",
                "bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-border/50"
              )}
            >
              <div className="relative">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs bg-secondary">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-ninja-chunin rounded-full border-2 border-card" />
              </div>
              
              <span className={cn(
                "text-sm font-medium",
                rankColors[user.rank]?.split(' ')[0] || 'text-foreground'
              )}>
                {user.name}
              </span>
              
              {user.isAdmin && (
                <Crown className="w-3 h-3 text-ninja-kage" />
              )}
              {user.isModerator && !user.isAdmin && (
                <Shield className="w-3 h-3 text-ninja-sannin" />
              )}
            </div>
          ))}
          
          {totalOnline > 8 && (
            <Badge variant="outline" className="border-border/50 text-muted-foreground">
              +{totalOnline - 8} mais
            </Badge>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/30 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Crown className="w-3 h-3 text-ninja-kage" />
            <span>Admin</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-ninja-sannin" />
            <span>Moderador</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-ninja-chunin rounded-full" />
            <span>Online</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForumOnlineUsers;

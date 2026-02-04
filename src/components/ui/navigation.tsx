import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Trophy, Swords, Users, BookOpen, MessageCircle, User, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { NotificationsDropdown } from "@/components/ui/notifications-dropdown";
import kageArenaLogo from "@/assets/kage-arena-logo.png";

interface NavigationProps {
  currentPage?: string;
}

// Sistema de Navegação - Kage Arena
// Criado por Wall - Navegação principal com perfil do usuário
const Navigation = ({ currentPage }: NavigationProps) => {
  const location = useLocation();
  const currentPath = currentPage || location.pathname;
  const { user, signOut } = useAuth();
  const { data: currentPlayer } = usePlayerProfile(user?.id);
  
  const baseNavItems = [
    { id: "home", label: "Home", icon: Trophy, href: "/" },
    { id: "ranking", label: "Ranking", icon: Trophy, href: "/ranking" },
    { id: "challenges", label: "Desafios", icon: Swords, href: "/challenges" },
    { id: "tournaments", label: "Torneios", icon: Users, href: "/tournaments" },
    { id: "academy", label: "Academia", icon: BookOpen, href: "/academy" },
    { id: "forum", label: "Fórum", icon: MessageCircle, href: "/forum" },
  ];

  // Adicionar "Avaliações" para moderadores e "Admin" para admins
  let navItems = [...baseNavItems];
  
  if (currentPlayer?.is_moderator || currentPlayer?.is_admin) {
    navItems.push({ id: "evaluations", label: "Avaliações", icon: Settings, href: "/evaluations" });
  }
  
  if (currentPlayer?.is_admin) {
    navItems.push({ id: "admin", label: "Admin", icon: Settings, href: "/admin" });
  }

  // Dados do usuário logado
  const currentUser = user ? {
    name: currentPlayer?.name || user.user_metadata?.name || "Ninja",
    rank: currentPlayer?.rank || "Unranked",
    avatar: currentPlayer?.avatar_url,
    isModerator: currentPlayer?.is_moderator || false,
    notifications: 3
  } : null;

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
          <img 
            src={kageArenaLogo} 
            alt="Kage Arena" 
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* Menu de Navegação */}
        <div className="hidden md:flex items-center space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href || (currentPath === "/" && item.id === "home");
            
            return (
              <Button
                key={item.id}
                asChild
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "transition-all duration-200",
                  isActive && "bg-primary shadow-ninja"
                )}
              >
                <Link to={item.href}>
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </div>

        {/* Perfil do Usuário */}
        <div className="flex items-center space-x-4">
          {currentUser && (
            <>
              {/* Notificações */}
              <NotificationsDropdown />

              {/* Botão Moderador (se aplicável) */}
              {currentUser.isModerator && (
                <Button variant="secondary" size="sm" className="bg-ninja-kage/20 text-accent">
                  <Settings className="w-4 h-4 mr-2" />
                  Moderador
                </Button>
              )}
            </>
          )}

          {/* Avatar e Info do Usuário ou Botão de Login */}
          {currentUser ? (
            <div className="flex items-center space-x-2 border-l border-border pl-4">
              <Link to="/profile">
                <div className="flex items-center space-x-3 cursor-pointer hover:bg-muted/30 rounded-lg p-2 transition-all duration-200">
                  <div className="text-right hidden sm:block">
                    <div className="font-medium text-sm text-foreground">{currentUser.name}</div>
                    <div className="text-xs text-ninja-kage font-semibold">{currentUser.rank}</div>
                  </div>
                  
                  <Avatar className="w-10 h-10 ring-2 ring-ninja-kage/30 hover:ring-ninja-kage/60 transition-all duration-200">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback className="bg-gradient-kage text-background font-bold">
                      {currentUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </Link>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="ml-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="border-l border-border pl-4">
              <Button asChild>
                <Link to="/auth">Entrar</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
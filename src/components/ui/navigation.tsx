import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Trophy, Swords, Users, BookOpen, MessageCircle, User, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

interface NavigationProps {
  currentPage?: string;
}

// Sistema de Navegação - Kage Arena
// Criado por Wall - Navegação principal com perfil do usuário
const Navigation = ({ currentPage }: NavigationProps) => {
  const location = useLocation();
  const currentPath = currentPage || location.pathname;
  const navItems = [
    { id: "home", label: "Home", icon: Trophy, href: "/" },
    { id: "ranking", label: "Ranking", icon: Trophy, href: "/ranking" },
    { id: "challenges", label: "Desafios", icon: Swords, href: "/challenges" },
    { id: "tournaments", label: "Torneios", icon: Users, href: "/tournaments" },
    { id: "training", label: "Treinamento", icon: BookOpen, href: "/training" },
    { id: "forum", label: "Fórum", icon: MessageCircle, href: "/forum" },
  ];

  // Mock do usuário logado - futuramente virá do contexto de autenticação
  const currentUser = {
    name: "Wall",
    rank: "Kage",
    avatar: "/placeholder.svg",
    isModerator: true,
    notifications: 3
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo e Título */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-kage rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-background">🥷</span>
            </div>
            <div>
              <h1 className="font-ninja text-xl font-bold text-foreground">KAGE ARENA</h1>
              <p className="text-xs text-muted-foreground">Ultimate Ninja 5</p>
            </div>
          </div>
        </div>

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
          {/* Notificações */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            {currentUser.notifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0"
              >
                {currentUser.notifications}
              </Badge>
            )}
          </Button>

          {/* Botão Moderador (se aplicável) */}
          {currentUser.isModerator && (
            <Button variant="secondary" size="sm" className="bg-ninja-kage/20 text-accent">
              <Settings className="w-4 h-4 mr-2" />
              Moderador
            </Button>
          )}

          {/* Avatar e Info do Usuário */}
          <div className="flex items-center space-x-3 border-l border-border pl-4">
            <div className="text-right hidden sm:block">
              <div className="font-medium text-sm text-foreground">{currentUser.name}</div>
              <div className="text-xs text-ninja-kage font-semibold">{currentUser.rank}</div>
            </div>
            
            <Avatar className="w-10 h-10 ring-2 ring-ninja-kage/30">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback className="bg-gradient-kage text-background font-bold">
                {currentUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
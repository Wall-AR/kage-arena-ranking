import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Swords, Users, BookOpen, MessageCircle, Settings, LogOut, Shield, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { NotificationsDropdown } from "@/components/ui/notifications-dropdown";
import kageArenaLogo from "@/assets/kage-arena-logo.png";

interface NavigationProps {
  currentPage?: string;
}

const Navigation = ({ currentPage }: NavigationProps) => {
  const location = useLocation();
  const currentPath = currentPage || location.pathname;
  const { user, signOut } = useAuth();
  const { data: currentPlayer } = usePlayerProfile(user?.id);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const baseNavItems = [
    { id: "home", label: "Home", icon: Trophy, href: "/" },
    { id: "ranking", label: "Ranking", icon: Trophy, href: "/ranking" },
    { id: "challenges", label: "Desafios", icon: Swords, href: "/challenges" },
    { id: "tournaments", label: "Torneios", icon: Users, href: "/tournaments" },
    { id: "academy", label: "Academia", icon: BookOpen, href: "/academy" },
    { id: "forum", label: "Fórum", icon: MessageCircle, href: "/forum" },
  ];

  let navItems = [...baseNavItems];
  
  if (currentPlayer?.is_moderator || currentPlayer?.is_admin) {
    navItems.push({ id: "moderator", label: "Moderação", icon: Shield, href: "/moderator" });
  }
  
  if (currentPlayer?.is_admin) {
    navItems.push({ id: "admin", label: "Admin", icon: Settings, href: "/admin" });
  }

  const currentUser = user ? {
    name: currentPlayer?.name || user.user_metadata?.name || "Ninja",
    rank: currentPlayer?.rank || "Unranked",
    avatar: currentPlayer?.avatar_url,
  } : null;

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
          <img src={kageArenaLogo} alt="Kage Arena" className="h-12 w-auto object-contain" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href || (currentPath === "/" && item.id === "home");
            return (
              <Button key={item.id} asChild variant={isActive ? "default" : "ghost"} size="sm"
                className={cn("transition-all duration-200", isActive && "bg-primary shadow-ninja")}>
                <Link to={item.href}>
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {currentUser && <NotificationsDropdown />}

          {currentUser ? (
            <div className="hidden sm:flex items-center space-x-2 border-l border-border pl-3">
              <Link to="/profile">
                <div className="flex items-center space-x-3 cursor-pointer hover:bg-muted/30 rounded-lg p-2 transition-all duration-200">
                  <div className="text-right hidden md:block">
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
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="hidden sm:block border-l border-border pl-3">
              <Button asChild>
                <Link to="/auth">Entrar</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border/50 bg-card/98 backdrop-blur-md animate-in slide-in-from-top-2 duration-200">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;
              return (
                <Link key={item.id} to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all",
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"
                  )}>
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            
            <div className="border-t border-border/50 pt-3 mt-3">
              {currentUser ? (
                <div className="space-y-2">
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-muted/50">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={currentUser.avatar} />
                      <AvatarFallback className="bg-gradient-kage text-background text-sm font-bold">
                        {currentUser.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{currentUser.name}</div>
                      <div className="text-xs text-muted-foreground">{currentUser.rank}</div>
                    </div>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start px-4" 
                    onClick={() => { signOut(); setMobileMenuOpen(false); }}>
                    <LogOut className="w-4 h-4 mr-3" />
                    Sair
                  </Button>
                </div>
              ) : (
                <Button asChild className="w-full">
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Entrar</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Trophy,
  Swords,
  Users,
  BookOpen,
  MessageCircle,
  Settings,
  LogOut,
  Shield,
  Menu,
  Home,
  User as UserIcon,
  ChevronDown,
  Target,
  Crown,
} from "lucide-react";
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

  const mainNavItems = [
    { id: "home", label: "Home", icon: Home, href: "/" },
    { id: "ranking", label: "Ranking", icon: Trophy, href: "/ranking" },
    { id: "challenges", label: "Desafios", icon: Swords, href: "/challenges" },
    { id: "tournaments", label: "Torneios", icon: Users, href: "/tournaments" },
    { id: "academy", label: "Academia", icon: BookOpen, href: "/academy" },
    { id: "forum", label: "Fórum", icon: MessageCircle, href: "/forum" },
  ];

  const isModerator = !!currentPlayer?.is_moderator;
  const isAdmin = !!currentPlayer?.is_admin;

  const staffItems = [
    isModerator && { id: "moderator", label: "Moderação", icon: Shield, href: "/moderator" },
    isAdmin && { id: "admin", label: "Admin", icon: Settings, href: "/admin" },
  ].filter(Boolean) as { id: string; label: string; icon: any; href: string }[];

  const currentUser = user
    ? {
        name: currentPlayer?.name || user.user_metadata?.name || "Ninja",
        rank: currentPlayer?.rank || "Unranked",
        avatar: currentPlayer?.avatar_url,
      }
    : null;

  const isActive = (href: string) =>
    currentPath === href || (currentPath === "/" && href === "/");

  const roleBadge = isAdmin
    ? { label: "ADMIN", className: "bg-gradient-kage text-background border-0" }
    : isModerator
    ? { label: "MOD", className: "bg-ninja-chunin/20 text-ninja-chunin border-ninja-chunin/40" }
    : null;

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center shrink-0 hover:opacity-90 transition-opacity"
          aria-label="Kage Arena - Início"
        >
          <img src={kageArenaLogo} alt="Kage Arena" className="h-10 md:h-12 w-auto object-contain" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Button
                key={item.id}
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  "relative transition-all duration-200 font-medium",
                  active
                    ? "text-primary bg-primary/10 hover:bg-primary/15"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Link to={item.href}>
                  <Icon className="w-4 h-4 mr-1.5" />
                  {item.label}
                  {active && (
                    <span className="absolute -bottom-[17px] left-1/2 -translate-x-1/2 h-0.5 w-8 bg-primary rounded-full" />
                  )}
                </Link>
              </Button>
            );
          })}

          {staffItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-ninja-kage hover:text-ninja-kage hover:bg-ninja-kage/10 font-medium"
                >
                  <Shield className="w-4 h-4 mr-1.5" />
                  Staff
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">
                  Ferramentas de Staff
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {staffItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.id} asChild>
                      <Link to={item.href} className="cursor-pointer">
                        <Icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {currentUser && <NotificationsDropdown />}

          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="hidden sm:flex items-center gap-2 rounded-full pl-2 pr-1 py-1 hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Menu do usuário"
                >
                  <div className="text-right hidden md:block leading-tight">
                    <div className="font-medium text-sm text-foreground flex items-center gap-1.5 justify-end">
                      {currentUser.name}
                      {roleBadge && (
                        <Badge className={cn("text-[10px] px-1.5 py-0 h-4", roleBadge.className)}>
                          {roleBadge.label}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-ninja-kage font-semibold">{currentUser.rank}</div>
                  </div>
                  <Avatar className="w-9 h-9 ring-2 ring-ninja-kage/30 hover:ring-ninja-kage/60 transition-all">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback className="bg-gradient-kage text-background font-bold">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-semibold truncate">{currentUser.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <UserIcon className="w-4 h-4 mr-2" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/evaluations" className="cursor-pointer">
                    <Target className="w-4 h-4 mr-2" />
                    Avaliações
                  </Link>
                </DropdownMenuItem>
                {(isModerator || isAdmin) && (
                  <>
                    <DropdownMenuSeparator />
                    {isModerator && (
                      <DropdownMenuItem asChild>
                        <Link to="/moderator" className="cursor-pointer">
                          <Shield className="w-4 h-4 mr-2" />
                          Painel Moderação
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <Crown className="w-4 h-4 mr-2 text-ninja-kage" />
                          Painel Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={signOut}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="hidden sm:flex">
              <Link to="/auth">Entrar</Link>
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0 flex flex-col">
              <SheetHeader className="p-4 border-b border-border/50 text-left">
                <SheetTitle className="flex items-center gap-3">
                  <img src={kageArenaLogo} alt="Kage Arena" className="h-10 w-auto" />
                </SheetTitle>
              </SheetHeader>

              {currentUser && (
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-4 border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <Avatar className="w-12 h-12 ring-2 ring-ninja-kage/30">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback className="bg-gradient-kage text-background font-bold">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate flex items-center gap-1.5">
                      {currentUser.name}
                      {roleBadge && (
                        <Badge className={cn("text-[10px] px-1.5 py-0 h-4", roleBadge.className)}>
                          {roleBadge.label}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-ninja-kage font-semibold">{currentUser.rank}</div>
                    <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                  </div>
                </Link>
              )}

              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all min-h-11",
                        active
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground hover:bg-muted/50"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {staffItems.length > 0 && (
                  <>
                    <div className="pt-3 pb-1 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Staff
                    </div>
                    {staffItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.id}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all min-h-11",
                            active
                              ? "bg-ninja-kage/15 text-ninja-kage font-semibold"
                              : "text-foreground hover:bg-muted/50"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </>
                )}
              </div>

              <div className="border-t border-border/50 p-3">
                {currentUser ? (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      Entrar
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

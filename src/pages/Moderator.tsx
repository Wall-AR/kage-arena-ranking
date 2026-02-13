import { useAuth } from "@/hooks/useAuth";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { Loader2, Shield, Swords, Users, MessageSquare, Trophy, ClipboardCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/ui/navigation";
import ModEvaluationsTab from "@/components/moderator/ModEvaluationsTab";
import ModMatchesTab from "@/components/moderator/ModMatchesTab";
import ModPlayersTab from "@/components/moderator/ModPlayersTab";
import ModTournamentsTab from "@/components/moderator/ModTournamentsTab";
import ModForumTab from "@/components/moderator/ModForumTab";
import ModOverviewCard from "@/components/moderator/ModOverviewCard";

export default function Moderator() {
  const { user, loading: authLoading } = useAuth();
  const { data: currentPlayer, isLoading: playerLoading } = usePlayerProfile(user?.id);
  const navigate = useNavigate();

  if (authLoading || playerLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground mb-4">Você precisa estar logado.</p>
          <Button onClick={() => navigate('/auth')}>Fazer Login</Button>
        </div>
      </div>
    );
  }

  if (!currentPlayer?.is_moderator && !currentPlayer?.is_admin) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-4">Apenas moderadores podem acessar esta página.</p>
          <Button variant="outline" onClick={() => navigate('/')}>Voltar ao Início</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-ninja-sannin" />
            Painel do Moderador
          </h1>
          <p className="text-muted-foreground">
            Gerencie avaliações, partidas, torneios e moderação do fórum.
          </p>
        </div>

        <ModOverviewCard />

        <Tabs defaultValue="evaluations" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="evaluations" className="flex items-center gap-1">
              <ClipboardCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Avaliações</span>
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-1">
              <Swords className="w-4 h-4" />
              <span className="hidden sm:inline">Partidas</span>
            </TabsTrigger>
            <TabsTrigger value="players" className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Jogadores</span>
            </TabsTrigger>
            <TabsTrigger value="tournaments" className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Torneios</span>
            </TabsTrigger>
            <TabsTrigger value="forum" className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Fórum</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="evaluations"><ModEvaluationsTab /></TabsContent>
          <TabsContent value="matches"><ModMatchesTab /></TabsContent>
          <TabsContent value="players"><ModPlayersTab /></TabsContent>
          <TabsContent value="tournaments"><ModTournamentsTab /></TabsContent>
          <TabsContent value="forum"><ModForumTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

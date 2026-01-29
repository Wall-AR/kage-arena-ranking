import { useAuth } from "@/hooks/useAuth";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { Loader2, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPlayersTab } from "@/components/admin/AdminPlayersTab";
import { AdminTournamentsTab } from "@/components/admin/AdminTournamentsTab";
import { AdminEvaluationsTab } from "@/components/admin/AdminEvaluationsTab";
import { AdminAchievementsTab } from "@/components/admin/AdminAchievementsTab";
import { AdminCodesTab } from "@/components/admin/AdminCodesTab";
import { AdminForumTab } from "@/components/admin/AdminForumTab";
import { AdminStatsCard } from "@/components/admin/AdminStatsCard";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { data: currentPlayer, isLoading: playerLoading } = usePlayerProfile(user?.id);
  const navigate = useNavigate();

  // Loading states
  if (authLoading || playerLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Access control - not logged in
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
        <p className="text-muted-foreground mb-4">Você precisa estar logado para acessar esta página.</p>
        <Button onClick={() => navigate('/auth')}>Fazer Login</Button>
      </div>
    );
  }

  // Access control - not admin
  if (!currentPlayer?.is_admin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-destructive" />
        <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
        <p className="text-muted-foreground mb-4">Apenas administradores podem acessar esta página.</p>
        <Button variant="outline" onClick={() => navigate('/')}>Voltar ao Início</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          Painel Administrativo
        </h1>
        <p className="text-muted-foreground">
          Gerencie jogadores, torneios, avaliações, conquistas e muito mais.
        </p>
      </div>

      <AdminStatsCard />

      <Tabs defaultValue="players" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
          <TabsTrigger value="players">Jogadores</TabsTrigger>
          <TabsTrigger value="tournaments">Torneios</TabsTrigger>
          <TabsTrigger value="evaluations">Avaliações</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="codes">Códigos</TabsTrigger>
          <TabsTrigger value="forum">Fórum</TabsTrigger>
        </TabsList>

        <TabsContent value="players">
          <AdminPlayersTab />
        </TabsContent>

        <TabsContent value="tournaments">
          <AdminTournamentsTab />
        </TabsContent>

        <TabsContent value="evaluations">
          <AdminEvaluationsTab />
        </TabsContent>

        <TabsContent value="achievements">
          <AdminAchievementsTab />
        </TabsContent>

        <TabsContent value="codes">
          <AdminCodesTab />
        </TabsContent>

        <TabsContent value="forum">
          <AdminForumTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import Navigation from "@/components/ui/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";
import { useTournaments } from "@/hooks/useTournaments";
import { CreateTournamentDialog } from "@/components/tournaments/CreateTournamentDialog";
import { TournamentCard } from "@/components/tournaments/TournamentCard";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const TournamentSkeletons = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 3 }).map((_, i) => (
      <Skeleton key={i} className="h-64 w-full" />
    ))}
  </div>
);

export default function Tournaments() {
  const { data: tournaments, isLoading } = useTournaments();
  const { user, currentPlayer } = useAuth();

  const activeTournaments = tournaments?.filter(t => ['in_progress', 'active', 'ongoing'].includes(t.status)) || [];
  const upcomingTournaments = tournaments?.filter(t => t.status === 'registration' || t.status === 'check_in') || [];
  const completedTournaments = tournaments?.filter(t => t.status === 'completed') || [];
  const myTournaments = tournaments?.filter(t => t.created_by === user?.id) || [];
  const pendingApprovalTournaments = tournaments?.filter(t => t.status === 'pending_approval') || [];

  const isModerator = currentPlayer?.is_moderator || currentPlayer?.is_admin;
  const needsEvaluation = !!user && !!currentPlayer && !currentPlayer.is_ranked && !isModerator;
  const tabCount = 3 + (user ? 1 : 0) + (isModerator ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Trophy className="h-10 w-10 text-primary" />
              Torneios
            </h1>
            <p className="text-muted-foreground">
              Participe de torneios competitivos e ganhe recompensas exclusivas
            </p>
          </div>
          {user && <CreateTournamentDialog />}
        </div>

        {needsEvaluation && (
          <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
            Para criar ou entrar em torneios, primeiro solicite sua avaliação no{" "}
            <Link to="/profile" className="font-medium text-primary underline underline-offset-4">
              seu perfil
            </Link>
            . Enquanto isso, você ainda pode ver chaveamentos, rankings, fóruns e academia.
          </div>
        )}

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabCount}, minmax(0, 1fr))` }}>
            <TabsTrigger value="upcoming">Próximos</TabsTrigger>
            <TabsTrigger value="active">Em Andamento</TabsTrigger>
            <TabsTrigger value="completed">Finalizados</TabsTrigger>
            {user && <TabsTrigger value="my">Meus Torneios</TabsTrigger>}
            {isModerator && <TabsTrigger value="approval">Aprovar</TabsTrigger>}
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {isLoading ? (
              <TournamentSkeletons />
            ) : upcomingTournaments.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum torneio próximo</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingTournaments.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {isLoading ? (
              <TournamentSkeletons />
            ) : activeTournaments.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum torneio ativo no momento</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTournaments.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {isLoading ? (
              <TournamentSkeletons />
            ) : completedTournaments.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum torneio finalizado ainda</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedTournaments.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </div>
            )}
          </TabsContent>

          {user && (
            <TabsContent value="my" className="space-y-4">
              {isLoading ? (
                <TournamentSkeletons />
              ) : myTournaments.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Você ainda não criou nenhum torneio</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myTournaments.map((tournament) => (
                    <TournamentCard key={tournament.id} tournament={tournament} />
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          {isModerator && (
            <TabsContent value="approval" className="space-y-4">
              {isLoading ? (
                <TournamentSkeletons />
              ) : pendingApprovalTournaments.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum torneio aguardando aprovacao</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingApprovalTournaments.map((tournament) => (
                    <TournamentCard key={tournament.id} tournament={tournament} />
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

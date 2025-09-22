import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Trophy, Target, Star, Users, TrendingUp, Calendar, Shield, User, Save, Flame, Sword } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/ui/navigation";
import { SkillsRadarChart } from "@/components/profile/SkillsRadarChart";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { EvaluationRequest } from "@/components/profile/EvaluationRequest";
import { StudentsTab } from "@/components/profile/StudentsTab";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { CharacterSelector } from "@/components/profile/CharacterSelector";
import { MatchHistory } from "@/components/profile/MatchHistory";
import { EvaluationsTab } from "@/components/profile/EvaluationsTab";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { useProfileUpdate } from "@/hooks/useProfile";
import { useRankedPlayers } from "@/hooks/usePlayers";
import { cn } from "@/lib/utils";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [editedNinjaPhrase, setEditedNinjaPhrase] = useState("");
  const [editedCharacters, setEditedCharacters] = useState<string[]>([]);
  const [editedPrivacySettings, setEditedPrivacySettings] = useState<any>({});
  
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const { playerId } = useParams();
  const navigate = useNavigate();
  const { updateProfile, isUpdating } = useProfileUpdate();

  // Usar playerId da URL ou ID do usuário logado
  const targetUserId = playerId || user?.id;
  const { data: playerData, isLoading } = usePlayerProfile(targetUserId);
  const { data: allRankedPlayers = [] } = useRankedPlayers();
  const isOwnProfile = !playerId || playerId === user?.id;

  // Redirecionar para auth se não estiver logado e for próprio perfil
  useEffect(() => {
    if (!loading && !user && !playerId) {
      navigate("/auth");
    }
  }, [user, loading, playerId, navigate]);

// Dados processados do jogador
const processedPlayerData = playerData ? {
  ...playerData,
  // Mapear campos do DB para interface do componente
  points: playerData.current_points ?? playerData.points ?? 0,
  winRate: playerData.wins + playerData.losses > 0 
    ? Math.round((playerData.wins / (playerData.wins + playerData.losses)) * 100) 
    : 0,
  winStreak: playerData.win_streak || 0,
  isRanked: playerData.is_ranked,
  isAdmin: playerData.is_admin,
  isModerator: playerData.is_moderator,
  role: playerData.role,
  favoriteCharacters: Array.isArray(playerData.favorite_characters) 
    ? playerData.favorite_characters 
    : [],
  achievements: [],
  ninjaPhrase: playerData.ninja_phrase || "Esse é o meu jeito ninja de ser!",
  avatar_url: playerData.avatar_url || null,
  lastMatch: playerData.last_match_date || "Nunca",
  privacySettings: playerData.privacy_settings || { evaluation_visibility: "all" },
  // Calcular posição no ranking
  position: allRankedPlayers.findIndex(p => p.id === playerData.id) + 1 || null,
  // Pegar última avaliação se existir
  evaluation: playerData.evaluations && playerData.evaluations.length > 0 
    ? playerData.evaluations[playerData.evaluations.length - 1] 
    : null,
  tutor: playerData.evaluations && playerData.evaluations.length > 0 && playerData.evaluations[0].evaluator
    ? playerData.evaluations[0].evaluator
    : null
} : null;

// Inicializar valores de edição quando playerData carrega
useEffect(() => {
  if (processedPlayerData && isOwnProfile) {
    setEditedNinjaPhrase(processedPlayerData.ninjaPhrase || "");
    setEditedCharacters((processedPlayerData.favoriteCharacters || []).map(char => String(char)));
    setEditedPrivacySettings(processedPlayerData.privacySettings || {});
  }
}, [processedPlayerData, isOwnProfile]);

  // Se não há dados processados, mostrar loading ou erro
  if (!processedPlayerData && !isLoading && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Perfil não encontrado</h1>
          <p className="text-muted-foreground">Este jogador não foi encontrado ou não possui perfil ativo.</p>
        </div>
      </div>
    );
  }

  const player = processedPlayerData || {
    id: targetUserId || "",
    name: "Carregando...",
    rank: "Unranked",
    points: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    winStreak: 0,
    isRanked: false,
    isAdmin: false,
    isModerator: false,
    role: "player",
    favoriteCharacters: [],
    achievements: [],
    ninjaPhrase: "Esse é o meu jeito ninja de ser!",
    avatar_url: null,
    lastMatch: "Nunca",
    privacySettings: { evaluation_visibility: "all" },
    tutor: null,
    evaluation: null
  };

  // Dados das 8 habilidades ninja
  const skills = [
    { name: "Pin", value: player.evaluation?.pin_score || 0, angle: 0 },
    { name: "Defesa", value: player.evaluation?.defense_score || 0, angle: 45 },
    { name: "Aéreo", value: player.evaluation?.aerial_score || 0, angle: 90 },
    { name: "Kunai", value: player.evaluation?.kunai_score || 0, angle: 135 },
    { name: "Timing", value: player.evaluation?.timing_score || 0, angle: 180 },
    { name: "Recursos", value: player.evaluation?.resource_score || 0, angle: 225 },
    { name: "Dash", value: player.evaluation?.dash_score || 0, angle: 270 },
    { name: "Geral", value: player.evaluation?.general_score || 0, angle: 315 }
  ];

  const getRankColor = (rank: string) => {
    const colors = {
      'Kage': 'ninja-kage',
      'Sannin': 'ninja-sannin',
      'Anbu': 'ninja-anbu', 
      'Jounin': 'ninja-jounin',
      'Chunin': 'ninja-chunin',
      'Genin': 'ninja-genin',
      'Unranked': 'muted'
    };
    return colors[rank as keyof typeof colors] || 'muted';
  };

  const getAchievementIcon = (achievement: string) => {
    const icons = {
      'champion': Trophy,
      'undefeated': Target,
      'veteran': Shield,
      'streak': Flame
    };
    return icons[achievement as keyof typeof icons] || Trophy;
  };

  const rankColor = getRankColor(player.rank);

  const handleRequestEvaluation = () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para solicitar uma avaliação.",
        variant: "destructive"
      });
      return;
    }
    // A lógica está no componente EvaluationRequest
  };

  const handleSaveProfile = () => {
    if (!user?.id) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para salvar.",
        variant: "destructive"
      });
      return;
    }

    updateProfile({
      userId: user.id,
      updates: {
        ninja_phrase: editedNinjaPhrase,
        favorite_characters: editedCharacters,
        privacy_settings: editedPrivacySettings
      }
    });
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    // Avatar é atualizado automaticamente pelo componente AvatarUpload
    toast({
      title: "Avatar atualizado!",
      description: "Sua foto de perfil foi alterada com sucesso.",
    });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando perfil...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header do Perfil */}
        <ProfileHeader 
          player={player} 
          rankColor={rankColor}
        />

        {/* Conteúdo Principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${isOwnProfile && (playerData?.is_moderator || playerData?.is_admin) ? 'grid-cols-6' : 'grid-cols-5'}`}>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="evaluations">Avaliações</TabsTrigger>
            {isOwnProfile && (playerData?.is_moderator || playerData?.is_admin) && <TabsTrigger value="students">Alunos</TabsTrigger>}
            {isOwnProfile && <TabsTrigger value="settings">Configurações</TabsTrigger>}
          </TabsList>

          {/* Aba: Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Estatísticas Principais */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                    Estatísticas Chave
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-accent">{player.points}</div>
                      <div className="text-sm text-muted-foreground">Pontos</div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-ninja-jounin">{player.winRate}%</div>
                      <div className="text-sm text-muted-foreground">Taxa de Vitória</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 bg-muted/20 rounded">
                      <div className="font-semibold text-ninja-chunin">{player.wins}</div>
                      <div className="text-xs text-muted-foreground">Vitórias</div>
                    </div>
                    <div className="p-3 bg-muted/20 rounded">
                      <div className="font-semibold text-ninja-anbu">{player.losses}</div>
                      <div className="text-xs text-muted-foreground">Derrotas</div>
                    </div>
                    <div className="p-3 bg-muted/20 rounded">
                      <div className="font-semibold text-ninja-kage">{player.winStreak}</div>
                      <div className="text-xs text-muted-foreground">Sequência</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gráfico Radar de Habilidades */}
              <Card className="lg:col-span-2 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-accent" />
                    Habilidades Avaliadas
                  </CardTitle>
                  <CardDescription>Gráfico radar das 8 habilidades principais</CardDescription>
                </CardHeader>
                <CardContent>
                  {player.isRanked ? (
                    <SkillsRadarChart 
                      skills={skills} 
                      rankColor={rankColor}
                      className="transition-all duration-500"
                    />
                  ) : (
                    <div className="relative h-80 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="font-semibold">Habilidades Ocultas</p>
                        <p className="text-sm">Solicite uma avaliação para revelar suas habilidades</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Avaliação e Tutor */}
            {player.isRanked && player.tutor && (
              <Card className="border-accent/20 bg-gradient-to-br from-card to-accent/5">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-accent" />
                    Avaliação e Tutoria
                  </CardTitle>
                  <CardDescription>Resultado da avaliação oficial e informações do tutor</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/30 rounded-lg p-4 border border-accent/10">
                    <p className="text-sm leading-relaxed mb-4">
                      {player.evaluation?.tips || "Dicas de avaliação não disponíveis."}
                    </p>
                    
                    <div className="flex items-center space-x-3 pt-4 border-t border-border">
                      <Avatar className="w-10 h-10 ring-2 ring-accent/30">
                        <AvatarImage src={(player.tutor as any)?.avatar_url} alt={(player.tutor as any)?.name} />
                        <AvatarFallback className="bg-accent/20 text-accent">{(player.tutor as any)?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-sm text-accent">{(player.tutor as any)?.name}</div>
                        <div className="text-xs text-muted-foreground italic">
                          "{(player.tutor as any)?.ninja_phrase || 'Essa é minha filosofia ninja!'}"
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Solicitar Avaliação para não rankeados */}
            {!player.isRanked && isOwnProfile && user && playerData?.id && (
              <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-primary" />
                    Ingressar no Ranking
                  </CardTitle>
                  <CardDescription>
                    Solicite uma avaliação para ingressar no ranking oficial e revelar seu verdadeiro potencial ninja
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <EvaluationRequest 
                      playerId={playerData.id}
                      onRequestSent={() => {
                        toast({
                          title: "Solicitação enviada!",
                          description: "Os moderadores foram notificados e entrarão em contato em breve.",
                        });
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba: Estatísticas */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personagens Favoritos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {player.favoriteCharacters && player.favoriteCharacters.length > 0 ? (
                      player.favoriteCharacters.map((character: any, index: number) => (
                        <div key={index} className="flex items-center space-x-3 p-2 bg-muted/30 rounded">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-semibold">
                            {String(character).charAt(0)}
                          </div>
                          <span className="text-sm">{String(character)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum personagem favorito definido</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Evolução de Pontos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-2xl font-bold text-muted-foreground">Em breve</div>
                    <p className="text-sm text-muted-foreground">Gráfico de evolução</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-2xl font-bold text-muted-foreground">Em breve</div>
                    <p className="text-sm text-muted-foreground">Estatísticas mensais</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba: Histórico */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Partidas Recentes
                </CardTitle>
                <CardDescription>
                  Histórico das últimas 10 partidas disputadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {playerData?.id ? (
                  <MatchHistory playerId={playerData.id} />
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Histórico não disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Avaliações */}
          <TabsContent value="evaluations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-accent" />
                  Avaliações
                </CardTitle>
                <CardDescription>
                  Histórico de avaliações e resultados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {playerData?.id ? (
                  <EvaluationsTab 
                    playerId={playerData.id} 
                    isOwnProfile={isOwnProfile}
                    privacySettings={playerData.privacy_settings as { evaluation_visibility?: string }}
                  />
                ) : (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Avaliações não disponíveis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Alunos (apenas para moderadores) */}
          {isOwnProfile && (playerData?.is_moderator || playerData?.is_admin) && (
            <TabsContent value="students" className="space-y-6">
              {playerData?.id ? (
                <StudentsTab evaluatorId={playerData.id} />
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Dados de alunos não disponíveis</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          {/* Aba: Configurações (apenas para próprio perfil) */}
          {isOwnProfile && (
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configurações do Perfil */}
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações do Perfil</CardTitle>
                    <CardDescription>Personalize suas informações públicas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Upload de Avatar */}
                    <div className="space-y-4">
                      <Label>Avatar do Perfil</Label>
                      {user && playerData && (
                        <AvatarUpload
                          currentAvatar={player.avatar_url}
                          playerName={player.name}
                          userId={user.id}
                          playerId={playerData.id}
                          onAvatarUpdate={handleAvatarUpdate}
                        />
                      )}
                    </div>
                    
                    
                    <div className="space-y-2">
                      <Label htmlFor="phrase">Frase Ninja</Label>
                      <Textarea 
                        id="phrase" 
                        placeholder="Sua frase ninja..."
                        value={editedNinjaPhrase}
                        onChange={(e) => setEditedNinjaPhrase(e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <CharacterSelector
                      selectedCharacters={editedCharacters}
                      onCharactersChange={setEditedCharacters}
                      maxSelection={3}
                    />
                  </CardContent>
                </Card>

                {/* Configurações de Privacidade */}
                <Card>
                  <CardHeader>
                    <CardTitle>Privacidade</CardTitle>
                    <CardDescription>Controle quem pode ver suas informações</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Avaliações Visíveis</Label>
                        <div className="text-sm text-muted-foreground">
                          Permitir que outros vejam suas avaliações
                        </div>
                      </div>
                      <Switch 
                        checked={editedPrivacySettings?.evaluation_visibility === "all"}
                        onCheckedChange={(checked) => 
                          setEditedPrivacySettings(prev => ({
                            ...prev,
                            evaluation_visibility: checked ? "all" : "private"
                          }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Histórico Público</Label>
                        <div className="text-sm text-muted-foreground">
                          Mostrar histórico de partidas
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Aceitar Desafios</Label>
                        <div className="text-sm text-muted-foreground">
                          Permitir receber convites de luta
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={isUpdating}
                  className="min-w-32"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
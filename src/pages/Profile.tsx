import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Flame, Shield, User, Settings, Star, Swords, Users } from "lucide-react";
import Navigation from "@/components/ui/navigation";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { SkillsRadarChart } from "@/components/profile/SkillsRadarChart";
import { EvaluationRequest } from "@/components/profile/EvaluationRequest";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Perfil do Jogador - Kage Arena
// Criado por Wall - Sistema completo de perfil com gráfico radar e configurações
const Profile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  // Mock data para desenvolvimento - será substituído pelos dados reais
  const mockPlayer = {
    id: 1,
    name: "Wall",
    rank: "Kage",
    points: 2450,
    wins: 45,
    losses: 8,
    winRate: 84.9,
    winStreak: 7,
    avatar: "/placeholder.svg",
    ninjaPhrase: "Esse é o meu jeito ninja de ser!",
    isRanked: true,
    favoriteCharacters: ["Naruto Uzumaki", "Sasuke Uchiha", "Kakashi Hatake"],
    tutor: {
      name: "ShadowSensei",
      avatar: "/placeholder.svg",
      phrase: "O verdadeiro poder vem do conhecimento!"
    },
    evaluation: {
      pin: 9.2,
      defense: 8.8,
      aerial: 9.0,
      kunai: 8.5,
      timing: 9.5,
      resource: 8.7,
      dash: 9.1,
      general: 9.3,
      tips: "Jogador extremamente habilidoso, com excelente controle de timing e movimentação. Recomendo focar mais no uso estratégico de kunais para atingir o nível máximo.",
      evaluatedBy: "ShadowSensei",
      evaluatedAt: "2024-12-15"
    },
    achievements: ["champion", "undefeated", "veteran", "streak"],
    recentMatches: [
      { opponent: "NinjaKing", result: "win", date: "2024-01-20", score: "3-1" },
      { opponent: "FireStyle", result: "win", date: "2024-01-18", score: "3-0" },
      { opponent: "ShadowClone", result: "win", date: "2024-01-16", score: "3-2" }
    ]
  };

  // Hook para buscar dados do jogador
  const { data: playerData, isLoading } = usePlayerProfile(currentUser?.id);
  
  // Transformar dados do Supabase para formato esperado
  const transformPlayerData = (data: any) => {
    if (!data) return mockPlayer;
    
    const latestEvaluation = data.evaluations?.[0];
    const winRate = data.wins + data.losses > 0 ? (data.wins / (data.wins + data.losses)) * 100 : 0;
    
    return {
      ...data,
      winRate: parseFloat(winRate.toFixed(1)),
      winStreak: data.win_streak || 0,
      ninjaPhrase: data.ninja_phrase || "Esse é o meu jeito ninja de ser!",
      isRanked: data.is_ranked || false,
      favoriteCharacters: Array.isArray(data.favorite_characters) ? data.favorite_characters : ["Naruto Uzumaki", "Sasuke Uchiha"],
      achievements: data.is_ranked ? ["champion", "veteran"] : [],
      recentMatches: [],
      avatar: data.avatar_url,
      evaluation: latestEvaluation ? {
        pin: latestEvaluation.pin_score || 0,
        defense: latestEvaluation.defense_score || 0, 
        aerial: latestEvaluation.aerial_score || 0,
        kunai: latestEvaluation.kunai_score || 0,
        timing: latestEvaluation.timing_score || 0,
        resource: latestEvaluation.resource_score || 0,
        dash: latestEvaluation.dash_score || 0,
        general: latestEvaluation.general_score || 0,
        tips: latestEvaluation.tips || "",
        evaluatedBy: latestEvaluation.evaluator?.name || "",
        evaluatedAt: latestEvaluation.evaluated_at || ""
      } : null,
      tutor: latestEvaluation?.evaluator ? {
        name: latestEvaluation.evaluator.name || "",
        avatar: latestEvaluation.evaluator.avatar_url || "",
        phrase: latestEvaluation.evaluator.ninja_phrase || ""
      } : null
    };
  };
  
  // Usar dados reais se disponível, senão usar mock
  const player = transformPlayerData(playerData);

  useEffect(() => {
    // Verificar usuário logado
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Gráfico Radar - 8 habilidades
  const skills = [
    { name: "Pin", value: player.evaluation?.pin || 0, angle: 0 },
    { name: "Kawarime", value: player.evaluation?.defense || 0, angle: 45 },
    { name: "Jogo Aéreo", value: player.evaluation?.aerial || 0, angle: 90 },
    { name: "Kunai", value: player.evaluation?.kunai || 0, angle: 135 },
    { name: "Timing", value: player.evaluation?.timing || 0, angle: 180 },
    { name: "Recursos", value: player.evaluation?.resource || 0, angle: 225 },
    { name: "Dash", value: player.evaluation?.dash || 0, angle: 270 },
    { name: "Malícia", value: player.evaluation?.general || 0, angle: 315 }
  ];

  const getRankColor = (rank: string) => {
    const colors = {
      'Kage': 'ninja-kage',
      'Sannin': 'ninja-sannin',
      'Anbu': 'ninja-anbu',
      'Jounin': 'ninja-jounin',
      'Chunin': 'ninja-chunin',
      'Genin': 'ninja-genin'
    };
    return colors[rank as keyof typeof colors] || 'ninja-genin';
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
    if (!currentUser) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para solicitar uma avaliação.",
        variant: "destructive"
      });
      return;
    }
    // A lógica está no componente EvaluationRequest
  };

  if (isLoading) {
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
          onRequestEvaluation={handleRequestEvaluation}
        />

        {/* Abas do Perfil */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Aba: Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Estatísticas Principais */}
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas Principais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-ninja-chunin">{player.wins}</div>
                      <div className="text-sm text-muted-foreground">Vitórias</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-ninja-anbu">{player.losses}</div>
                      <div className="text-sm text-muted-foreground">Derrotas</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Taxa de Vitória</span>
                      <span className="text-sm font-bold text-ninja-jounin">{player.winRate}%</span>
                    </div>
                    <Progress value={player.winRate} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-muted-foreground">Sequência Atual</span>
                    <div className="flex items-center space-x-1">
                      <Flame className="w-4 h-4 text-accent" />
                      <span className="font-bold text-accent">{player.winStreak}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gráfico Radar de Habilidades */}
              <Card className="overflow-hidden">
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
                    <div className="relative h-64 flex items-center justify-center">
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
                      {player.evaluation.tips}
                    </p>
                    
                    <div className="flex items-center space-x-3 pt-4 border-t border-border">
                      <Avatar className="w-10 h-10 ring-2 ring-accent/30">
                        <AvatarImage src={player.tutor.avatar} alt={player.tutor.name} />
                        <AvatarFallback className="bg-accent/20 text-accent">{player.tutor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-sm text-accent">{player.tutor.name}</div>
                        <div className="text-xs text-muted-foreground italic">
                          "{player.tutor.phrase}"
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Solicitar Avaliação para não rankeados */}
            {!player.isRanked && currentUser && (
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
                      playerId={playerData?.id || ""}
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
                  <CardTitle>Evolução de Pontos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-2xl font-bold text-muted-foreground">
                      Gráfico em breve
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Personagens Favoritos</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-3">
                  {player.favoriteCharacters?.map((character, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-sm font-bold">
                        {typeof character === 'string' ? character.charAt(0) : '?'}
                      </div>
                      <span className="text-sm">{typeof character === 'string' ? character : 'Personagem'}</span>
                    </div>
                  )) || (
                    <div className="text-center text-muted-foreground py-4">
                      <p>Nenhum personagem favorito definido</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-2xl font-bold text-muted-foreground">
                      Dados em breve
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba: Histórico */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Partidas Recentes</CardTitle>
              </CardHeader>
               <CardContent>
                 <div className="space-y-3">
                   {player.recentMatches?.length > 0 ? player.recentMatches.map((match, index) => (
                     <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                       <div className="flex items-center space-x-3">
                         <Badge variant={match.result === "win" ? "default" : "destructive"}>
                           {match.result === "win" ? "Vitória" : "Derrota"}
                         </Badge>
                         <span className="font-medium">vs {match.opponent}</span>
                       </div>
                       <div className="text-right">
                         <div className="font-bold">{match.score}</div>
                         <div className="text-sm text-muted-foreground">{match.date}</div>
                       </div>
                     </div>
                   )) : (
                     <div className="text-center text-muted-foreground py-8">
                       <p>Nenhuma partida registrada ainda</p>
                       <p className="text-sm mt-2">Suas partidas aparecerão aqui quando você começar a jogar</p>
                     </div>
                   )}
                 </div>
               </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Configurações */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="avatar">Avatar (URL)</Label>
                    <Input id="avatar" placeholder="https://..." />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phrase">Frase Ninja</Label>
                    <Input id="phrase" placeholder="Sua frase de efeito..." />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Personagens Favoritos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Personagem 1</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um personagem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="naruto">Naruto Uzumaki</SelectItem>
                        <SelectItem value="sasuke">Sasuke Uchiha</SelectItem>
                        <SelectItem value="kakashi">Kakashi Hatake</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Personagem 2</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um personagem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="naruto">Naruto Uzumaki</SelectItem>
                        <SelectItem value="sasuke">Sasuke Uchiha</SelectItem>
                        <SelectItem value="kakashi">Kakashi Hatake</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Personagem 3</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um personagem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="naruto">Naruto Uzumaki</SelectItem>
                        <SelectItem value="sasuke">Sasuke Uchiha</SelectItem>
                        <SelectItem value="kakashi">Kakashi Hatake</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Privacidade</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Visibilidade das Avaliações</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Quem pode ver suas avaliações?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="chunin">Chunin+</SelectItem>
                        <SelectItem value="jounin">Jounin+</SelectItem>
                        <SelectItem value="kage">Apenas Kages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {!player.isRanked && currentUser && (
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="w-5 h-5 mr-2 text-primary" />
                      Solicitar Avaliação
                    </CardTitle>
                    <CardDescription>
                      Solicite uma avaliação para ingressar no ranking oficial
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EvaluationRequest 
                      playerId={playerData?.id || ""}
                      onRequestSent={() => {
                        toast({
                          title: "Solicitação enviada!",
                          description: "Os moderadores foram notificados.",
                        });
                      }}
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex justify-end">
              <Button>Salvar Configurações</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
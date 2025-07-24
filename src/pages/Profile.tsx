import { useState } from "react";
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
import { Trophy, Target, Flame, Shield, User, Settings, Star, Swords } from "lucide-react";
import Navigation from "@/components/ui/navigation";
import { cn } from "@/lib/utils";

// Perfil do Jogador - Kage Arena
// Criado por Wall - Sistema completo de perfil com gráfico radar e configurações
const Profile = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - futuramente virá do backend
  const player = {
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

  // Gráfico Radar - 8 habilidades
  const skills = [
    { name: "Pin", value: player.evaluation.pin, angle: 0 },
    { name: "Kawarime", value: player.evaluation.defense, angle: 45 },
    { name: "Jogo Aéreo", value: player.evaluation.aerial, angle: 90 },
    { name: "Kunai", value: player.evaluation.kunai, angle: 135 },
    { name: "Timing", value: player.evaluation.timing, angle: 180 },
    { name: "Recursos", value: player.evaluation.resource, angle: 225 },
    { name: "Dash", value: player.evaluation.dash, angle: 270 },
    { name: "Malícia", value: player.evaluation.general, angle: 315 }
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header do Perfil */}
        <div className="bg-gradient-card rounded-xl p-8 border border-border/50 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Avatar className={cn(
                "w-24 h-24 ring-4 transition-all duration-300",
                `ring-${rankColor}/60`
              )}>
                <AvatarImage src={player.avatar} alt={player.name} />
                <AvatarFallback className={cn(
                  "text-2xl font-bold",
                  `bg-${rankColor}/20 text-${rankColor}`
                )}>
                  {player.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div>
                <h1 className="font-ninja text-3xl font-bold text-foreground mb-2">
                  {player.name}
                </h1>
                <Badge variant="secondary" className={cn(
                  "text-lg px-4 py-2 font-bold mb-3",
                  `bg-${rankColor}/20 text-${rankColor} border-${rankColor}/30`
                )}>
                  {player.rank}
                </Badge>
                <p className="text-muted-foreground italic">
                  "{player.ninjaPhrase}"
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-4xl font-ninja font-bold text-accent mb-1">
                {player.points}
              </div>
              <div className="text-sm text-muted-foreground">pontos</div>
            </div>
          </div>

          {/* Conquistas */}
          <div className="flex items-center space-x-2 mt-6">
            <span className="text-sm text-muted-foreground mr-2">Conquistas:</span>
            {player.achievements.map((achievement, index) => {
              const Icon = getAchievementIcon(achievement);
              return (
                <div key={index} className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  `bg-${rankColor}/20 text-${rankColor}`
                )}>
                  <Icon className="w-4 h-4" />
                </div>
              );
            })}
          </div>
        </div>

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
              <Card>
                <CardHeader>
                  <CardTitle>Habilidades Avaliadas</CardTitle>
                  <CardDescription>Gráfico radar das 8 habilidades principais</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full h-64 flex items-center justify-center">
                    <svg width="240" height="240" className="transform -rotate-90">
                      {/* Grid do radar */}
                      {[2, 4, 6, 8, 10].map((level) => (
                        <circle
                          key={level}
                          cx="120"
                          cy="120"
                          r={level * 10}
                          fill="none"
                          stroke="hsl(var(--border))"
                          strokeWidth="1"
                          opacity="0.3"
                        />
                      ))}
                      
                      {/* Linhas dos eixos */}
                      {skills.map((skill, index) => {
                        const angle = (skill.angle * Math.PI) / 180;
                        const x = 120 + Math.cos(angle) * 100;
                        const y = 120 + Math.sin(angle) * 100;
                        return (
                          <line
                            key={index}
                            x1="120"
                            y1="120"
                            x2={x}
                            y2={y}
                            stroke="hsl(var(--border))"
                            strokeWidth="1"
                            opacity="0.3"
                          />
                        );
                      })}

                      {/* Polígono das habilidades */}
                      <polygon
                        points={skills.map(skill => {
                          const angle = (skill.angle * Math.PI) / 180;
                          const radius = (skill.value / 10) * 100;
                          const x = 120 + Math.cos(angle) * radius;
                          const y = 120 + Math.sin(angle) * radius;
                          return `${x},${y}`;
                        }).join(' ')}
                        fill={`hsl(var(--${rankColor}) / 0.3)`}
                        stroke={`hsl(var(--${rankColor}))`}
                        strokeWidth="2"
                      />

                      {/* Pontos das habilidades */}
                      {skills.map((skill, index) => {
                        const angle = (skill.angle * Math.PI) / 180;
                        const radius = (skill.value / 10) * 100;
                        const x = 120 + Math.cos(angle) * radius;
                        const y = 120 + Math.sin(angle) * radius;
                        return (
                          <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="4"
                            fill={`hsl(var(--${rankColor}))`}
                          />
                        );
                      })}
                    </svg>

                    {/* Labels das habilidades */}
                    {skills.map((skill, index) => {
                      const angle = (skill.angle * Math.PI) / 180;
                      const x = 120 + Math.cos(angle) * 130;
                      const y = 120 + Math.sin(angle) * 130;
                      
                      return (
                        <div
                          key={index}
                          className="absolute text-xs font-semibold text-center"
                          style={{
                            left: `${x - 25}px`,
                            top: `${y - 10}px`,
                            width: '50px'
                          }}
                        >
                          {skill.name}
                          <div className="text-accent font-bold">{skill.value.toFixed(1)}</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Avaliação e Tutor */}
            {player.tutor && (
              <Card>
                <CardHeader>
                  <CardTitle>Avaliação e Tutoria</CardTitle>
                  <CardDescription>Resultado da avaliação oficial e informações do tutor</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm leading-relaxed mb-4">
                      {player.evaluation.tips}
                    </p>
                    
                    <div className="flex items-center space-x-3 pt-4 border-t border-border">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={player.tutor.avatar} alt={player.tutor.name} />
                        <AvatarFallback>{player.tutor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-sm">{player.tutor.name}</div>
                        <div className="text-xs text-muted-foreground italic">
                          "{player.tutor.phrase}"
                        </div>
                      </div>
                    </div>
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
                  {player.favoriteCharacters.map((character, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-sm font-bold">
                        {character.charAt(0)}
                      </div>
                      <span className="text-sm">{character}</span>
                    </div>
                  ))}
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
                  {player.recentMatches.map((match, index) => (
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
                  ))}
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

              {!player.isRanked && (
                <Card>
                  <CardHeader>
                    <CardTitle>Solicitar Avaliação</CardTitle>
                    <CardDescription>
                      Solicite uma avaliação para ingressar no ranking oficial
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="request">Mensagem para os avaliadores</Label>
                      <Textarea 
                        id="request"
                        placeholder="Conte um pouco sobre sua experiência e por que quer ser avaliado..."
                        rows={4}
                      />
                    </div>
                    <Button className="w-full">
                      <Star className="w-4 h-4 mr-2" />
                      Solicitar Avaliação
                    </Button>
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
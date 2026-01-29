import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Award, Loader2, Plus, Trash2, Edit, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Achievement {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  category: string;
  color: string;
  icon: string;
}

interface Banner {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  category: string;
  rarity: string;
  image_url: string;
  is_available: boolean;
}

export function AdminAchievementsTab() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const { toast } = useToast();

  // Achievement form state
  const [achievementForm, setAchievementForm] = useState({
    name: "",
    display_name: "",
    description: "",
    category: "special",
    color: "gold",
    icon: "trophy"
  });

  // Banner form state
  const [bannerForm, setBannerForm] = useState({
    name: "",
    display_name: "",
    description: "",
    category: "general",
    rarity: "common",
    image_url: "",
    is_available: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [achievementsRes, bannersRes] = await Promise.all([
        supabase.from('achievements').select('*').order('created_at', { ascending: false }),
        supabase.from('banners').select('*').order('created_at', { ascending: false })
      ]);

      if (achievementsRes.error) throw achievementsRes.error;
      if (bannersRes.error) throw bannersRes.error;

      setAchievements(achievementsRes.data || []);
      setBanners(bannersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro ao carregar dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAchievement = async () => {
    try {
      const { error } = await supabase
        .from('achievements')
        .insert([achievementForm]);

      if (error) throw error;

      toast({ title: "Conquista criada!" });
      setDialogOpen(false);
      setAchievementForm({
        name: "",
        display_name: "",
        description: "",
        category: "special",
        color: "gold",
        icon: "trophy"
      });
      fetchData();
    } catch (error) {
      console.error('Error creating achievement:', error);
      toast({
        title: "Erro ao criar conquista",
        variant: "destructive"
      });
    }
  };

  const deleteAchievement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Conquista excluída!" });
      fetchData();
    } catch (error) {
      console.error('Error deleting achievement:', error);
      toast({
        title: "Erro ao excluir conquista",
        variant: "destructive"
      });
    }
  };

  const createBanner = async () => {
    try {
      const { error } = await supabase
        .from('banners')
        .insert([bannerForm]);

      if (error) throw error;

      toast({ title: "Banner criado!" });
      setBannerDialogOpen(false);
      setBannerForm({
        name: "",
        display_name: "",
        description: "",
        category: "general",
        rarity: "common",
        image_url: "",
        is_available: true
      });
      fetchData();
    } catch (error) {
      console.error('Error creating banner:', error);
      toast({
        title: "Erro ao criar banner",
        variant: "destructive"
      });
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Banner excluído!" });
      fetchData();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast({
        title: "Erro ao excluir banner",
        variant: "destructive"
      });
    }
  };

  const toggleBannerAvailability = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ is_available: !currentValue })
        .eq('id', id);

      if (error) throw error;

      toast({ title: !currentValue ? "Banner ativado!" : "Banner desativado!" });
      fetchData();
    } catch (error) {
      console.error('Error toggling banner:', error);
      toast({
        title: "Erro ao atualizar banner",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Conquistas e Banners
        </CardTitle>
        <CardDescription>
          Gerencie conquistas e banners disponíveis no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="achievements">
          <TabsList className="mb-4">
            <TabsTrigger value="achievements">Conquistas ({achievements.length})</TabsTrigger>
            <TabsTrigger value="banners">Banners ({banners.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements">
            <div className="mb-4 flex justify-end">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Conquista
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Conquista</DialogTitle>
                    <DialogDescription>
                      Preencha os dados da nova conquista
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Nome (interno)</Label>
                      <Input
                        value={achievementForm.name}
                        onChange={(e) => setAchievementForm({...achievementForm, name: e.target.value})}
                        placeholder="primeiro_lugar"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Nome de Exibição</Label>
                      <Input
                        value={achievementForm.display_name}
                        onChange={(e) => setAchievementForm({...achievementForm, display_name: e.target.value})}
                        placeholder="Primeiro Lugar"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Descrição</Label>
                      <Textarea
                        value={achievementForm.description}
                        onChange={(e) => setAchievementForm({...achievementForm, description: e.target.value})}
                        placeholder="Conquistou o primeiro lugar..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Categoria</Label>
                        <Select
                          value={achievementForm.category}
                          onValueChange={(value) => setAchievementForm({...achievementForm, category: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="special">Especial</SelectItem>
                            <SelectItem value="tournament">Torneio</SelectItem>
                            <SelectItem value="ranking">Ranking</SelectItem>
                            <SelectItem value="social">Social</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Cor</Label>
                        <Select
                          value={achievementForm.color}
                          onValueChange={(value) => setAchievementForm({...achievementForm, color: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gold">Dourado</SelectItem>
                            <SelectItem value="silver">Prata</SelectItem>
                            <SelectItem value="bronze">Bronze</SelectItem>
                            <SelectItem value="purple">Roxo</SelectItem>
                            <SelectItem value="blue">Azul</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Ícone</Label>
                      <Input
                        value={achievementForm.icon}
                        onChange={(e) => setAchievementForm({...achievementForm, icon: e.target.value})}
                        placeholder="trophy, medal, star..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={createAchievement}>Criar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p>Carregando...</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Cor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {achievements.map((achievement) => (
                      <TableRow key={achievement.id}>
                        <TableCell>
                          <div>
                            <span className="font-medium">{achievement.display_name}</span>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{achievement.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge style={{ backgroundColor: achievement.color === 'gold' ? '#FFD700' : achievement.color }}>
                            {achievement.color}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteAchievement(achievement.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="banners">
            <div className="mb-4 flex justify-end">
              <Dialog open={bannerDialogOpen} onOpenChange={setBannerDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Banner
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Banner</DialogTitle>
                    <DialogDescription>
                      Preencha os dados do novo banner
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Nome (interno)</Label>
                      <Input
                        value={bannerForm.name}
                        onChange={(e) => setBannerForm({...bannerForm, name: e.target.value})}
                        placeholder="banner_naruto"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Nome de Exibição</Label>
                      <Input
                        value={bannerForm.display_name}
                        onChange={(e) => setBannerForm({...bannerForm, display_name: e.target.value})}
                        placeholder="Banner Naruto"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>URL da Imagem</Label>
                      <Input
                        value={bannerForm.image_url}
                        onChange={(e) => setBannerForm({...bannerForm, image_url: e.target.value})}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Descrição</Label>
                      <Textarea
                        value={bannerForm.description}
                        onChange={(e) => setBannerForm({...bannerForm, description: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Categoria</Label>
                        <Select
                          value={bannerForm.category}
                          onValueChange={(value) => setBannerForm({...bannerForm, category: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">Geral</SelectItem>
                            <SelectItem value="tournament">Torneio</SelectItem>
                            <SelectItem value="event">Evento</SelectItem>
                            <SelectItem value="special">Especial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Raridade</Label>
                        <Select
                          value={bannerForm.rarity}
                          onValueChange={(value) => setBannerForm({...bannerForm, rarity: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="common">Comum</SelectItem>
                            <SelectItem value="rare">Raro</SelectItem>
                            <SelectItem value="epic">Épico</SelectItem>
                            <SelectItem value="legendary">Lendário</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setBannerDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={createBanner}>Criar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p>Carregando...</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Banner</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Raridade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {banners.map((banner) => (
                      <TableRow key={banner.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {banner.image_url && (
                              <img src={banner.image_url} alt={banner.display_name} className="w-12 h-8 object-cover rounded" />
                            )}
                            <div>
                              <span className="font-medium">{banner.display_name}</span>
                              <p className="text-sm text-muted-foreground">{banner.description}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{banner.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{banner.rarity}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={banner.is_available ? "bg-green-500/20 text-green-700" : "bg-gray-500/20 text-gray-700"}>
                            {banner.is_available ? "Disponível" : "Indisponível"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleBannerAvailability(banner.id, banner.is_available ?? true)}
                            >
                              {banner.is_available ? "Desativar" : "Ativar"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteBanner(banner.id)}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

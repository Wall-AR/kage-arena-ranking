import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Ticket, Loader2, Plus, Trash2, Copy, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RedemptionCode {
  id: string;
  code: string;
  banner_id: string | null;
  achievement_id: string | null;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface Achievement {
  id: string;
  display_name: string;
}

interface Banner {
  id: string;
  display_name: string;
}

export function AdminCodesTab() {
  const [codes, setCodes] = useState<RedemptionCode[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [codeForm, setCodeForm] = useState({
    code: "",
    banner_id: "",
    achievement_id: "",
    max_uses: "",
    expires_at: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [codesRes, achievementsRes, bannersRes] = await Promise.all([
        supabase.from('redemption_codes').select('*').order('created_at', { ascending: false }),
        supabase.from('achievements').select('id, display_name'),
        supabase.from('banners').select('id, display_name')
      ]);

      if (codesRes.error) throw codesRes.error;

      setCodes(codesRes.data || []);
      setAchievements(achievementsRes.data || []);
      setBanners(bannersRes.data || []);
    } catch (error) {
      console.error('Error fetching codes:', error);
      toast({
        title: "Erro ao carregar códigos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCodeForm({...codeForm, code});
  };

  const createCode = async () => {
    try {
      const payload: any = {
        code: codeForm.code.toUpperCase(),
        is_active: true,
        current_uses: 0
      };

      if (codeForm.banner_id) payload.banner_id = codeForm.banner_id;
      if (codeForm.achievement_id) payload.achievement_id = codeForm.achievement_id;
      if (codeForm.max_uses) payload.max_uses = parseInt(codeForm.max_uses);
      if (codeForm.expires_at) payload.expires_at = new Date(codeForm.expires_at).toISOString();

      const { error } = await supabase
        .from('redemption_codes')
        .insert([payload]);

      if (error) throw error;

      toast({ title: "Código criado!" });
      setDialogOpen(false);
      setCodeForm({
        code: "",
        banner_id: "",
        achievement_id: "",
        max_uses: "",
        expires_at: ""
      });
      fetchData();
    } catch (error: any) {
      console.error('Error creating code:', error);
      toast({
        title: "Erro ao criar código",
        description: error.message?.includes("duplicate") ? "Este código já existe" : undefined,
        variant: "destructive"
      });
    }
  };

  const deleteCode = async (id: string) => {
    try {
      const { error } = await supabase
        .from('redemption_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Código excluído!" });
      fetchData();
    } catch (error) {
      console.error('Error deleting code:', error);
      toast({
        title: "Erro ao excluir código",
        variant: "destructive"
      });
    }
  };

  const toggleCodeStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('redemption_codes')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({ title: !currentStatus ? "Código ativado!" : "Código desativado!" });
      fetchData();
    } catch (error) {
      console.error('Error toggling code:', error);
      toast({
        title: "Erro ao atualizar código",
        variant: "destructive"
      });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Código copiado!" });
  };

  const getRewardLabel = (code: RedemptionCode) => {
    const rewards = [];
    if (code.banner_id) {
      const banner = banners.find(b => b.id === code.banner_id);
      rewards.push(`Banner: ${banner?.display_name || 'Desconhecido'}`);
    }
    if (code.achievement_id) {
      const achievement = achievements.find(a => a.id === code.achievement_id);
      rewards.push(`Conquista: ${achievement?.display_name || 'Desconhecida'}`);
    }
    return rewards.length > 0 ? rewards.join(', ') : 'Nenhuma recompensa';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="w-5 h-5" />
          Códigos de Resgate ({codes.length})
        </CardTitle>
        <CardDescription>
          Crie e gerencie códigos que desbloqueiam conquistas e banners
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-end">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Código
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Código de Resgate</DialogTitle>
                <DialogDescription>
                  Configure o código e suas recompensas
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Código</Label>
                  <div className="flex gap-2">
                    <Input
                      value={codeForm.code}
                      onChange={(e) => setCodeForm({...codeForm, code: e.target.value.toUpperCase()})}
                      placeholder="CODIGO123"
                      className="uppercase"
                    />
                    <Button variant="outline" onClick={generateRandomCode}>
                      Gerar
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Banner (opcional)</Label>
                  <Select
                    value={codeForm.banner_id}
                    onValueChange={(value) => setCodeForm({...codeForm, banner_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um banner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {banners.map((banner) => (
                        <SelectItem key={banner.id} value={banner.id}>
                          {banner.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Conquista (opcional)</Label>
                  <Select
                    value={codeForm.achievement_id}
                    onValueChange={(value) => setCodeForm({...codeForm, achievement_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma conquista" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma</SelectItem>
                      {achievements.map((achievement) => (
                        <SelectItem key={achievement.id} value={achievement.id}>
                          {achievement.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Máximo de usos (opcional)</Label>
                    <Input
                      type="number"
                      value={codeForm.max_uses}
                      onChange={(e) => setCodeForm({...codeForm, max_uses: e.target.value})}
                      placeholder="Ilimitado"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Expira em (opcional)</Label>
                    <Input
                      type="datetime-local"
                      value={codeForm.expires_at}
                      onChange={(e) => setCodeForm({...codeForm, expires_at: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button onClick={createCode} disabled={!codeForm.code}>Criar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p>Carregando códigos...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Recompensa</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead>Expira em</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold">{code.code}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => copyCode(code.code)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{getRewardLabel(code)}</TableCell>
                    <TableCell>
                      {code.current_uses}/{code.max_uses ?? '∞'}
                    </TableCell>
                    <TableCell>
                      {code.expires_at ? (
                        format(new Date(code.expires_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                      ) : (
                        <span className="text-muted-foreground">Nunca</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {code.is_active ? (
                        <Badge className="bg-green-500/20 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-500/20 text-gray-700">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleCodeStatus(code.id, code.is_active ?? true)}
                        >
                          {code.is_active ? "Desativar" : "Ativar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteCode(code.id)}
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
      </CardContent>
    </Card>
  );
}

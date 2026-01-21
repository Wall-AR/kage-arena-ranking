import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { useCreateTournament } from "@/hooks/useTournaments";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const RANKS = ["Unranked", "Genin", "Chunnin", "Jounnin", "Anbu", "Sanin", "Kage"];

export function CreateTournamentDialog() {
  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tournament_type: "single_elimination",
    max_participants: 16,
    registration_start: "",
    registration_end: "",
    tournament_start: "",
    check_in_start: "",
    check_in_end: "",
    min_rank: "",
    max_rank: "",
    require_top_character: false,
    required_character: "",
    rules_text: "",
  });

  const { toast } = useToast();
  const { user, currentPlayer } = useAuth();
  const createTournament = useCreateTournament();

  const canCreate = useMemo(() => {
    // Regra de negócio: apenas moderador/admin pode criar.
    // Regra técnica: created_by precisa ser auth user id.
    return !!user?.id && !!(currentPlayer?.is_moderator || currentPlayer?.is_admin);
  }, [currentPlayer?.is_admin, currentPlayer?.is_moderator, user?.id]);

  const toIsoOrNull = (value: string) => {
    if (!value) return null;
    const iso = new Date(value).toISOString();
    return iso;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // created_by referencia o usuário autenticado (auth.users.id), não o players.id
    const createdBy = user?.id;

    if (!createdBy) {
      toast({
        title: "Faça login para criar torneio",
        description: "Você precisa estar autenticado para criar um torneio.",
        variant: "destructive",
      });
      return;
    }

    if (!canCreate) {
      toast({
        title: "Sem permissão",
        description: "Apenas moderadores/admins podem criar torneios.",
        variant: "destructive",
      });
      return;
    }

    const registrationStartIso = toIsoOrNull(formData.registration_start);
    const registrationEndIso = toIsoOrNull(formData.registration_end);
    const tournamentStartIso = toIsoOrNull(formData.tournament_start);
    const checkInStartIso = toIsoOrNull(formData.check_in_start);
    const checkInEndIso = toIsoOrNull(formData.check_in_end);

    // Validações básicas (evita inserts inválidos e bugs de agenda)
    if (!registrationStartIso || !registrationEndIso || !tournamentStartIso) {
      toast({
        title: "Datas obrigatórias",
        description: "Preencha início/fim das inscrições e início do torneio.",
        variant: "destructive",
      });
      return;
    }

    if (new Date(registrationEndIso).getTime() <= new Date(registrationStartIso).getTime()) {
      toast({
        title: "Datas inválidas",
        description: "O fim das inscrições precisa ser depois do início.",
        variant: "destructive",
      });
      return;
    }

    if (new Date(tournamentStartIso).getTime() < new Date(registrationEndIso).getTime()) {
      toast({
        title: "Datas inválidas",
        description: "O início do torneio precisa ser depois do fim das inscrições.",
        variant: "destructive",
      });
      return;
    }

    if (checkInStartIso && checkInEndIso) {
      if (new Date(checkInEndIso).getTime() <= new Date(checkInStartIso).getTime()) {
        toast({
          title: "Check-in inválido",
          description: "O fim do check-in precisa ser depois do início.",
          variant: "destructive",
        });
        return;
      }

      if (new Date(checkInEndIso).getTime() > new Date(tournamentStartIso).getTime()) {
        toast({
          title: "Check-in inválido",
          description: "O check-in deve terminar antes do início do torneio.",
          variant: "destructive",
        });
        return;
      }
    }

    let imageUrl = null;

    // Upload da imagem se houver
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('Temas')
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error('Erro ao fazer upload:', uploadError);
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('Temas')
          .getPublicUrl(fileName);
        imageUrl = publicUrl;
      }
    }

    const payload = {
      ...formData,
      // Converter datetime-local para ISO (backend espera timestamp)
      registration_start: registrationStartIso,
      registration_end: registrationEndIso,
      tournament_start: tournamentStartIso,
      check_in_start: checkInStartIso,
      check_in_end: checkInEndIso,
      image_url: imageUrl,
      created_by: createdBy,
      status: "registration",
      // Normalizações para o schema (NULL ao invés de string vazia)
      min_rank: formData.min_rank || null,
      max_rank: formData.max_rank || null,
      required_character: formData.require_top_character ? (formData.required_character || null) : null,
    };

    console.debug("[tournaments] create payload", payload);

    await createTournament.mutateAsync(payload);

    setOpen(false);
    setFormData({
      name: "",
      description: "",
      tournament_type: "single_elimination",
      max_participants: 16,
      registration_start: "",
      registration_end: "",
      tournament_start: "",
      check_in_start: "",
      check_in_end: "",
      min_rank: "",
      max_rank: "",
      require_top_character: false,
      required_character: "",
      rules_text: "",
    });
    setImageFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Criar Torneio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Torneio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Nome do Torneio</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="image">Imagem do Torneio</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <Label htmlFor="tournament_type">Tipo</Label>
              <Select
                value={formData.tournament_type}
                onValueChange={(value) => setFormData({ ...formData, tournament_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_elimination">Eliminação Simples</SelectItem>
                  <SelectItem value="double_elimination">Eliminação Dupla</SelectItem>
                  <SelectItem value="round_robin">Round Robin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="max_participants">Máx. Participantes</Label>
              <Select
                value={formData.max_participants.toString()}
                onValueChange={(value) => setFormData({ ...formData, max_participants: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="16">16</SelectItem>
                  <SelectItem value="32">32</SelectItem>
                  <SelectItem value="64">64</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="registration_start">Início das Inscrições</Label>
              <Input
                id="registration_start"
                type="datetime-local"
                value={formData.registration_start}
                onChange={(e) => setFormData({ ...formData, registration_start: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="registration_end">Fim das Inscrições</Label>
              <Input
                id="registration_end"
                type="datetime-local"
                value={formData.registration_end}
                onChange={(e) => setFormData({ ...formData, registration_end: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="check_in_start">Início do Check-in</Label>
              <Input
                id="check_in_start"
                type="datetime-local"
                value={formData.check_in_start}
                onChange={(e) => setFormData({ ...formData, check_in_start: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="check_in_end">Fim do Check-in</Label>
              <Input
                id="check_in_end"
                type="datetime-local"
                value={formData.check_in_end}
                onChange={(e) => setFormData({ ...formData, check_in_end: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="tournament_start">Início do Torneio</Label>
              <Input
                id="tournament_start"
                type="datetime-local"
                value={formData.tournament_start}
                onChange={(e) => setFormData({ ...formData, tournament_start: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="min_rank">Rank Mínimo</Label>
              <Select
                value={formData.min_rank}
                onValueChange={(value) => setFormData({ ...formData, min_rank: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  {RANKS.map(rank => (
                    <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="max_rank">Rank Máximo</Label>
              <Select
                value={formData.max_rank}
                onValueChange={(value) => setFormData({ ...formData, max_rank: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  {RANKS.map(rank => (
                    <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 flex items-center space-x-2">
              <Switch
                id="require_top_character"
                checked={formData.require_top_character}
                onCheckedChange={(checked) => setFormData({ ...formData, require_top_character: checked })}
              />
              <Label htmlFor="require_top_character">Requer Top 1 com personagem específico</Label>
            </div>

            {formData.require_top_character && (
              <div className="col-span-2">
                <Label htmlFor="required_character">Personagem Requerido</Label>
                <Input
                  id="required_character"
                  value={formData.required_character}
                  onChange={(e) => setFormData({ ...formData, required_character: e.target.value })}
                  placeholder="Ex: Naruto, Sasuke, etc"
                />
              </div>
            )}

            <div className="col-span-2">
              <Label htmlFor="rules_text">Regras e Premiação</Label>
              <Textarea
                id="rules_text"
                value={formData.rules_text}
                onChange={(e) => setFormData({ ...formData, rules_text: e.target.value })}
                placeholder="Descreva as regras do torneio e a premiação para os vencedores..."
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createTournament.isPending}>
              {createTournament.isPending ? "Criando..." : "Criar Torneio"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
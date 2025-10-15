import { useState } from "react";
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
    prize_description: "",
    min_rank: "",
    max_rank: "",
    require_top_character: false,
    required_character: "",
    rules_text: "",
  });

  const { currentPlayer } = useAuth();
  const createTournament = useCreateTournament();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    await createTournament.mutateAsync({
      ...formData,
      image_url: imageUrl,
      created_by: currentPlayer?.id || "",
      status: "registration",
    });

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
      prize_description: "",
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
              <Label htmlFor="prize_description">Descrição da Premiação</Label>
              <Textarea
                id="prize_description"
                value={formData.prize_description}
                onChange={(e) => setFormData({ ...formData, prize_description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="rules_text">Regras Adicionais</Label>
              <Textarea
                id="rules_text"
                value={formData.rules_text}
                onChange={(e) => setFormData({ ...formData, rules_text: e.target.value })}
                rows={3}
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
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Pencil, Trash2, Sparkles, BookOpen, Swords, Star } from "lucide-react";
import {
  useAcademyCharacters,
  useUpsertAcademyCharacter,
  useDeleteAcademyCharacter,
  useAcademyMoves,
  useUpsertAcademyMove,
  useDeleteAcademyMove,
  useAcademyCombos,
  useUpsertAcademyCombo,
  useDeleteAcademyCombo,
  useAcademyTopics,
  useUpsertAcademyTopic,
  useDeleteAcademyTopic,
  useAcademyCommentedMatches,
  useUpsertAcademyCommentedMatch,
  useDeleteAcademyCommentedMatch,
  type AcademyCharacter,
  type AcademyMove,
  type AcademyCombo,
  type AcademyTopic,
  type AcademyCommentedMatch,
} from "@/hooks/useAcademy";

// ===== Characters =====
const emptyChar: Partial<AcademyCharacter> = {
  slug: "",
  name: "",
  tier: "B",
  image_url: "",
  image_lv2_url: "",
  short_description: "",
  full_description: "",
  playstyle: "",
  difficulty: "medium",
  attributes: { strength: 5, speed: 5, technique: 5, defense: 5, mobility: 5, versatility: 5 },
  strengths: [],
  weaknesses: [],
  favorable_against: [],
  unfavorable_against: [],
  recommended_for: "",
  is_published: true,
  is_featured: false,
  sort_order: 0,
};

const toArr = (s: string) => s.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);

const CharacterEditor = ({ existing, onClose }: { existing?: AcademyCharacter; onClose: () => void }) => {
  const upsert = useUpsertAcademyCharacter();
  const [form, setForm] = useState<Partial<AcademyCharacter>>(existing || emptyChar);
  const attrs = (form.attributes as AcademyCharacter["attributes"]) || emptyChar.attributes!;

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle>{existing ? "Editar" : "Novo"} Personagem</DialogTitle>
      </DialogHeader>
      <ScrollArea className="flex-1 pr-4 -mr-4">
        <div className="space-y-4 pb-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nome*</Label>
              <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Slug (URL)*</Label>
              <Input
                value={form.slug || ""}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
              />
            </div>
            <div>
              <Label>Tier</Label>
              <Select value={form.tier} onValueChange={(v) => setForm({ ...form, tier: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["S+", "S", "A+", "A", "B+", "B", "C+", "C", "D"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Dificuldade</Label>
              <Select value={form.difficulty || "medium"} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>URL da imagem*</Label>
              <Input value={form.image_url || ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>URL imagem Lv2 (opcional)</Label>
              <Input value={form.image_lv2_url || ""} onChange={(e) => setForm({ ...form, image_lv2_url: e.target.value })} />
            </div>
            <div>
              <Label>Playstyle</Label>
              <Input value={form.playstyle || ""} onChange={(e) => setForm({ ...form, playstyle: e.target.value })} placeholder="Rushdown / Zoning..." />
            </div>
            <div>
              <Label>Indicado para</Label>
              <Input value={form.recommended_for || ""} onChange={(e) => setForm({ ...form, recommended_for: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Descrição curta</Label>
              <Textarea rows={2} value={form.short_description || ""} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Descrição completa</Label>
              <Textarea rows={4} value={form.full_description || ""} onChange={(e) => setForm({ ...form, full_description: e.target.value })} />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Atributos (0-10)</Label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(attrs) as Array<keyof typeof attrs>).map((k) => (
                <div key={k}>
                  <Label className="text-xs capitalize">{k}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={attrs[k]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        attributes: { ...attrs, [k]: Math.max(0, Math.min(10, Number(e.target.value) || 0)) },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Pontos fortes (1 por linha)</Label>
              <Textarea
                rows={4}
                value={(form.strengths || []).join("\n")}
                onChange={(e) => setForm({ ...form, strengths: toArr(e.target.value) })}
              />
            </div>
            <div>
              <Label>Pontos fracos (1 por linha)</Label>
              <Textarea
                rows={4}
                value={(form.weaknesses || []).join("\n")}
                onChange={(e) => setForm({ ...form, weaknesses: toArr(e.target.value) })}
              />
            </div>
            <div>
              <Label>Vantagem contra (1 por linha)</Label>
              <Textarea
                rows={3}
                value={(form.favorable_against || []).join("\n")}
                onChange={(e) => setForm({ ...form, favorable_against: toArr(e.target.value) })}
              />
            </div>
            <div>
              <Label>Desvantagem contra (1 por linha)</Label>
              <Textarea
                rows={3}
                value={(form.unfavorable_against || []).join("\n")}
                onChange={(e) => setForm({ ...form, unfavorable_against: toArr(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={!!form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
              Publicado
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={!!form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
              Destaque
            </label>
            <div className="flex items-center gap-2">
              <Label>Ordem:</Label>
              <Input type="number" className="w-20" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            </div>
          </div>
        </div>
      </ScrollArea>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button
          disabled={upsert.isPending || !form.name || !form.slug || !form.image_url}
          onClick={() => upsert.mutate(form, { onSuccess: onClose })}
        >
          Salvar
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

const MoveEditor = ({ characterId, existing, onClose }: { characterId: string; existing?: AcademyMove; onClose: () => void }) => {
  const upsert = useUpsertAcademyMove();
  const [form, setForm] = useState<Partial<AcademyMove>>(
    existing || { character_id: characterId, name: "", move_type: "special", description: "", damage_rating: 5, difficulty: "medium", sort_order: 0 },
  );
  return (
    <DialogContent className="max-w-xl">
      <DialogHeader><DialogTitle>{existing ? "Editar" : "Nova"} Habilidade</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Nome*</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div>
            <Label>Tipo</Label>
            <Select value={form.move_type} onValueChange={(v) => setForm({ ...form, move_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["special", "ultimate", "setup", "counter", "projectile", "command_grab", "defensive", "stance", "buff", "transformation"].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Comando</Label><Input value={form.command || ""} onChange={(e) => setForm({ ...form, command: e.target.value })} placeholder="↓ ↘ → + △" /></div>
          <div>
            <Label>Dificuldade</Label>
            <Select value={form.difficulty || "medium"} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2"><Label>URL do vídeo</Label><Input value={form.video_url || ""} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://youtube.com/..." /></div>
          <div className="col-span-2"><Label>Descrição*</Label><Textarea rows={3} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>Dano (1-10)</Label><Input type="number" min={1} max={10} value={form.damage_rating ?? 5} onChange={(e) => setForm({ ...form, damage_rating: Number(e.target.value) })} /></div>
          <div><Label>Ordem</Label><Input type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button disabled={upsert.isPending || !form.name || !form.description} onClick={() => upsert.mutate(form as Partial<AcademyMove> & { character_id: string }, { onSuccess: onClose })}>Salvar</Button>
      </DialogFooter>
    </DialogContent>
  );
};

const ComboEditor = ({ characterId, existing, onClose }: { characterId: string; existing?: AcademyCombo; onClose: () => void }) => {
  const upsert = useUpsertAcademyCombo();
  const [form, setForm] = useState<Partial<AcademyCombo>>(
    existing || { character_id: characterId, name: "", inputs: "", difficulty: "medium", sort_order: 0 },
  );
  return (
    <DialogContent className="max-w-xl">
      <DialogHeader><DialogTitle>{existing ? "Editar" : "Novo"} Combo</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><Label>Nome*</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><Label>Inputs*</Label><Textarea rows={2} value={form.inputs || ""} onChange={(e) => setForm({ ...form, inputs: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Dificuldade</Label>
            <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Dano estimado</Label><Input value={form.damage_estimate || ""} onChange={(e) => setForm({ ...form, damage_estimate: e.target.value })} placeholder="~45%" /></div>
          <div><Label>Situação</Label><Input value={form.situation || ""} onChange={(e) => setForm({ ...form, situation: e.target.value })} placeholder="Corner / Punish" /></div>
          <div><Label>Ordem</Label><Input type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
        </div>
        <div><Label>URL do vídeo</Label><Input value={form.video_url || ""} onChange={(e) => setForm({ ...form, video_url: e.target.value })} /></div>
        <div><Label>Notas</Label><Textarea rows={2} value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button disabled={upsert.isPending || !form.name || !form.inputs} onClick={() => upsert.mutate(form as Partial<AcademyCombo> & { character_id: string }, { onSuccess: onClose })}>Salvar</Button>
      </DialogFooter>
    </DialogContent>
  );
};

const CharacterDetailEditor = ({ character }: { character: AcademyCharacter }) => {
  const { data: moves = [] } = useAcademyMoves(character.id);
  const { data: combos = [] } = useAcademyCombos(character.id);
  const delMove = useDeleteAcademyMove();
  const delCombo = useDeleteAcademyCombo();
  const [moveOpen, setMoveOpen] = useState<AcademyMove | "new" | null>(null);
  const [comboOpen, setComboOpen] = useState<AcademyCombo | "new" | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Habilidades ({moves.length})</h4>
          <Button size="sm" onClick={() => setMoveOpen("new")}><Plus className="w-4 h-4 mr-1" /> Adicionar</Button>
        </div>
        <div className="space-y-2">
          {moves.map((m) => (
            <div key={m.id} className="flex items-center justify-between border border-border/60 rounded-md p-2 bg-card/50">
              <div className="text-sm">
                <strong>{m.name}</strong> <Badge variant="outline" className="ml-2 text-xs">{m.move_type}</Badge>
                {m.command && <code className="ml-2 text-xs text-primary">{m.command}</code>}
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => setMoveOpen(m)}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => confirm("Excluir esta habilidade?") && delMove.mutate({ id: m.id, character_id: character.id })}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {moves.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma habilidade.</p>}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold flex items-center gap-2"><Swords className="w-4 h-4 text-primary" /> Combos ({combos.length})</h4>
          <Button size="sm" onClick={() => setComboOpen("new")}><Plus className="w-4 h-4 mr-1" /> Adicionar</Button>
        </div>
        <div className="space-y-2">
          {combos.map((c) => (
            <div key={c.id} className="flex items-center justify-between border border-border/60 rounded-md p-2 bg-card/50">
              <div className="text-sm">
                <strong>{c.name}</strong> <Badge variant="outline" className="ml-2 text-xs">{c.difficulty}</Badge>
                <code className="block text-xs text-primary mt-1">{c.inputs}</code>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => setComboOpen(c)}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => confirm("Excluir este combo?") && delCombo.mutate({ id: c.id, character_id: character.id })}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {combos.length === 0 && <p className="text-xs text-muted-foreground">Nenhum combo.</p>}
        </div>
      </div>

      <Dialog open={!!moveOpen} onOpenChange={(o) => !o && setMoveOpen(null)}>
        {moveOpen && (
          <MoveEditor
            characterId={character.id}
            existing={moveOpen === "new" ? undefined : moveOpen}
            onClose={() => setMoveOpen(null)}
          />
        )}
      </Dialog>
      <Dialog open={!!comboOpen} onOpenChange={(o) => !o && setComboOpen(null)}>
        {comboOpen && (
          <ComboEditor
            characterId={character.id}
            existing={comboOpen === "new" ? undefined : comboOpen}
            onClose={() => setComboOpen(null)}
          />
        )}
      </Dialog>
    </div>
  );
};

const CharactersAdmin = () => {
  const { data: characters = [] } = useAcademyCharacters();
  const del = useDeleteAcademyCharacter();
  const [editing, setEditing] = useState<AcademyCharacter | "new" | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{characters.length} personagens cadastrados</p>
        <Dialog open={editing === "new"} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing("new")}><Plus className="w-4 h-4 mr-1" /> Novo personagem</Button>
          </DialogTrigger>
          {editing === "new" && <CharacterEditor onClose={() => setEditing(null)} />}
        </Dialog>
      </div>

      <div className="space-y-2">
        {characters.map((c) => (
          <Card key={c.id} className="overflow-hidden">
            <div className="flex items-center gap-3 p-3">
              <img src={c.image_url} alt={c.name} className="w-12 h-12 rounded object-cover object-top border border-border" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <strong className="truncate">{c.name}</strong>
                  <Badge variant="outline" className="text-xs">{c.tier}</Badge>
                  {c.is_featured && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                  {!c.is_published && <Badge variant="secondary" className="text-xs">Rascunho</Badge>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{c.slug}</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
                  {expanded === c.id ? "Fechar" : "Conteúdo"}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setEditing(c)}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => confirm(`Excluir ${c.name}? Isso remove habilidades e combos.`) && del.mutate(c.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
            {expanded === c.id && (
              <CardContent className="border-t border-border bg-muted/20 pt-4">
                <CharacterDetailEditor character={c} />
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Dialog open={!!editing && editing !== "new"} onOpenChange={(o) => !o && setEditing(null)}>
        {editing && editing !== "new" && <CharacterEditor existing={editing} onClose={() => setEditing(null)} />}
      </Dialog>
    </div>
  );
};

// ===== Topics =====
const emptyTopic: Partial<AcademyTopic> = {
  slug: "",
  title: "",
  category: "mechanics",
  summary: "",
  content: "",
  is_pinned: false,
  is_published: true,
  sort_order: 0,
};

const TopicEditor = ({ existing, onClose }: { existing?: AcademyTopic; onClose: () => void }) => {
  const upsert = useUpsertAcademyTopic();
  const [form, setForm] = useState<Partial<AcademyTopic>>(existing || emptyTopic);
  return (
    <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
      <DialogHeader><DialogTitle>{existing ? "Editar" : "Novo"} Tópico</DialogTitle></DialogHeader>
      <ScrollArea className="flex-1 pr-4 -mr-4">
        <div className="space-y-3 pb-2">
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Título*</Label><Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Slug*</Label><Input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} /></div>
            <div>
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mechanics">Mecânicas</SelectItem>
                  <SelectItem value="basics">Fundamentos</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                  <SelectItem value="strategy">Estratégia</SelectItem>
                  <SelectItem value="meta">Meta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Ordem</Label><Input type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
          </div>
          <div><Label>Resumo</Label><Textarea rows={2} value={form.summary || ""} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></div>
          <div><Label>Conteúdo* (Markdown/texto)</Label><Textarea rows={10} value={form.content || ""} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
          <div><Label>URL do vídeo</Label><Input value={form.video_url || ""} onChange={(e) => setForm({ ...form, video_url: e.target.value })} /></div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm"><Switch checked={!!form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} /> Publicado</label>
            <label className="flex items-center gap-2 text-sm"><Switch checked={!!form.is_pinned} onCheckedChange={(v) => setForm({ ...form, is_pinned: v })} /> Fixado</label>
          </div>
        </div>
      </ScrollArea>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button disabled={upsert.isPending || !form.title || !form.slug || !form.content} onClick={() => upsert.mutate(form, { onSuccess: onClose })}>Salvar</Button>
      </DialogFooter>
    </DialogContent>
  );
};

const TopicsAdmin = () => {
  const { data: topics = [] } = useAcademyTopics();
  const del = useDeleteAcademyTopic();
  const [editing, setEditing] = useState<AcademyTopic | "new" | null>(null);
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{topics.length} tópicos</p>
        <Button onClick={() => setEditing("new")}><Plus className="w-4 h-4 mr-1" /> Novo tópico</Button>
      </div>
      <div className="space-y-2">
        {topics.map((t) => (
          <Card key={t.id} className="p-3 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <strong className="truncate">{t.title}</strong>
                <Badge variant="outline" className="text-xs">{t.category}</Badge>
                {t.is_pinned && <Badge variant="outline" className="text-xs border-yellow-500/40 text-yellow-400">Fixado</Badge>}
              </div>
              <p className="text-xs text-muted-foreground truncate">{t.summary}</p>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => setEditing(t)}><Pencil className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => confirm("Excluir tópico?") && del.mutate(t.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        {editing && <TopicEditor existing={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}
      </Dialog>
    </div>
  );
};

// ===== Commented Matches =====
const emptyMatch: Partial<AcademyCommentedMatch> = {
  title: "",
  video_url: "",
  tier: "intermediario",
  tags: [],
  is_published: true,
  is_featured: false,
};

const MatchEditor = ({ existing, onClose }: { existing?: AcademyCommentedMatch; onClose: () => void }) => {
  const upsert = useUpsertAcademyCommentedMatch();
  const [form, setForm] = useState<Partial<AcademyCommentedMatch>>(existing || emptyMatch);
  return (
    <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
      <DialogHeader><DialogTitle>{existing ? "Editar" : "Nova"} Partida Comentada</DialogTitle></DialogHeader>
      <ScrollArea className="flex-1 pr-4 -mr-4">
        <div className="space-y-3 pb-2">
          <div><Label>Título*</Label><Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>URL do vídeo* (YouTube/Twitch)</Label><Input value={form.video_url || ""} onChange={(e) => setForm({ ...form, video_url: e.target.value })} /></div>
          <div><Label>Descrição</Label><Textarea rows={2} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Jogador A</Label><Input value={form.player_a_name || ""} onChange={(e) => setForm({ ...form, player_a_name: e.target.value })} /></div>
            <div><Label>Jogador B</Label><Input value={form.player_b_name || ""} onChange={(e) => setForm({ ...form, player_b_name: e.target.value })} /></div>
            <div><Label>Personagem A</Label><Input value={form.character_a || ""} onChange={(e) => setForm({ ...form, character_a: e.target.value })} /></div>
            <div><Label>Personagem B</Label><Input value={form.character_b || ""} onChange={(e) => setForm({ ...form, character_b: e.target.value })} /></div>
            <div>
              <Label>Vencedor</Label>
              <Select value={form.winner || ""} onValueChange={(v) => setForm({ ...form, winner: v })}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="a">Jogador A</SelectItem>
                  <SelectItem value="b">Jogador B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nível</Label>
              <Select value={form.tier || "intermediario"} onValueChange={(v) => setForm({ ...form, tier: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="iniciante">Iniciante</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Comentarista</Label><Input value={form.commentator || ""} onChange={(e) => setForm({ ...form, commentator: e.target.value })} /></div>
          <div><Label>Tags (separadas por vírgula)</Label><Input value={(form.tags || []).join(", ")} onChange={(e) => setForm({ ...form, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm"><Switch checked={!!form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} /> Publicado</label>
            <label className="flex items-center gap-2 text-sm"><Switch checked={!!form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} /> Destaque</label>
          </div>
        </div>
      </ScrollArea>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button disabled={upsert.isPending || !form.title || !form.video_url} onClick={() => upsert.mutate(form, { onSuccess: onClose })}>Salvar</Button>
      </DialogFooter>
    </DialogContent>
  );
};

const MatchesAdmin = () => {
  const { data: matches = [] } = useAcademyCommentedMatches();
  const del = useDeleteAcademyCommentedMatch();
  const [editing, setEditing] = useState<AcademyCommentedMatch | "new" | null>(null);
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{matches.length} partidas</p>
        <Button onClick={() => setEditing("new")}><Plus className="w-4 h-4 mr-1" /> Nova partida</Button>
      </div>
      <div className="space-y-2">
        {matches.map((m) => (
          <Card key={m.id} className="p-3 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <strong className="truncate">{m.title}</strong>
                {m.is_featured && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                {m.tier && <Badge variant="outline" className="text-xs">{m.tier}</Badge>}
                {!m.is_published && <Badge variant="secondary" className="text-xs">Rascunho</Badge>}
              </div>
              <p className="text-xs text-muted-foreground truncate">{m.player_a_name} vs {m.player_b_name}</p>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => setEditing(m)}><Pencil className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => confirm("Excluir partida?") && del.mutate(m.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        {editing && <MatchEditor existing={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}
      </Dialog>
    </div>
  );
};

// ===== Main Tab =====
export const AdminAcademyTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> Academia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="characters" className="w-full">
          <TabsList className="grid grid-cols-3 max-w-md mb-4">
            <TabsTrigger value="characters">Personagens</TabsTrigger>
            <TabsTrigger value="topics">Tópicos</TabsTrigger>
            <TabsTrigger value="matches">Partidas</TabsTrigger>
          </TabsList>
          <TabsContent value="characters"><CharactersAdmin /></TabsContent>
          <TabsContent value="topics"><TopicsAdmin /></TabsContent>
          <TabsContent value="matches"><MatchesAdmin /></TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminAcademyTab;

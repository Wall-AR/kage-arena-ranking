import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, Sparkles } from "lucide-react";
import { ForumCategory } from "@/hooks/useForum";

interface CreateTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ForumCategory[];
  selectedCategory?: string;
  onSubmit: (data: { categoryId: string; title: string; content: string }) => void;
  isLoading?: boolean;
}

const CreateTopicDialog = ({
  open,
  onOpenChange,
  categories,
  selectedCategory,
  onSubmit,
  isLoading
}: CreateTopicDialogProps) => {
  const [categoryId, setCategoryId] = useState(selectedCategory || "");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !title.trim() || !content.trim()) return;
    
    onSubmit({ categoryId, title: title.trim(), content: content.trim() });
    setTitle("");
    setContent("");
  };

  const isValid = categoryId && title.trim().length >= 5 && content.trim().length >= 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-ninja text-xl">
            <Sparkles className="w-5 h-5 text-primary" />
            Criar Novo Tópico
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="bg-background/50 border-border/50">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite um título claro e descritivo..."
              className="bg-background/50 border-border/50"
              minLength={5}
              maxLength={150}
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/150 caracteres (mínimo 5)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva o conteúdo do seu tópico..."
              className="bg-background/50 border-border/50 min-h-[150px] resize-y"
              minLength={10}
            />
            <p className="text-xs text-muted-foreground">
              {content.length} caracteres (mínimo 10)
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="bg-gradient-to-r from-primary to-accent"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Publicar Tópico
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTopicDialog;

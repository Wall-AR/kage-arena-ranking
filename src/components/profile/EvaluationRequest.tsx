import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, Send, Loader2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEvaluationCooldown } from "@/hooks/useEvaluationCooldown";

interface EvaluationRequestProps {
  playerId: string;
  onRequestSent?: () => void;
}

export const EvaluationRequest = ({ playerId, onRequestSent }: EvaluationRequestProps) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { data: cooldownData, isLoading: cooldownLoading } = useEvaluationCooldown(playerId);

  const handleSubmit = async () => {
    if (!cooldownData?.canRequest) {
      toast({
        title: "Solicitação bloqueada",
        description: `Você pode solicitar uma nova avaliação apenas após 90 dias da última solicitação. Próxima solicitação disponível em: ${cooldownData?.nextRequestDate ? new Date(cooldownData.nextRequestDate).toLocaleDateString('pt-BR') : 'carregando...'}`,
        variant: "destructive"
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Mensagem obrigatória",
        description: "Por favor, escreva uma mensagem para os avaliadores.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('evaluations')
        .insert({
          player_id: playerId,
          request_message: message,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação de avaliação foi enviada para os moderadores.",
      });

      setMessage("");
      setOpen(false);
      onRequestSent?.();
    } catch (error) {
      console.error('Error requesting evaluation:', error);
      toast({
        title: "Erro ao enviar solicitação",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canRequest = cooldownData?.canRequest !== false;
  const daysUntilNextRequest = cooldownData?.nextRequestDate 
    ? Math.ceil((new Date(cooldownData.nextRequestDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-white shadow-ninja"
          disabled={cooldownLoading || !canRequest}
        >
          <Star className="w-4 h-4 mr-2" />
          {canRequest ? "Solicitar Avaliação" : "Avaliação Bloqueada"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Avaliação</DialogTitle>
          <DialogDescription>
            {canRequest ? (
              "Conte um pouco sobre sua experiência e por que quer ser avaliado pelos nossos moderadores."
            ) : (
              <div className="flex items-start space-x-2 mt-2 p-3 bg-muted rounded-lg">
                <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Avaliação bloqueada</p>
                  <p className="text-sm mt-1">
                    Você pode solicitar uma nova avaliação em <strong>{daysUntilNextRequest} dias</strong>.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Próxima solicitação disponível: {cooldownData?.nextRequestDate ? new Date(cooldownData.nextRequestDate).toLocaleDateString('pt-BR') : 'carregando...'}
                  </p>
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        {canRequest && (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="request-message">Mensagem para os avaliadores</Label>
                <Textarea 
                  id="request-message"
                  placeholder="Ex: Jogo há 2 anos, tenho experiência com combos básicos e quero melhorar meu timing..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Solicitação
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
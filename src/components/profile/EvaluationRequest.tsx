import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, Send, Loader2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEvaluationCooldown } from "@/hooks/useEvaluationCooldown";
import { useQueryClient } from "@tanstack/react-query";

interface EvaluationRequestProps {
  playerId: string;
  onRequestSent?: () => void;
}

export const EvaluationRequest = ({ playerId, onRequestSent }: EvaluationRequestProps) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: cooldownData, isLoading: cooldownLoading } = useEvaluationCooldown(playerId);

  const handleSubmit = async () => {
    if (!cooldownData?.canRequest) {
      toast({
        title: "Solicitação bloqueada",
        description: cooldownData?.reason === "active"
          ? "Você já tem uma avaliação pendente ou em andamento."
          : `Você pode solicitar uma nova avaliação apenas após 90 dias da última solicitação. Próxima solicitação disponível em: ${cooldownData?.nextRequestDate ? new Date(cooldownData.nextRequestDate).toLocaleDateString("pt-BR") : "carregando..."}`,
        variant: "destructive"
      });
      return;
    }

    if (message.trim().length < 10) {
      toast({
        title: "Mensagem obrigatória",
        description: "Escreva pelo menos 10 caracteres para orientar os avaliadores.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.rpc("request_evaluation", {
        p_message: message.trim()
      });

      if (error) throw error;

      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação de avaliação foi enviada para os moderadores.",
      });

      setMessage("");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["evaluation-cooldown", playerId] });
      queryClient.invalidateQueries({ queryKey: ["player-evaluations", playerId] });
      queryClient.invalidateQueries({ queryKey: ["pending-evaluations"] });
      queryClient.invalidateQueries({ queryKey: ["mod-evaluations-pending"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      onRequestSent?.();
    } catch (error: unknown) {
      console.error("Error requesting evaluation:", error);
      toast({
        title: "Erro ao enviar solicitação",
        description: error instanceof Error ? error.message : "Tente novamente em alguns instantes.",
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
  const blockedLabel = cooldownData?.reason === "active" ? "Avaliação em andamento" : "Avaliação bloqueada";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-white shadow-ninja"
          disabled={cooldownLoading || !canRequest}
        >
          <Star className="w-4 h-4 mr-2" />
          {canRequest ? "Solicitar Avaliação" : blockedLabel}
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
                  {cooldownData?.reason === "active" ? (
                    <p className="text-sm mt-1">
                      Sua solicitação já está com a moderação.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm mt-1">
                        Você pode solicitar uma nova avaliação em <strong>{daysUntilNextRequest} dias</strong>.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Próxima solicitação disponível: {cooldownData?.nextRequestDate ? new Date(cooldownData.nextRequestDate).toLocaleDateString("pt-BR") : "carregando..."}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        {canRequest && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="request-message">Mensagem para os avaliadores</Label>
              <Textarea
                id="request-message"
                placeholder="Ex: Jogo há 2 anos, tenho experiência com combos básicos e quero melhorar meu timing..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
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
        )}
      </DialogContent>
    </Dialog>
  );
};

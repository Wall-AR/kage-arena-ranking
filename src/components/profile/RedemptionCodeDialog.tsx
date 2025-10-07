import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift } from "lucide-react";
import { useRedeemCode } from "@/hooks/useAchievements";

interface RedemptionCodeDialogProps {
  playerId: string;
}

export const RedemptionCodeDialog = ({ playerId }: RedemptionCodeDialogProps) => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const redeemCode = useRedeemCode();

  const handleRedeem = () => {
    if (!code.trim()) return;
    
    redeemCode.mutate(
      { playerId, code: code.trim() },
      {
        onSuccess: () => {
          setCode("");
          setOpen(false);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Gift className="w-4 h-4" />
          Resgatar Código
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resgatar Código</DialogTitle>
          <DialogDescription>
            Insira um código de resgate para desbloquear banners e conquistas especiais
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Digite o código aqui"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
            />
          </div>
          <Button 
            onClick={handleRedeem} 
            disabled={!code.trim() || redeemCode.isPending}
            className="w-full"
          >
            {redeemCode.isPending ? 'Resgatando...' : 'Resgatar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

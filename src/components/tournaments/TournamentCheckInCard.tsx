import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertTriangle, Zap } from "lucide-react";
import { format, differenceInMinutes, differenceInHours, differenceInSeconds, isPast, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TournamentCheckInCardProps {
  checkInStart: string;
  checkInEnd: string;
  hasCheckedIn: boolean;
  onCheckIn: () => void;
  isLoading?: boolean;
}

export function TournamentCheckInCard({
  checkInStart,
  checkInEnd,
  hasCheckedIn,
  onCheckIn,
  isLoading = false,
}: TournamentCheckInCardProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"waiting" | "open" | "closed">("waiting");

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const start = new Date(checkInStart);
      const end = new Date(checkInEnd);

      if (isFuture(start)) {
        // Check-in hasn't started
        setStatus("waiting");
        const minutesUntilStart = differenceInMinutes(start, now);
        const hoursUntilStart = differenceInHours(start, now);
        
        if (hoursUntilStart > 0) {
          setTimeLeft(`Abre em ${hoursUntilStart}h ${minutesUntilStart % 60}min`);
        } else if (minutesUntilStart > 0) {
          setTimeLeft(`Abre em ${minutesUntilStart} minutos`);
        } else {
          const secondsUntilStart = differenceInSeconds(start, now);
          setTimeLeft(`Abre em ${secondsUntilStart} segundos`);
        }
        setProgress(0);
      } else if (isPast(end)) {
        // Check-in has ended
        setStatus("closed");
        setTimeLeft("Check-in encerrado");
        setProgress(100);
      } else {
        // Check-in is open
        setStatus("open");
        const totalDuration = differenceInMinutes(end, start);
        const elapsed = differenceInMinutes(now, start);
        const remaining = differenceInMinutes(end, now);
        
        setProgress((elapsed / totalDuration) * 100);
        
        if (remaining > 60) {
          const hours = Math.floor(remaining / 60);
          setTimeLeft(`${hours}h ${remaining % 60}min restantes`);
        } else if (remaining > 0) {
          setTimeLeft(`${remaining} minutos restantes`);
        } else {
          const secondsRemaining = differenceInSeconds(end, now);
          setTimeLeft(`${secondsRemaining} segundos restantes!`);
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [checkInStart, checkInEnd]);

  const getStatusConfig = () => {
    if (hasCheckedIn) {
      return {
        icon: CheckCircle,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/50",
        label: "Check-in Realizado!",
      };
    }
    switch (status) {
      case "waiting":
        return {
          icon: Clock,
          color: "text-muted-foreground",
          bgColor: "bg-muted/50",
          borderColor: "border-muted",
          label: "Aguardando Abertura",
        };
      case "open":
        return {
          icon: Zap,
          color: "text-primary",
          bgColor: "bg-primary/10",
          borderColor: "border-primary animate-pulse",
          label: "Check-in Aberto!",
        };
      case "closed":
        return {
          icon: AlertTriangle,
          color: "text-destructive",
          bgColor: "bg-destructive/10",
          borderColor: "border-destructive/50",
          label: "Check-in Encerrado",
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <Card className={cn("border-2 transition-all", config.borderColor, config.bgColor)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <StatusIcon className={cn("h-5 w-5", config.color)} />
          Check-in do Torneio
        </CardTitle>
        <CardDescription>
          {format(new Date(checkInStart), "dd/MM 'às' HH:mm", { locale: ptBR })} - {format(new Date(checkInEnd), "HH:mm", { locale: ptBR })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={config.color}>
            {config.label}
          </Badge>
          <span className={cn("text-sm font-medium", config.color)}>
            {timeLeft}
          </span>
        </div>

        {/* Progress Bar */}
        {status === "open" && !hasCheckedIn && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Tempo restante para fazer check-in
            </p>
          </div>
        )}

        {/* Action Button */}
        {!hasCheckedIn && status === "open" && (
          <Button 
            onClick={onCheckIn} 
            disabled={isLoading}
            className="w-full animate-pulse hover:animate-none"
            size="lg"
          >
            <Zap className="mr-2 h-5 w-5" />
            {isLoading ? "Fazendo check-in..." : "Fazer Check-in Agora!"}
          </Button>
        )}

        {hasCheckedIn && (
          <div className="text-center py-2">
            <p className="text-sm text-green-500 font-medium flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Você está confirmado no torneio!
            </p>
          </div>
        )}

        {status === "closed" && !hasCheckedIn && (
          <div className="text-center py-2">
            <p className="text-sm text-destructive font-medium flex items-center justify-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Você perdeu o período de check-in
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

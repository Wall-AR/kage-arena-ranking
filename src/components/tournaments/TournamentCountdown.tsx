import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, Flame, Swords } from "lucide-react";
import { cn } from "@/lib/utils";

interface TournamentCountdownProps {
  targetDate: string;
  label: string;
  variant?: "registration" | "checkin" | "start";
  onComplete?: () => void;
}

function formatTimeUnit(value: number): string {
  return value.toString().padStart(2, "0");
}

export function TournamentCountdown({
  targetDate,
  label,
  variant = "start",
  onComplete,
}: TournamentCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setIsExpired(true);
        onComplete?.();
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  const getVariantStyles = () => {
    switch (variant) {
      case "registration":
        return {
          gradient: "from-green-500/20 via-emerald-500/10 to-transparent",
          border: "border-green-500/50",
          icon: <Zap className="h-5 w-5 text-green-500" />,
          badgeClass: "bg-green-500/20 text-green-400 border-green-500/30",
        };
      case "checkin":
        return {
          gradient: "from-yellow-500/20 via-orange-500/10 to-transparent",
          border: "border-yellow-500/50",
          icon: <Flame className="h-5 w-5 text-yellow-500 animate-pulse" />,
          badgeClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        };
      case "start":
      default:
        return {
          gradient: "from-primary/20 via-accent/10 to-transparent",
          border: "border-primary/50",
          icon: <Swords className="h-5 w-5 text-primary" />,
          badgeClass: "bg-primary/20 text-primary border-primary/30",
        };
    }
  };

  const styles = getVariantStyles();

  if (isExpired) {
    return (
      <Card className={cn("relative overflow-hidden", styles.border)}>
        <div className={cn("absolute inset-0 bg-gradient-to-br", styles.gradient)} />
        <CardContent className="relative p-4 text-center">
          <Badge className={styles.badgeClass}>
            {styles.icon}
            <span className="ml-2">Iniciado!</span>
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("relative overflow-hidden", styles.border)}>
      <div className={cn("absolute inset-0 bg-gradient-to-br", styles.gradient)} />
      <CardContent className="relative p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {styles.icon}
            <span className="text-sm font-medium">{label}</span>
          </div>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          <TimeUnit value={timeLeft.days} label="Dias" isUrgent={timeLeft.days === 0 && timeLeft.hours < 2} />
          <TimeUnit value={timeLeft.hours} label="Horas" isUrgent={timeLeft.days === 0 && timeLeft.hours < 2} />
          <TimeUnit value={timeLeft.minutes} label="Min" isUrgent={timeLeft.days === 0 && timeLeft.hours === 0} />
          <TimeUnit value={timeLeft.seconds} label="Seg" isUrgent={timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes < 5} />
        </div>
      </CardContent>
    </Card>
  );
}

function TimeUnit({ value, label, isUrgent }: { value: number; label: string; isUrgent?: boolean }) {
  return (
    <div className="text-center">
      <div 
        className={cn(
          "text-2xl font-bold tabular-nums bg-background/80 rounded-lg p-2 border",
          isUrgent && "text-destructive animate-pulse border-destructive/50"
        )}
      >
        {formatTimeUnit(value)}
      </div>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

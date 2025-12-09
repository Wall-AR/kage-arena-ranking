import { Button } from "@/components/ui/button";
import { Plus, Gamepad2, Flame, Trophy } from "lucide-react";

interface ForumHeaderProps {
  onNewTopic: () => void;
}

const ForumHeader = ({ onNewTopic }: ForumHeaderProps) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-secondary via-card to-secondary/50 p-6 md:p-8 mb-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-ninja-jounin/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary)/0.3) 1px, transparent 1px),
                          linear-gradient(90deg, hsl(var(--primary)/0.3) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-ninja">
              <Gamepad2 className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-ninja-anbu rounded-full flex items-center justify-center animate-pulse">
              <Flame className="w-3 h-3 text-primary-foreground" />
            </div>
          </div>
          
          <div>
            <h1 className="font-ninja text-3xl md:text-4xl font-bold text-foreground tracking-wide">
              ARENA FÓRUM
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mt-1">
              Centro de discussões • Estratégias • Comunidade
            </p>
          </div>
        </div>
        
        <Button 
          onClick={onNewTopic}
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-ninja transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Tópico
          <Trophy className="w-4 h-4 ml-2 opacity-70" />
        </Button>
      </div>

      {/* XP Bar decorative element */}
      <div className="relative z-10 mt-6 flex items-center gap-3">
        <span className="text-xs text-muted-foreground font-medium">NÍVEL DA COMUNIDADE</span>
        <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-ninja-chunin via-ninja-jounin to-ninja-kage rounded-full transition-all duration-1000"
            style={{ width: '73%' }}
          />
        </div>
        <span className="text-xs text-accent font-bold">LV. 42</span>
      </div>
    </div>
  );
};

export default ForumHeader;

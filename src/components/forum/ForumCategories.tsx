import { cn } from "@/lib/utils";
import { MessageCircle, Brain, Swords, Lightbulb, ScrollText, Trophy, Shield } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  topicCount: number;
}

interface ForumCategoriesProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  general: MessageCircle,
  strategies: Brain,
  matches: Swords,
  suggestions: Lightbulb,
  rules: ScrollText,
  tournaments: Trophy,
  training: Shield
};

const categoryColors: Record<string, string> = {
  general: "from-ninja-chunin to-ninja-chunin/60",
  strategies: "from-ninja-jounin to-ninja-jounin/60",
  matches: "from-ninja-anbu to-ninja-anbu/60",
  suggestions: "from-accent to-accent/60",
  rules: "from-ninja-kage to-ninja-kage/60",
  tournaments: "from-ninja-sannin to-ninja-sannin/60",
  training: "from-primary to-primary/60"
};

const ForumCategories = ({ categories, activeCategory, onCategoryChange }: ForumCategoriesProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full" />
        <h2 className="font-ninja text-lg text-foreground uppercase tracking-wider">Categorias</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {categories.map((category) => {
          const Icon = categoryIcons[category.id] || MessageCircle;
          const colorClass = categoryColors[category.id] || "from-muted to-muted/60";
          const isActive = activeCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "relative group overflow-hidden rounded-xl p-4 text-left transition-all duration-300",
                "border hover:scale-[1.02]",
                isActive 
                  ? "bg-gradient-card border-primary/50 shadow-ninja" 
                  : "bg-card/50 border-border/30 hover:border-border/60"
              )}
            >
              {/* Background gradient on hover/active */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300",
                colorClass,
                isActive ? "opacity-10" : "group-hover:opacity-5"
              )} />

              <div className="relative z-10">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all duration-300",
                  isActive 
                    ? `bg-gradient-to-br ${colorClass}` 
                    : "bg-muted/50 group-hover:bg-muted"
                )}>
                  <Icon className={cn(
                    "w-5 h-5 transition-colors duration-300",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                </div>

                <h3 className={cn(
                  "font-semibold text-sm mb-1 transition-colors duration-300",
                  isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {category.name}
                </h3>

                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-medium",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {category.topicCount} tópicos
                  </span>
                  
                  {isActive && (
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
              </div>

              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ForumCategories;

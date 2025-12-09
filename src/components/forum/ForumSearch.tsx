import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ForumSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultsCount?: number;
}

const ForumSearch = ({ value, onChange, resultsCount }: ForumSearchProps) => {
  return (
    <div className="mb-6">
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar tópicos, autores, tags..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "pl-10 pr-10 bg-card/50 border-border/30 focus:border-primary/50",
              "transition-all duration-300 focus:shadow-ninja"
            )}
          />
          {value && (
            <button
              onClick={() => onChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <Button variant="outline" size="icon" className="border-border/30 hover:border-border/60">
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Results count */}
      {value && resultsCount !== undefined && (
        <div className="mt-2 text-xs text-muted-foreground">
          {resultsCount === 0 ? (
            <span>Nenhum resultado para "<span className="text-foreground">{value}</span>"</span>
          ) : (
            <span>
              <span className="text-primary font-medium">{resultsCount}</span> resultado{resultsCount !== 1 ? 's' : ''} para "<span className="text-foreground">{value}</span>"
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ForumSearch;

import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 p-4">
      <div className="max-w-md text-center space-y-4">
        <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
          Caminho nao encontrado
        </p>
        <h1 className="text-6xl font-black text-primary">404</h1>
        <p className="text-xl text-muted-foreground">
          Essa rota ainda nao existe na arena.
        </p>
        <Button asChild>
          <Link to="/">Voltar para o inicio</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

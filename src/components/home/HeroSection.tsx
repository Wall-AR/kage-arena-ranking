import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Swords, Target, User } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-naruto-sasuke.jpg";
import kageArenaLogo from "@/assets/kage-arena-logo.png";
import { User as UserType } from "@supabase/supabase-js";

interface HeroSectionProps {
  user: UserType | null;
  loading: boolean;
}

const HeroSection = ({ user, loading }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/75 to-background" />
      </div>
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <div className="space-y-8">
          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 px-4 py-2 text-sm">
            🥷 Portal Oficial de Ranking
          </Badge>
          
          <img 
            src={kageArenaLogo} 
            alt="Kage Arena" 
            className="h-44 md:h-60 w-auto object-contain mx-auto drop-shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700"
          />
          
          <h2 className="font-ninja text-2xl md:text-3xl font-semibold text-foreground tracking-wider">
            TORNE-SE UM VERDADEIRO KAGE
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A arena mais competitiva de <strong className="text-foreground">Naruto Shippuden: Ultimate Ninja 5</strong>. 
            Desafie os melhores, suba no ranking e conquiste o título supremo.
          </p>
          
          {!loading && (
            <div>
              {user ? (
                <Badge variant="secondary" className="bg-ninja-chunin/20 text-ninja-chunin border-ninja-chunin/30 px-3 py-1.5">
                  🟢 Conectado como {user.user_metadata?.name || user.email}
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30 px-3 py-1.5">
                  🔑 <Link to="/auth" className="underline hover:no-underline">Faça login para acessar</Link>
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            {user ? (
              <>
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 shadow-ninja px-8 py-5 text-lg font-ninja">
                  <Link to="/ranking">
                    <Swords className="w-5 h-5 mr-2" />
                    ENTRAR NA ARENA
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-accent text-accent hover:bg-accent/10 px-8 py-5 text-lg">
                  <Link to="/profile">
                    <User className="w-5 h-5 mr-2" />
                    MEU PERFIL
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 shadow-ninja px-10 py-5 text-lg font-ninja">
                <Link to="/auth">
                  <Target className="w-5 h-5 mr-2" />
                  FAZER LOGIN
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

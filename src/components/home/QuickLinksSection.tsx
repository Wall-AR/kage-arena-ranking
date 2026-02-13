import { Card, CardContent } from "@/components/ui/card";
import { Swords, Trophy, BookOpen, MessageCircle, Target, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { User as UserType } from "@supabase/supabase-js";

interface QuickLinksSectionProps {
  user: UserType | null;
}

const QuickLinksSection = ({ user }: QuickLinksSectionProps) => {
  const links = [
    { icon: Swords, label: "Desafios", desc: "Desafie outros ninjas", href: "/challenges", color: "text-primary" },
    { icon: Trophy, label: "Torneios", desc: "Competições oficiais", href: "/tournaments", color: "text-ninja-kage" },
    { icon: Target, label: "Ranking", desc: "Classificação geral", href: "/ranking", color: "text-ninja-chunin" },
    { icon: BookOpen, label: "Academia", desc: "Guias e tutoriais", href: "/academy", color: "text-ninja-jounin" },
    { icon: MessageCircle, label: "Fórum", desc: "Comunidade ninja", href: "/forum", color: "text-ninja-sannin" },
    { icon: Calendar, label: "Avaliações", desc: "Solicite sua avaliação", href: user ? "/profile" : "/auth", color: "text-ninja-anbu" },
  ];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-ninja text-2xl md:text-3xl font-bold text-foreground">
            ACESSO RÁPIDO
          </h2>
          <p className="text-muted-foreground mt-2">Explore todas as funcionalidades da arena</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {links.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link key={index} to={link.href}>
                <Card className="bg-gradient-card border-border/50 hover:border-primary/30 hover:shadow-ninja transition-all duration-300 cursor-pointer group h-full">
                  <CardContent className="pt-6 pb-4 text-center flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Icon className={`w-6 h-6 ${link.color}`} />
                    </div>
                    <div className="font-semibold text-sm text-foreground">{link.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{link.desc}</div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickLinksSection;

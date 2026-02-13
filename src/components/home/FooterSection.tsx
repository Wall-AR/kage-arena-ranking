import kageArenaLogo from "@/assets/kage-arena-logo.png";

const FooterSection = () => {
  return (
    <footer className="py-10 bg-card border-t border-border/50">
      <div className="container mx-auto px-4 text-center space-y-3">
        <img src={kageArenaLogo} alt="Kage Arena" className="h-10 w-auto object-contain mx-auto opacity-60" />
        <p className="text-muted-foreground text-sm">
          © 2025 Kage Arena - Criado por <span className="text-primary font-semibold">Wall</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Portal não oficial para competições de Naruto Shippuden: Ultimate Ninja 5
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;

import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Menu, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { EmergencyButton } from "@/components/ebook/EmergencyButton";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const navLinks = [
    { href: "#sobre", label: "Sobre" },
    { href: "#novidades", label: "Novidades" },
    { href: "#funcionalidades", label: "Funcionalidades" },
    { href: "/blog", label: "Blog" },
    { href: "#depoimentos", label: "Depoimentos" },
  ];
  
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b w-full max-w-full overflow-hidden">
      <div className="container mx-auto px-4 w-full max-w-full">
        <nav className="flex items-center justify-between h-16 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-base md:text-lg hover-scale min-w-0">
            <Heart className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
            <span className="hidden sm:inline truncate">Manual da Mulher Independente</span>
            <span className="sm:hidden">MMI</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-5">
            {navLinks.map(link => (
              <a 
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          
          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <EmergencyButton />
            <Button variant="ghost" asChild>
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button variant="hero" asChild className="hover-scale">
              <Link to="/auth">
                <Sparkles className="mr-2 h-4 w-4" />
                Começar Agora
              </Link>
            </Button>
          </div>
          
          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map(link => (
                  <a 
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      scrollToSection(e, link.href);
                      setIsOpen(false);
                    }}
                    className="text-lg font-medium hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <hr />
                <div className="flex items-center gap-2">
                  <EmergencyButton />
                  <span className="text-sm text-muted-foreground">Emergência</span>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    Entrar
                  </Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Começar Agora
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
};
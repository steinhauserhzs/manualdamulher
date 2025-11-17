import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Menu, BookOpen } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const navLinks = [
    { href: "#sobre", label: "Sobre" },
    { href: "#ebook", label: "E-book" },
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg hover-scale">
            <Heart className="h-6 w-6 text-primary" />
            <span className="hidden sm:inline">Manual da Mulher Independente</span>
            <span className="sm:hidden">MMI</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <a 
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          
          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button variant="hero" asChild className="hover-scale">
              <a href="#ebook" onClick={(e) => scrollToSection(e, "#ebook")}>
                <BookOpen className="mr-2 h-4 w-4" />
                Comprar E-book
              </a>
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
              <div className="flex flex-col gap-6 mt-8">
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
                <Button variant="outline" asChild>
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    Entrar
                  </Link>
                </Button>
                <Button variant="hero" asChild>
                  <a 
                    href="#ebook" 
                    onClick={(e) => {
                      scrollToSection(e, "#ebook");
                      setIsOpen(false);
                    }}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Comprar E-book
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
};

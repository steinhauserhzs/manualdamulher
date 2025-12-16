import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Heart, Sparkles, TrendingUp, Menu, Users, ShoppingBag, Stars } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookHeart, BookOpen, Library, Lightbulb, HelpCircle, Settings, CalendarDays, Bell, ShoppingCart, Download } from "lucide-react";
import { EmergencyButton } from "@/components/ebook/EmergencyButton";

const mainNavItems = [
  { path: "/dashboard", icon: Home, label: "Início", shortLabel: "Início" },
  { path: "/saude", icon: Heart, label: "Saúde", shortLabel: "Saúde" },
  { path: "/marketplace", icon: ShoppingBag, label: "Marketplace", shortLabel: "Loja" },
  { path: "/comunidade", icon: Users, label: "Comunidade", shortLabel: "Social" },
];

const menuItems = [
  { path: "/calendario", icon: CalendarDays, label: "Calendário" },
  { path: "/lembretes", icon: Bell, label: "Lembretes" },
  { path: "/lista-compras", icon: ShoppingCart, label: "Lista de Compras" },
  { path: "/financas", icon: TrendingUp, label: "Finanças" },
  { path: "/bem-estar", icon: Sparkles, label: "Bem-estar" },
  { path: "/horoscopo", icon: Stars, label: "Horóscopo" },
  { path: "/ebook", icon: BookOpen, label: "E-book" },
  { path: "/meu-diario", icon: BookHeart, label: "Meu Diário" },
  { path: "/blog", icon: BookOpen, label: "Blog" },
  { path: "/biblioteca", icon: Library, label: "Biblioteca" },
  { path: "/vida-pratica", icon: Lightbulb, label: "Vida Prática" },
  { path: "/instalar", icon: Download, label: "Instalar App" },
  { path: "/ajuda", icon: HelpCircle, label: "Ajuda" },
  { path: "/configuracoes", icon: Settings, label: "Configurações" },
];

export const BottomNav = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = () => {
    setIsOpen(false);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
      <div className="flex justify-around items-center h-16">
        {mainNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full",
              location.pathname === item.path
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs mt-1 hidden xs:inline">{item.label}</span>
            <span className="text-xs mt-1 xs:hidden">{item.shortLabel}</span>
          </Link>
        ))}
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground">
            <Menu className="h-6 w-6" />
            <span className="text-xs mt-1">Menu</span>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] flex flex-col">
            <SheetHeader className="flex-shrink-0">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <ScrollArea className="flex-1 mt-4">
              <div className="space-y-2 pr-4 pb-6">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleNavigation}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      location.pathname === item.path
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                
                <div className="flex items-center gap-3 px-4 py-3 border-t mt-4 pt-4">
                  <EmergencyButton />
                  <span className="text-sm">Contatos de Emergência</span>
                </div>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

import { Link, useLocation } from "react-router-dom";
import { Home, Heart, Sparkles, TrendingUp, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { StickyNote, BookOpen, Library, Lightbulb, HelpCircle, Settings } from "lucide-react";

const mainNavItems = [
  { path: "/dashboard", icon: Home, label: "Início" },
  { path: "/casa", icon: Home, label: "Casa" },
  { path: "/saude", icon: Heart, label: "Saúde" },
  { path: "/bem-estar", icon: Sparkles, label: "Bem-estar" },
];

const menuItems = [
  { path: "/financas", icon: TrendingUp, label: "Finanças" },
  { path: "/ebook", icon: BookOpen, label: "E-book" },
  { path: "/notas", icon: StickyNote, label: "Notas" },
  { path: "/blog", icon: BookOpen, label: "Blog" },
  { path: "/biblioteca", icon: Library, label: "Biblioteca" },
  { path: "/vida-pratica", icon: Lightbulb, label: "Vida Prática" },
  { path: "/ajuda", icon: HelpCircle, label: "Ajuda" },
  { path: "/configuracoes", icon: Settings, label: "Configurações" },
];

export const BottomNav = () => {
  const location = useLocation();

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
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
        
        <Sheet>
          <SheetTrigger className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground">
            <Menu className="h-6 w-6" />
            <span className="text-xs mt-1">Menu</span>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
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
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

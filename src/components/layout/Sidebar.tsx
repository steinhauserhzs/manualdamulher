import { Link, useLocation } from "react-router-dom";
import { Home, Heart, Sparkles, TrendingUp, StickyNote, BookOpen, Library, Lightbulb, HelpCircle, Settings, Crown, Users, ShoppingBag, Stars, CalendarDays, Bell, ShoppingCart, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EmergencyButton } from "@/components/ebook/EmergencyButton";
import { NotificacoesDropdown } from "@/components/comunidade/NotificacoesDropdown";

const mainNavItems = [
  { path: "/dashboard", icon: Home, label: "Dashboard" },
  { path: "/casa", icon: Home, label: "Casa" },
  { path: "/saude", icon: Heart, label: "Saúde" },
  { path: "/bem-estar", icon: Sparkles, label: "Bem-estar" },
  { path: "/financas", icon: TrendingUp, label: "Finanças" },
  { path: "/horoscopo", icon: Stars, label: "Horóscopo" },
  { path: "/comunidade", icon: Users, label: "Comunidade" },
  { path: "/marketplace", icon: ShoppingBag, label: "Marketplace" },
  { path: "/ebook", icon: BookOpen, label: "E-book" },
];

const secondaryNavItems = [
  { path: "/calendario", icon: CalendarDays, label: "Calendário" },
  { path: "/lembretes", icon: Bell, label: "Lembretes" },
  { path: "/lista-compras", icon: ShoppingCart, label: "Lista de Compras" },
  { path: "/notas", icon: StickyNote, label: "Notas" },
  { path: "/blog", icon: BookOpen, label: "Blog" },
  { path: "/biblioteca", icon: Library, label: "Biblioteca" },
  { path: "/vida-pratica", icon: Lightbulb, label: "Vida Prática" },
];

const utilityNavItems = [
  { path: "/instalar", icon: Download, label: "Instalar App" },
  { path: "/ajuda", icon: HelpCircle, label: "Ajuda" },
  { path: "/configuracoes", icon: Settings, label: "Configurações" },
];

export const Sidebar = () => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase.rpc('has_role', {
          _user_id: session.user.id,
          _role: 'admin'
        });
        setIsAdmin(data || false);
      }
    };
    checkAdmin();
  }, []);

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r h-screen sticky top-0">
      <div className="p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary">Manual da Mulher</h2>
          <p className="text-sm text-muted-foreground">Independente</p>
        </div>
        <NotificacoesDropdown />
      </div>
      
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="pt-4 mt-4 border-t space-y-1">
          {secondaryNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="pt-4 mt-4 border-t space-y-1">
          {utilityNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
          
          <div className="flex items-center gap-3 px-3 py-2">
            <EmergencyButton />
            <span className="text-sm text-muted-foreground">Emergência</span>
          </div>
        </div>
      </nav>
    </aside>
  );
};

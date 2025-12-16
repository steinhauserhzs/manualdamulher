import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  MessageSquare, 
  ShoppingBag, 
  FolderOpen, 
  BookOpen, 
  HelpCircle,
  ArrowLeft,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminMenuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Usuárias", url: "/admin/usuarios", icon: Users },
  { title: "Blog", url: "/admin/blog", icon: FileText },
  { title: "Comunidade", url: "/admin/comunidade", icon: MessageSquare },
  { title: "Marketplace", url: "/admin/marketplace", icon: ShoppingBag },
  { title: "Recursos", url: "/admin/recursos", icon: FolderOpen },
  { title: "E-book", url: "/admin/ebook", icon: BookOpen },
  { title: "Ajuda", url: "/admin/ajuda", icon: HelpCircle },
];

export const AdminSidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen p-4 hidden md:block">
      <div className="flex items-center gap-2 mb-8 px-2">
        <Shield className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">Admin Panel</span>
      </div>

      <nav className="space-y-1">
        {adminMenuItems.map((item) => (
          <Link
            key={item.url}
            to={item.url}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive(item.url)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        ))}
      </nav>

      <div className="mt-8 pt-8 border-t border-border">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao App
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;

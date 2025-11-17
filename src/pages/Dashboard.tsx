import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Home, Heart, TrendingUp, Sparkles, LogOut, User as UserIcon, BookOpen, StickyNote } from "lucide-react";
import { Link } from "react-router-dom";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      
      // Buscar perfil
      const { data: perfilData } = await supabase
        .from("perfis")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      
      setPerfil(perfilData);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h2 className="text-xl font-bold text-foreground">Manual da Mulher Independente</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Olá, {perfil?.nome || "Usuária"}! 👋
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 gradient-card rounded-3xl p-6 shadow-card md:p-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
            Bem-vinda ao seu espaço! 💜
          </h1>
          <p className="text-lg text-muted-foreground">
            Aqui você pode cuidar de você mesma, sem julgamentos. Cada pequeno passo conta.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Home className="h-6 w-6 text-primary" />}
            title="Casa"
            value="0 XP"
            description="Nenhuma tarefa hoje"
            link="/casa"
          />
          <StatCard
            icon={<Heart className="h-6 w-6 text-secondary" />}
            title="Saúde"
            value="0 ml"
            description="Água hoje"
            link="/saude"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6 text-accent" />}
            title="Finanças"
            value="R$ 0,00"
            description="Saldo do mês"
            link="/financas"
          />
          <StatCard
            icon={<Sparkles className="h-6 w-6 text-primary" />}
            title="Bem-estar"
            value="0/0"
            description="Hábitos de hoje"
            link="/bem-estar"
          />
        </div>

        {/* Main Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            icon={<Home className="h-8 w-8" />}
            title="Casa"
            description="Organize sua rotina e ganhe XP"
            link="/casa"
            color="primary"
          />
          <ActionCard
            icon={<Heart className="h-8 w-8" />}
            title="Saúde"
            description="Cuide do seu corpo e mente"
            link="/saude"
            color="secondary"
          />
          <ActionCard
            icon={<Sparkles className="h-8 w-8" />}
            title="Bem-estar"
            description="Cultive hábitos saudáveis"
            link="/bem-estar"
            color="accent"
          />
          <ActionCard
            icon={<TrendingUp className="h-8 w-8" />}
            title="Finanças"
            description="Organize suas contas"
            link="/financas"
            color="primary"
          />
          <ActionCard
            icon={<BookOpen className="h-8 w-8" />}
            title="Blog"
            description="Conteúdo inspirador"
            link="/blog"
            color="secondary"
          />
          <ActionCard
            icon={<StickyNote className="h-8 w-8" />}
            title="Notas"
            description="Suas anotações pessoais"
            link="/notas"
            color="accent"
          />
        </div>
      </main>
    </div>
  );
};

const StatCard = ({
  icon,
  title,
  value,
  description,
  link,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  link: string;
}) => {
  return (
    <Link to={link}>
      <Card className="gradient-card transition-transform hover:scale-105 hover:shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
};

const ActionCard = ({
  icon,
  title,
  description,
  link,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  color: "primary" | "secondary" | "accent";
}) => {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
  };

  return (
    <Link to={link}>
      <Card className="gradient-card h-full transition-transform hover:scale-105 hover:shadow-card">
        <CardHeader>
          <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${colorClasses[color]}`}>
            {icon}
          </div>
          <CardTitle className="text-foreground">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
};

export default Dashboard;

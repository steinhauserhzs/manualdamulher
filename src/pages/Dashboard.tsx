import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Home, Heart, TrendingUp, Sparkles, LogOut, User as UserIcon, BookOpen, StickyNote, Flame, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(7);
  const [level, setLevel] = useState(3);
  const [xp, setXp] = useState(250);
  const [nextLevelXp, setNextLevelXp] = useState(500);
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getGreetingEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "☀️";
    if (hour < 18) return "🌤️";
    return "🌙";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
      <header className="border-b border-border bg-card mb-8">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Manual da Mulher Independente</h2>
            <p className="text-sm text-muted-foreground">Seu espaço de organização e empoderamento</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
              <Flame className="h-5 w-5 text-primary" />
              <span className="font-semibold text-primary">{streak} dias</span>
            </div>
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">
                {perfil?.nome ? getInitials(perfil.nome) : "U"}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        {/* Welcome Section */}
        <div className="mb-8 relative overflow-hidden gradient-card rounded-2xl p-8 shadow-card">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="relative">
            <h1 className="mb-2 text-3xl font-bold text-foreground">
              {getGreeting()}, {perfil?.nome || "Querida"}! {getGreetingEmoji()}
            </h1>
            <p className="mb-6 text-lg text-muted-foreground">
              Você está arrasando! Continue assim e conquiste seus objetivos. 💜
            </p>
            
            {/* Level Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground">Nível {level}</span>
                </div>
                <span className="text-muted-foreground">{xp} / {nextLevelXp} XP</span>
              </div>
              <Progress value={(xp / nextLevelXp) * 100} className="h-2" />
            </div>
          </div>
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

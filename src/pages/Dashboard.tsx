import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Home, Heart, TrendingUp, Sparkles, LogOut, BookOpen, StickyNote, Flame, Award, ShoppingBag, Stars, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [nextLevelXp, setNextLevelXp] = useState(100);
  const [stats, setStats] = useState({
    casaXP: 0,
    aguaMl: 0,
    saldoMes: 0,
    habitosCompletos: 0,
    habitosTotal: 0,
  });
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
      
      const { data: perfilData } = await supabase
        .from("perfis")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      
      setPerfil(perfilData);
      
      // Calcular XP total de capítulos do e-book concluídos
      const { data: progressoEbook } = await supabase
        .from("ebook_progresso")
        .select("capitulo_id")
        .eq("user_id", session.user.id)
        .eq("concluido", true);
      
      const { data: capitulos } = await supabase
        .from("ebook_capitulos")
        .select("xp_recompensa");
      
      const xpEbook = (progressoEbook || []).length * 40; // 40 XP por capítulo
      
      // Calcular XP de tarefas de casa completadas (histórico)
      const { data: tarefasCompletas } = await supabase
        .from("tarefas_casa_historico")
        .select("tarefa_id")
        .eq("user_id", session.user.id);
      
      const xpCasa = (tarefasCompletas || []).length * 10; // 10 XP por tarefa
      
      const totalXP = xpEbook + xpCasa;
      const calculatedLevel = Math.floor(totalXP / 100) + 1;
      const xpAtual = totalXP % 100;
      
      setXp(xpAtual);
      setLevel(calculatedLevel);
      setNextLevelXp(100);
      
      // Calcular streak (dias consecutivos com atividade)
      const today = new Date().toISOString().split('T')[0];
      const { data: habitosHoje } = await supabase
        .from("habitos_bem_estar_historico")
        .select("data")
        .eq("user_id", session.user.id)
        .eq("concluido", true)
        .order("data", { ascending: false })
        .limit(30);
      
      let currentStreak = 0;
      if (habitosHoje && habitosHoje.length > 0) {
        const dates = habitosHoje.map(h => h.data);
        const uniqueDates = [...new Set(dates)].sort().reverse();
        
        let checkDate = new Date();
        for (const date of uniqueDates) {
          const habitDate = new Date(date);
          const diffDays = Math.floor((checkDate.getTime() - habitDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 1) {
            currentStreak++;
            checkDate = habitDate;
          } else {
            break;
          }
        }
      }
      setStreak(currentStreak);
      
      // Stats do Dashboard
      const { data: aguaHoje } = await supabase
        .from("registro_agua")
        .select("quantidade_ml")
        .eq("user_id", session.user.id)
        .eq("data", today);
      
      const totalAgua = (aguaHoje || []).reduce((sum, r) => sum + r.quantidade_ml, 0);
      
      const mesAtual = new Date().toISOString().slice(0, 7);
      const { data: transacoesMes } = await supabase
        .from("transacoes_financeiras")
        .select("valor, tipo")
        .eq("user_id", session.user.id)
        .gte("data", `${mesAtual}-01`);
      
      const saldoMes = (transacoesMes || []).reduce((sum, t) => {
        return sum + (t.tipo === 'receita' ? t.valor : -t.valor);
      }, 0);
      
      const { data: habitosAtivos } = await supabase
        .from("habitos_bem_estar")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("ativo", true);
      
      const { data: habitosCompletosHoje } = await supabase
        .from("habitos_bem_estar_historico")
        .select("habito_id")
        .eq("user_id", session.user.id)
        .eq("data", today)
        .eq("concluido", true);
      
      setStats({
        casaXP: xpCasa,
        aguaMl: totalAgua,
        saldoMes: saldoMes,
        habitosCompletos: (habitosCompletosHoje || []).length,
        habitosTotal: (habitosAtivos || []).length,
      });
      
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
      <header className="border-b border-border bg-card mb-6 sm:mb-8">
        <div className="container mx-auto flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-foreground">Manual da Mulher Independente</h2>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Seu espaço de organização e empoderamento</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-2 sm:px-4 py-1 sm:py-2">
              <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="text-xs sm:text-sm font-semibold text-primary">{streak}</span>
            </div>
            <Avatar className="h-8 w-8 sm:h-12 sm:w-12 ring-2 ring-primary/20">
              <AvatarImage src={perfil?.avatar_url || undefined} alt={perfil?.nome} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold text-xs sm:text-sm">
                {perfil?.nome ? getInitials(perfil.nome) : "U"}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="p-2">
              <LogOut className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline text-sm">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 pb-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8 relative overflow-hidden gradient-card rounded-2xl p-4 sm:p-8 shadow-card animate-fade-in">
          <div className="absolute top-0 right-0 h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute -left-4 -bottom-4 h-20 w-20 sm:h-28 sm:w-28 rounded-full bg-secondary/10 blur-2xl"></div>
          <div className="relative">
            <h1 className="mb-2 text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              {getGreeting()}, {perfil?.nome || "Querida"}! {getGreetingEmoji()}
            </h1>
            <p className="mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-muted-foreground">
              Você está arrasando! Continue assim e conquiste seus objetivos. 💜
            </p>
            
            {/* Level Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
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
        <div className="mb-6 sm:mb-8 grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Home className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
            title="Casa"
            value={`${stats.casaXP} XP`}
            description="Tarefas concluídas"
            link="/casa"
          />
          <StatCard
            icon={<Heart className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />}
            title="Saúde"
            value={`${stats.aguaMl} ml`}
            description="Água hoje"
            link="/saude"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />}
            title="Finanças"
            value={`R$ ${stats.saldoMes.toFixed(2)}`}
            description="Saldo do mês"
            link="/financas"
          />
          <StatCard
            icon={<Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
            title="Bem-estar"
            value={`${stats.habitosCompletos}/${stats.habitosTotal}`}
            description="Hábitos hoje"
            link="/bem-estar"
          />
        </div>

        {/* Novidades Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="text-xl">🆕</span> Novidades
          </h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Link to="/marketplace">
              <Card className="relative overflow-hidden border-2 border-secondary/30 bg-gradient-to-br from-secondary/10 via-background to-secondary/5 hover-lift h-full">
                <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-secondary/20 blur-2xl"></div>
                <CardHeader className="relative px-4 sm:px-6 pt-4 sm:pt-6">
                  <div className="mb-3 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-secondary/20 text-secondary">
                    <ShoppingBag className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <CardTitle className="text-foreground text-base sm:text-lg">Marketplace</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Brechó, serviços, cupons e muito mais!
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link to="/horoscopo">
              <Card className="relative overflow-hidden border-2 border-accent/30 bg-gradient-to-br from-accent/10 via-background to-accent/5 hover-lift h-full">
                <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-accent/20 blur-2xl"></div>
                <CardHeader className="relative px-4 sm:px-6 pt-4 sm:pt-6">
                  <div className="mb-3 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-accent/20 text-accent">
                    <Stars className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <CardTitle className="text-foreground text-base sm:text-lg">Horóscopo</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Sua conexão com o universo e previsões diárias
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link to="/comunidade" className="sm:col-span-2 lg:col-span-1">
              <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-primary/5 hover-lift h-full">
                <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-primary/20 blur-2xl"></div>
                <CardHeader className="relative px-4 sm:px-6 pt-4 sm:pt-6">
                  <div className="mb-3 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                    <Users className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <CardTitle className="text-foreground text-base sm:text-lg">Comunidade</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Conecte-se com outras mulheres independentes
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>

        {/* Main Actions */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">Ações Principais</h2>
          <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
            <ActionCard
              icon={<Home className="h-6 w-6 sm:h-8 sm:w-8" />}
              title="Casa"
              description="Organize sua rotina e ganhe XP"
              link="/casa"
              color="primary"
            />
            <ActionCard
              icon={<Heart className="h-6 w-6 sm:h-8 sm:w-8" />}
              title="Saúde"
              description="Cuide do seu corpo e mente"
              link="/saude"
              color="secondary"
            />
            <ActionCard
              icon={<Sparkles className="h-6 w-6 sm:h-8 sm:w-8" />}
              title="Bem-estar"
              description="Cultive hábitos saudáveis"
              link="/bem-estar"
              color="accent"
            />
            <ActionCard
              icon={<TrendingUp className="h-6 w-6 sm:h-8 sm:w-8" />}
              title="Finanças"
              description="Organize suas contas"
              link="/financas"
              color="primary"
            />
            <ActionCard
              icon={<BookOpen className="h-6 w-6 sm:h-8 sm:w-8" />}
              title="Blog"
              description="Conteúdo inspirador"
              link="/blog"
              color="secondary"
            />
            <ActionCard
              icon={<StickyNote className="h-6 w-6 sm:h-8 sm:w-8" />}
              title="Notas"
              description="Suas anotações pessoais"
              link="/notas"
              color="accent"
            />
          </div>
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
      <Card className="gradient-card hover-lift">
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-lg sm:text-2xl font-bold text-foreground break-words">{value}</div>
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
      <Card className="gradient-card h-full hover-lift animate-fade-in">
        <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
          <div className={`mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl ${colorClasses[color]}`}>
            {icon}
          </div>
          <CardTitle className="text-foreground text-base sm:text-lg">{title}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
};

export default Dashboard;

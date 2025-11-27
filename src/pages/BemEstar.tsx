import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Sparkles, Flame, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { AddHabitoDialog } from "@/components/bem-estar/AddHabitoDialog";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { EmptyStateVisual } from "@/components/ui/EmptyStateVisual";
import bemEstarIllustration from "@/assets/bem-estar-illustration.jpg";

interface Habito {
  id: string;
  nome: string;
  descricao: string | null;
  frequencia: string;
  ativo: boolean;
}

const BemEstar = () => {
  const [user, setUser] = useState<any>(null);
  const [habitos, setHabitos] = useState<Habito[]>([]);
  const [habitosHoje, setHabitosHoje] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
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
      await carregarHabitos(session.user.id);
      await calcularStreak(session.user.id);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const carregarHabitos = async (userId: string) => {
    const { data, error } = await supabase
      .from("habitos_bem_estar")
      .select("*")
      .eq("user_id", userId)
      .eq("ativo", true)
      .order("nome");

    if (error) {
      toast.error("Erro ao carregar hábitos");
      return;
    }

    setHabitos(data || []);

    const hoje = new Date().toISOString().split("T")[0];
    const { data: historico } = await supabase
      .from("habitos_bem_estar_historico")
      .select("habito_id")
      .eq("user_id", userId)
      .eq("data", hoje)
      .eq("concluido", true);

    if (historico) {
      setHabitosHoje(historico.map(h => h.habito_id));
    }
  };

  const calcularStreak = async (userId: string) => {
    const { data } = await supabase
      .from("habitos_bem_estar_historico")
      .select("data, concluido")
      .eq("user_id", userId)
      .eq("concluido", true)
      .order("data", { ascending: false })
      .limit(30);

    if (!data || data.length === 0) {
      setStreak(0);
      return;
    }

    let streakAtual = 0;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    for (let i = 0; i < data.length; i++) {
      const dataRegistro = new Date(data[i].data);
      dataRegistro.setHours(0, 0, 0, 0);
      
      const diffDias = Math.floor((hoje.getTime() - dataRegistro.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDias === streakAtual) {
        streakAtual++;
      } else {
        break;
      }
    }

    setStreak(streakAtual);
  };

  const marcarHabito = async (habito: Habito) => {
    if (!user) return;

    const jaConcluido = habitosHoje.includes(habito.id);
    const hoje = new Date().toISOString().split("T")[0];

    if (jaConcluido) {
      const { error } = await supabase
        .from("habitos_bem_estar_historico")
        .delete()
        .eq("habito_id", habito.id)
        .eq("user_id", user.id)
        .eq("data", hoje);

      if (error) {
        toast.error("Erro ao desmarcar hábito");
        return;
      }

      setHabitosHoje(prev => prev.filter(id => id !== habito.id));
      toast.info("Hábito desmarcado");
    } else {
      const { error } = await supabase
        .from("habitos_bem_estar_historico")
        .insert({
          user_id: user.id,
          habito_id: habito.id,
          data: hoje,
          concluido: true,
        });

      if (error) {
        toast.error("Erro ao marcar hábito");
        return;
      }

      setHabitosHoje(prev => [...prev, habito.id]);
      toast.success(`Hábito "${habito.nome}" concluído! ✨`);
    }

    await calcularStreak(user.id);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const progressoHoje = habitos.length > 0 ? (habitosHoje.length / habitos.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="mb-6">
        <div className="container mx-auto px-3 sm:px-4 pt-4 pb-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        </div>
        <ModuleHeader 
          icon={Sparkles}
          title="Bem-estar"
          subtitle="Cultive hábitos saudáveis"
          gradient="bem-estar"
        />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-6 space-y-4 sm:space-y-6 animate-fade-in">
        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
          <Card className="gradient-card shadow-card hover-lift">
            <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                Sequência
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <p className="text-2xl sm:text-4xl font-bold text-accent">{streak}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">dias</p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card hover-lift">
            <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <p className="text-2xl sm:text-4xl font-bold text-primary">
                {habitosHoje.length}/{habitos.length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">hábitos</p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card hover-lift col-span-2 lg:col-span-1">
            <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                Progresso
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <p className="text-2xl sm:text-4xl font-bold text-secondary">{Math.round(progressoHoje)}%</p>
              <p className="text-xs sm:text-sm text-muted-foreground">completo</p>
            </CardContent>
          </Card>
        </div>

        {/* Hábitos de Hoje */}
        <Card className="gradient-card shadow-card">
          <CardHeader className="px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg">Hábitos de Hoje</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Marque os hábitos conforme você os completa</CardDescription>
              </div>
              {user && <AddHabitoDialog userId={user.id} onHabitoAdded={() => carregarHabitos(user.id)} />}
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {habitos.length === 0 ? (
              <EmptyStateVisual
                icon={Sparkles}
                illustration={bemEstarIllustration}
                title="Nenhum hábito ainda"
                description="Comece criando seu primeiro hábito de bem-estar! Pequenas ações diárias fazem toda a diferença."
              />
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {habitos.map((habito) => {
                  const concluido = habitosHoje.includes(habito.id);
                  return (
                    <div
                      key={habito.id}
                      className={`flex items-start gap-3 sm:gap-4 rounded-lg border p-3 sm:p-4 transition-all hover-lift ${
                        concluido
                          ? "border-primary/40 bg-primary/5"
                          : "border-border bg-card hover:border-primary/20"
                      }`}
                    >
                      <Checkbox
                        checked={concluido}
                        onCheckedChange={() => marcarHabito(habito)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-sm sm:text-base break-words ${concluido ? "text-primary" : "text-foreground"}`}>
                          {habito.nome}
                        </h3>
                        {habito.descricao && (
                          <p className="text-xs sm:text-sm text-muted-foreground break-words">{habito.descricao}</p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground capitalize">
                          Frequência: {habito.frequencia}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BemEstar;
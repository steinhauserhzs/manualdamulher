import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Sparkles, Plus, Flame, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { AddHabitoDialog } from "@/components/bem-estar/AddHabitoDialog";

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

    // Carregar hábitos concluídos hoje
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

    // Calcular streak consecutivo
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
      // Desmarcar
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
      // Marcar
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
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Bem-estar & Autocuidado</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flame className="h-5 w-5 text-accent" />
                Sequência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-accent">{streak}</p>
              <p className="text-sm text-muted-foreground">dias consecutivos</p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">
                {habitosHoje.length}/{habitos.length}
              </p>
              <p className="text-sm text-muted-foreground">hábitos concluídos</p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card sm:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-secondary" />
                Progresso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-secondary">{Math.round(progressoHoje)}%</p>
              <p className="text-sm text-muted-foreground">do dia completo</p>
            </CardContent>
          </Card>
        </div>

        {/* Hábitos de Hoje */}
        <Card className="gradient-card shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Hábitos de Hoje</CardTitle>
                <CardDescription>Marque os hábitos conforme você os completa</CardDescription>
              </div>
              {user && <AddHabitoDialog userId={user.id} onHabitoAdded={() => carregarHabitos(user.id)} />}
            </div>
          </CardHeader>
          <CardContent>
            {habitos.length === 0 ? (
              <div className="py-12 text-center">
                <Sparkles className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <p className="mt-4 text-muted-foreground">
                  Nenhum hábito cadastrado ainda.
                </p>
                <p className="text-sm text-muted-foreground">
                  Comece criando seu primeiro hábito de bem-estar!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {habitos.map((habito) => {
                  const concluido = habitosHoje.includes(habito.id);
                  return (
                    <div
                      key={habito.id}
                      className={`flex items-start gap-4 rounded-lg border p-4 transition-all ${
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
                      <div className="flex-1">
                        <h3 className={`font-semibold ${concluido ? "text-primary" : "text-foreground"}`}>
                          {habito.nome}
                        </h3>
                        {habito.descricao && (
                          <p className="text-sm text-muted-foreground">{habito.descricao}</p>
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

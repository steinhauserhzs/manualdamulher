import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Trophy, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Tarefa {
  id: string;
  nome: string;
  descricao: string | null;
  pontos_xp: number;
  frequencia: string;
  ativo: boolean;
  categoria_id: string | null;
}

interface TarefaComCategoria extends Tarefa {
  categorias_tarefa_casa: {
    nome: string;
    icone: string;
  } | null;
}

const Casa = () => {
  const [user, setUser] = useState<any>(null);
  const [tarefas, setTarefas] = useState<TarefaComCategoria[]>([]);
  const [tarefasHoje, setTarefasHoje] = useState<string[]>([]);
  const [xpTotal, setXpTotal] = useState(0);
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
      await carregarTarefas(session.user.id);
      await carregarXP(session.user.id);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const carregarTarefas = async (userId: string) => {
    const { data, error } = await supabase
      .from("tarefas_casa")
      .select(`
        *,
        categorias_tarefa_casa (
          nome,
          icone
        )
      `)
      .eq("user_id", userId)
      .eq("ativo", true);

    if (error) {
      toast.error("Erro ao carregar tarefas");
      return;
    }

    setTarefas(data || []);

    // Carregar tarefas concluídas hoje
    const hoje = new Date().toISOString().split("T")[0];
    const { data: historico } = await supabase
      .from("tarefas_casa_historico")
      .select("tarefa_id")
      .eq("user_id", userId)
      .gte("data_conclusao", hoje);

    if (historico) {
      setTarefasHoje(historico.map(h => h.tarefa_id));
    }
  };

  const carregarXP = async (userId: string) => {
    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    inicioSemana.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("tarefas_casa_historico")
      .select("tarefa_id, tarefas_casa(pontos_xp)")
      .eq("user_id", userId)
      .gte("data_conclusao", inicioSemana.toISOString());

    if (data) {
      const total = data.reduce((acc: number, item: any) => {
        return acc + (item.tarefas_casa?.pontos_xp || 0);
      }, 0);
      setXpTotal(total);
    }
  };

  const marcarConcluida = async (tarefa: TarefaComCategoria) => {
    if (!user) return;

    const jaConcluida = tarefasHoje.includes(tarefa.id);

    if (jaConcluida) {
      // Desmarcar
      const hoje = new Date().toISOString().split("T")[0];
      const { error } = await supabase
        .from("tarefas_casa_historico")
        .delete()
        .eq("tarefa_id", tarefa.id)
        .eq("user_id", user.id)
        .gte("data_conclusao", hoje);

      if (error) {
        toast.error("Erro ao desmarcar tarefa");
        return;
      }

      setTarefasHoje(prev => prev.filter(id => id !== tarefa.id));
      setXpTotal(prev => prev - tarefa.pontos_xp);
      toast.info("Tarefa desmarcada");
    } else {
      // Marcar como concluída
      const { error } = await supabase
        .from("tarefas_casa_historico")
        .insert({
          tarefa_id: tarefa.id,
          user_id: user.id,
          data_conclusao: new Date().toISOString(),
        });

      if (error) {
        toast.error("Erro ao marcar tarefa");
        return;
      }

      setTarefasHoje(prev => [...prev, tarefa.id]);
      setXpTotal(prev => prev + tarefa.pontos_xp);
      toast.success(`+${tarefa.pontos_xp} XP! Arrasou! 🎉`);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const tarefasConcluidas = tarefasHoje.length;
  const totalTarefas = tarefas.length;
  const progresso = totalTarefas > 0 ? (tarefasConcluidas / totalTarefas) * 100 : 0;
  const nivel = Math.floor(xpTotal / 100) + 1;

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
          <h1 className="text-2xl font-bold text-foreground">Casa</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="gradient-card shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Zap className="h-4 w-4 text-xp" />
                XP desta Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-xp">{xpTotal} XP</div>
              <p className="text-sm text-muted-foreground">Nível {nivel}</p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Progresso de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-3xl font-bold text-foreground">
                {tarefasConcluidas}/{totalTarefas}
              </div>
              <Progress value={progresso} className="h-2" />
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Trophy className="h-4 w-4 text-warning" />
                Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">0</div>
              <p className="text-sm text-muted-foreground">Conquistas</p>
            </CardContent>
          </Card>
        </div>

        {/* Tarefas List */}
        <Card className="gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Suas Tarefas</CardTitle>
              <CardDescription>
                {totalTarefas === 0 ? "Nenhuma tarefa cadastrada" : "Marque as tarefas conforme concluir"}
              </CardDescription>
            </div>
            <Button variant="hero" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nova Tarefa
            </Button>
          </CardHeader>
          <CardContent>
            {tarefas.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>Você ainda não tem tarefas cadastradas.</p>
                <p className="text-sm">Clique em "Nova Tarefa" para começar!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tarefas.map((tarefa) => {
                  const concluida = tarefasHoje.includes(tarefa.id);
                  return (
                    <div
                      key={tarefa.id}
                      className={`flex items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                        concluida
                          ? "border-success bg-success/5"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <Checkbox
                        checked={concluida}
                        onCheckedChange={() => marcarConcluida(tarefa)}
                        className="h-6 w-6"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {tarefa.categorias_tarefa_casa && (
                            <span className="text-lg">{tarefa.categorias_tarefa_casa.icone}</span>
                          )}
                          <h3 className={`font-semibold ${concluida ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {tarefa.nome}
                          </h3>
                        </div>
                        {tarefa.descricao && (
                          <p className="text-sm text-muted-foreground">{tarefa.descricao}</p>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {tarefa.frequencia}
                          </Badge>
                          <Badge className="bg-xp/10 text-xp hover:bg-xp/20">
                            +{tarefa.pontos_xp} XP
                          </Badge>
                        </div>
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

export default Casa;

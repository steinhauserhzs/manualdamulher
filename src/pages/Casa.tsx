import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Trophy, Zap, Trash2, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AddTarefaDialog } from "@/components/casa/AddTarefaDialog";
import { BadgesSection } from "@/components/casa/BadgesSection";
import { NiveisSection } from "@/components/casa/NiveisSection";

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
    // Carregar XP total de todos os tempos
    const { data } = await supabase
      .from("tarefas_casa_historico")
      .select("tarefa_id, tarefas_casa(pontos_xp)")
      .eq("user_id", userId);

    if (data) {
      const total = data.reduce((acc: number, item: any) => {
        return acc + (item.tarefas_casa?.pontos_xp || 0);
      }, 0);
      setXpTotal(total);
    }
  };

  const deletarTarefa = async (tarefaId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;

    const { error } = await supabase
      .from("tarefas_casa")
      .update({ ativo: false })
      .eq("id", tarefaId);

    if (error) {
      toast.error("Erro ao excluir tarefa");
      return;
    }

    toast.success("Tarefa excluída");
    if (user) await carregarTarefas(user.id);
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
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-2">
          <NiveisSection xpTotal={xpTotal} />
          <Card className="gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-accent" />
                Progresso de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-accent">{tarefasHoje.length}</span>
                <span className="text-muted-foreground">de {tarefas.length} tarefas</span>
              </div>
              <Progress value={tarefas.length > 0 ? (tarefasHoje.length / tarefas.length) * 100 : 0} className="h-3" />
            </CardContent>
          </Card>
        </div>
        {user && <BadgesSection userId={user.id} />}
        <Card className="gradient-card shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tarefas de Casa</CardTitle>
                <CardDescription>Marque as tarefas conforme você as completa</CardDescription>
              </div>
              {user && <AddTarefaDialog userId={user.id} onTarefaAdded={() => carregarTarefas(user.id)} />}
            </div>
          </CardHeader>
          <CardContent>
            {tarefas.length === 0 ? (
              <div className="py-12 text-center">
                <Trophy className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <p className="mt-4 text-muted-foreground">Nenhuma tarefa cadastrada ainda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tarefas.map((tarefa) => {
                  const concluida = tarefasHoje.includes(tarefa.id);
                  return (
                    <div key={tarefa.id} className={`flex items-start gap-4 rounded-lg border p-4 transition-all ${concluida ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:border-primary/20"}`}>
                      <Checkbox checked={concluida} onCheckedChange={() => marcarConcluida(tarefa)} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className={`font-semibold ${concluida ? "text-primary" : "text-foreground"}`}>{tarefa.nome}</h3>
                            {tarefa.descricao && <p className="text-sm text-muted-foreground">{tarefa.descricao}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">+{tarefa.pontos_xp} XP</Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deletarTarefa(tarefa.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
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

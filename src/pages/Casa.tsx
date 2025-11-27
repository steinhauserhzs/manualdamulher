import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Home, Trophy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AddTarefaDialog } from "@/components/casa/AddTarefaDialog";
import { BadgesSection } from "@/components/casa/BadgesSection";
import { NiveisSection } from "@/components/casa/NiveisSection";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { EmptyStateVisual } from "@/components/ui/EmptyStateVisual";
import casaIllustration from "@/assets/casa-illustration.jpg";

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
          icon={Home}
          title="Casa"
          subtitle="Organize sua rotina e ganhe XP"
          gradient="casa"
        />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-6 space-y-4 sm:space-y-6 animate-fade-in">
        {/* Stats Row */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
          <NiveisSection xpTotal={xpTotal} />
          <Card className="gradient-card shadow-card hover-lift">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                Progresso de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
              <div className="flex items-center justify-between">
                <span className="text-2xl sm:text-3xl font-bold text-accent">{tarefasHoje.length}</span>
                <span className="text-xs sm:text-sm text-muted-foreground">de {tarefas.length} tarefas</span>
              </div>
              <Progress value={tarefas.length > 0 ? (tarefasHoje.length / tarefas.length) * 100 : 0} className="h-2 sm:h-3" />
            </CardContent>
          </Card>
        </div>

        {user && <BadgesSection userId={user.id} />}

        {/* Tarefas Card */}
        <Card className="gradient-card shadow-card">
          <CardHeader className="px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg">Tarefas de Casa</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Marque as tarefas conforme você as completa</CardDescription>
              </div>
              {user && <AddTarefaDialog userId={user.id} onTarefaAdded={() => carregarTarefas(user.id)} />}
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {tarefas.length === 0 ? (
              <EmptyStateVisual
                icon={Trophy}
                illustration={casaIllustration}
                title="Sua lista está vazia! 📝"
                description="Que tal adicionar sua primeira tarefa? Cada pequeno passo conta!"
              />
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {tarefas.map((tarefa) => {
                  const concluida = tarefasHoje.includes(tarefa.id);
                  return (
                    <div 
                      key={tarefa.id} 
                      className={`flex items-start gap-3 sm:gap-4 rounded-lg border p-3 sm:p-4 transition-all hover-lift ${
                        concluida ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:border-primary/20"
                      }`}
                    >
                      <Checkbox 
                        checked={concluida} 
                        onCheckedChange={() => marcarConcluida(tarefa)} 
                        className="mt-1" 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold text-sm sm:text-base break-words ${concluida ? "text-primary" : "text-foreground"}`}>
                              {tarefa.nome}
                            </h3>
                            {tarefa.descricao && (
                              <p className="text-xs sm:text-sm text-muted-foreground break-words">{tarefa.descricao}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant="secondary" className="text-xs">+{tarefa.pontos_xp} XP</Badge>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 sm:h-8 sm:w-8" 
                              onClick={() => deletarTarefa(tarefa.id)}
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
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
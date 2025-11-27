import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Target } from "lucide-react";
import { toast } from "sonner";
import { AddTransacaoDialog } from "@/components/financas/AddTransacaoDialog";
import { AddMetaDialog } from "@/components/financas/AddMetaDialog";
import { Progress } from "@/components/ui/progress";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { EmptyStateVisual } from "@/components/ui/EmptyStateVisual";
import { DecorativeCard } from "@/components/ui/DecorativeCard";
import financasIllustration from "@/assets/financas-illustration.jpg";

interface Transacao {
  id: string;
  tipo: string;
  categoria: string;
  valor: number;
  descricao: string | null;
  data: string;
}

interface Meta {
  id: string;
  nome: string;
  valor_total: number;
  valor_atual: number;
  data_limite: string | null;
}

const Financas = () => {
  const [user, setUser] = useState<any>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);
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
      await carregarDados(session.user.id);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const carregarDados = async (userId: string) => {
    await carregarTransacoes(userId);
    await carregarMetas(userId);
  };

  const carregarTransacoes = async (userId: string) => {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split("T")[0];
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("transacoes_financeiras")
      .select("*")
      .eq("user_id", userId)
      .gte("data", primeiroDia)
      .lte("data", ultimoDia)
      .order("data", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar transações");
      return;
    }

    setTransacoes(data || []);

    const receitas = data?.filter(t => t.tipo === "receita").reduce((acc, t) => acc + t.valor, 0) || 0;
    const despesas = data?.filter(t => t.tipo === "despesa").reduce((acc, t) => acc + t.valor, 0) || 0;
    
    setTotalReceitas(receitas);
    setTotalDespesas(despesas);
  };

  const carregarMetas = async (userId: string) => {
    const { data, error } = await supabase
      .from("metas_financeiras")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar metas");
      return;
    }

    setMetas(data || []);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const saldo = totalReceitas - totalDespesas;

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
          icon={Wallet}
          title="Finanças"
          subtitle="Organize suas contas"
          gradient="financas"
        />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-6 space-y-4 sm:space-y-6 animate-fade-in">
        {/* Resumo Financeiro */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <DecorativeCard 
            illustration={financasIllustration}
            className={`hover-lift ${saldo >= 0 ? "border-primary/20" : "border-destructive/20"}`}
          >
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
                Saldo do Mês
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <p className={`text-2xl sm:text-4xl font-bold break-words ${saldo >= 0 ? "text-primary" : "text-destructive"}`}>
                R$ {saldo.toFixed(2)}
              </p>
            </CardContent>
          </DecorativeCard>

          <Card className="gradient-card shadow-card border-green-500/20 hover-lift">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                Receitas
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <p className="text-2xl sm:text-4xl font-bold text-green-500 break-words">R$ {totalReceitas.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card border-red-500/20 hover-lift col-span-1 sm:col-span-2 lg:col-span-1">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                Despesas
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <p className="text-2xl sm:text-4xl font-bold text-red-500 break-words">R$ {totalDespesas.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Transações */}
        <Card className="gradient-card shadow-card">
          <CardHeader className="px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg">Transações do Mês</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Suas receitas e despesas recentes</CardDescription>
              </div>
              {user && <AddTransacaoDialog userId={user.id} onTransacaoAdded={() => carregarDados(user.id)} />}
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {transacoes.length === 0 ? (
              <EmptyStateVisual
                icon={Wallet}
                illustration={financasIllustration}
                title="Nenhuma transação ainda"
                description="Comece registrando suas receitas e despesas para ter controle total das suas finanças!"
              />
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {transacoes.map((transacao) => (
                  <div
                    key={transacao.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 sm:p-4 hover-lift"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full flex-shrink-0 ${
                        transacao.tipo === "receita" ? "bg-green-500/10" : "bg-red-500/10"
                      }`}>
                        {transacao.tipo === "receita" ? (
                          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm sm:text-base break-words">{transacao.categoria}</p>
                        {transacao.descricao && (
                          <p className="text-xs sm:text-sm text-muted-foreground break-words">{transacao.descricao}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(transacao.data).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <p className={`text-base sm:text-lg font-bold flex-shrink-0 ml-2 ${
                      transacao.tipo === "receita" ? "text-green-500" : "text-red-500"
                    }`}>
                      {transacao.tipo === "receita" ? "+" : "-"}R$ {transacao.valor.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metas Financeiras */}
        <Card className="gradient-card shadow-card">
          <CardHeader className="px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                  Metas Financeiras
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Acompanhe suas economias e objetivos</CardDescription>
              </div>
              {user && <AddMetaDialog userId={user.id} onMetaAdded={() => carregarDados(user.id)} />}
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {metas.length === 0 ? (
              <EmptyStateVisual
                icon={Target}
                title="Nenhuma meta ainda"
                description="Crie suas metas financeiras e acompanhe seu progresso rumo aos seus sonhos!"
              />
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {metas.map((meta) => {
                  const progresso = (meta.valor_atual / meta.valor_total) * 100;
                  return (
                    <div key={meta.id} className="rounded-lg border border-border bg-card p-3 sm:p-4 hover-lift">
                      <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base break-words">{meta.nome}</h3>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {meta.data_limite && `Até ${new Date(meta.data_limite).toLocaleDateString("pt-BR")}`}
                        </span>
                      </div>
                      <div className="mb-2">
                        <Progress value={progresso} className="h-2 sm:h-3" />
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground break-words">
                          R$ {meta.valor_atual.toFixed(2)} de R$ {meta.valor_total.toFixed(2)}
                        </span>
                        <span className="font-semibold text-accent flex-shrink-0 ml-2">{Math.round(progresso)}%</span>
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

export default Financas;
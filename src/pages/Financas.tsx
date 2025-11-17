import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Target, Plus } from "lucide-react";
import { toast } from "sonner";
import { AddTransacaoDialog } from "@/components/financas/AddTransacaoDialog";
import { AddMetaDialog } from "@/components/financas/AddMetaDialog";
import { Progress } from "@/components/ui/progress";

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
    // Carregar transações do mês atual
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

    // Calcular totais
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
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Finanças</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Resumo Financeiro */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className={`gradient-card shadow-card ${saldo >= 0 ? "border-primary/20" : "border-destructive/20"}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wallet className="h-5 w-5" />
                Saldo do Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-4xl font-bold ${saldo >= 0 ? "text-primary" : "text-destructive"}`}>
                R$ {saldo.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Receitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-500">R$ {totalReceitas.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingDown className="h-5 w-5 text-red-500" />
                Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-red-500">R$ {totalDespesas.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Transações */}
        <Card className="gradient-card shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transações do Mês</CardTitle>
                <CardDescription>Suas receitas e despesas recentes</CardDescription>
              </div>
              {user && <AddTransacaoDialog userId={user.id} onTransacaoAdded={() => carregarDados(user.id)} />}
            </div>
          </CardHeader>
          <CardContent>
            {transacoes.length === 0 ? (
              <div className="py-12 text-center">
                <Wallet className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <p className="mt-4 text-muted-foreground">Nenhuma transação registrada ainda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transacoes.map((transacao) => (
                  <div
                    key={transacao.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        transacao.tipo === "receita" ? "bg-green-500/10" : "bg-red-500/10"
                      }`}>
                        {transacao.tipo === "receita" ? (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{transacao.categoria}</p>
                        {transacao.descricao && (
                          <p className="text-sm text-muted-foreground">{transacao.descricao}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(transacao.data).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <p className={`text-lg font-bold ${
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
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-accent" />
                  Metas Financeiras
                </CardTitle>
                <CardDescription>Acompanhe suas economias e objetivos</CardDescription>
              </div>
              {user && <AddMetaDialog userId={user.id} onMetaAdded={() => carregarDados(user.id)} />}
            </div>
          </CardHeader>
          <CardContent>
            {metas.length === 0 ? (
              <div className="py-12 text-center">
                <Target className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <p className="mt-4 text-muted-foreground">Nenhuma meta criada ainda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {metas.map((meta) => {
                  const progresso = (meta.valor_atual / meta.valor_total) * 100;
                  return (
                    <div key={meta.id} className="rounded-lg border border-border bg-card p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">{meta.nome}</h3>
                        <span className="text-sm text-muted-foreground">
                          {meta.data_limite && `Até ${new Date(meta.data_limite).toLocaleDateString("pt-BR")}`}
                        </span>
                      </div>
                      <div className="mb-2">
                        <Progress value={progresso} className="h-3" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          R$ {meta.valor_atual.toFixed(2)} de R$ {meta.valor_total.toFixed(2)}
                        </span>
                        <span className="font-semibold text-accent">{Math.round(progresso)}%</span>
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

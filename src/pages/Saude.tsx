import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Droplets, Plus, Utensils, Heart } from "lucide-react";
import { toast } from "sonner";
import { AddRefeicaoDialog } from "@/components/saude/AddRefeicaoDialog";
import { HumorDialog } from "@/components/saude/HumorDialog";

interface Refeicao {
  id: string;
  tipo: string;
  descricao: string | null;
  data_hora: string;
}

const Saude = () => {
  const [user, setUser] = useState<any>(null);
  const [aguaHoje, setAguaHoje] = useState(0);
  const [metaAgua] = useState(2000);
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
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
    await carregarAguaHoje(userId);
    await carregarRefeicoes(userId);
  };

  const carregarAguaHoje = async (userId: string) => {
    const hoje = new Date().toISOString().split("T")[0];
    
    const { data, error } = await supabase
      .from("registro_agua")
      .select("quantidade_ml")
      .eq("user_id", userId)
      .eq("data", hoje);

    if (error) {
      toast.error("Erro ao carregar registros de água");
      return;
    }

    const total = data?.reduce((acc, reg) => acc + reg.quantidade_ml, 0) || 0;
    setAguaHoje(total);
  };

  const carregarRefeicoes = async (userId: string) => {
    const hoje = new Date().toISOString().split("T")[0];
    
    const { data, error } = await supabase
      .from("refeicoes")
      .select("*")
      .eq("user_id", userId)
      .gte("data_hora", hoje)
      .order("data_hora", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar refeições");
      return;
    }

    setRefeicoes(data || []);
  };

  const adicionarAgua = async (quantidade: number) => {
    if (!user) return;

    const hoje = new Date().toISOString().split("T")[0];

    const { error } = await supabase
      .from("registro_agua")
      .insert({
        user_id: user.id,
        data: hoje,
        quantidade_ml: quantidade,
      });

    if (error) {
      toast.error("Erro ao registrar água");
      return;
    }

    setAguaHoje(prev => prev + quantidade);
    toast.success(`+${quantidade}ml registrado! 💧`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const progressoAgua = (aguaHoje / metaAgua) * 100;

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
          <h1 className="text-2xl font-bold text-foreground">Saúde</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card className="gradient-card shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-secondary" />
                  Como você está hoje?
                </CardTitle>
                <CardDescription>Registre seu humor e energia do dia</CardDescription>
              </div>
              {user && <HumorDialog userId={user.id} onHumorSalvo={() => {}} />}
            </div>
          </CardHeader>
        </Card>
        <Card className="gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-6 w-6 text-accent" />
              Água de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-3xl font-bold text-accent">{aguaHoje}ml</span>
                <span className="text-sm text-muted-foreground">Meta: {metaAgua}ml</span>
              </div>
              <Progress value={progressoAgua} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Button onClick={() => adicionarAgua(250)} variant="outline" className="flex flex-col gap-2 h-auto py-4">
                <Droplets className="h-5 w-5" />
                <span className="text-xs">+250ml</span>
              </Button>
              <Button onClick={() => adicionarAgua(500)} variant="outline" className="flex flex-col gap-2 h-auto py-4">
                <Droplets className="h-5 w-5" />
                <span className="text-xs">+500ml</span>
              </Button>
              <Button onClick={() => adicionarAgua(750)} variant="outline" className="flex flex-col gap-2 h-auto py-4">
                <Droplets className="h-5 w-5" />
                <span className="text-xs">+750ml</span>
              </Button>
              <Button onClick={() => adicionarAgua(1000)} variant="outline" className="flex flex-col gap-2 h-auto py-4">
                <Droplets className="h-5 w-5" />
                <span className="text-xs">+1L</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="gradient-card shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-6 w-6 text-primary" />
                  Alimentação de Hoje
                </CardTitle>
              </div>
              {user && <AddRefeicaoDialog userId={user.id} onRefeicaoAdded={() => carregarDados(user.id)} />}
            </div>
          </CardHeader>
          <CardContent>
            {refeicoes.length === 0 ? (
              <div className="py-8 text-center">
                <Utensils className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
                <p className="mt-3 text-sm text-muted-foreground">Nenhuma refeição registrada hoje</p>
              </div>
            ) : (
              <div className="space-y-3">
                {refeicoes.map((refeicao) => (
                  <div key={refeicao.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Utensils className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold capitalize text-foreground">{refeicao.tipo}</h4>
                      {refeicao.descricao && <p className="text-sm text-muted-foreground">{refeicao.descricao}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Saude;

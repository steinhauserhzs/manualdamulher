import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Droplets, Utensils, Heart } from "lucide-react";
import { toast } from "sonner";
import { AddRefeicaoDialog } from "@/components/saude/AddRefeicaoDialog";
import { HumorDialog } from "@/components/saude/HumorDialog";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { EmptyStateVisual } from "@/components/ui/EmptyStateVisual";
import { DecorativeCard } from "@/components/ui/DecorativeCard";
import saudeIllustration from "@/assets/saude-illustration.jpg";

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
      <div className="mb-6">
        <div className="container mx-auto px-3 sm:px-4 pt-4 pb-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        </div>
        <ModuleHeader 
          icon={Heart}
          title="Saúde"
          subtitle="Cuide do seu corpo e mente"
          gradient="saude"
        />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-6 space-y-4 sm:space-y-6 animate-fade-in">
        {/* Humor Card */}
        <Card className="gradient-card shadow-card hover-lift">
          <CardHeader className="px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                  Como você está hoje?
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Registre seu humor e energia do dia</CardDescription>
              </div>
              {user && <HumorDialog userId={user.id} onHumorSalvo={() => {}} />}
            </div>
          </CardHeader>
        </Card>

        {/* Água Card */}
        <DecorativeCard illustration={saudeIllustration}>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Droplets className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              Água de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-2xl sm:text-3xl font-bold text-accent">{aguaHoje}ml</span>
                <span className="text-xs sm:text-sm text-muted-foreground">Meta: {metaAgua}ml</span>
              </div>
              <Progress value={progressoAgua} className="h-2 sm:h-3" />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button onClick={() => adicionarAgua(250)} variant="outline" className="flex flex-col gap-1 sm:gap-2 h-auto py-3 sm:py-4">
                <Droplets className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs">+250ml</span>
              </Button>
              <Button onClick={() => adicionarAgua(500)} variant="outline" className="flex flex-col gap-1 sm:gap-2 h-auto py-3 sm:py-4">
                <Droplets className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs">+500ml</span>
              </Button>
              <Button onClick={() => adicionarAgua(750)} variant="outline" className="flex flex-col gap-1 sm:gap-2 h-auto py-3 sm:py-4">
                <Droplets className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs">+750ml</span>
              </Button>
              <Button onClick={() => adicionarAgua(1000)} variant="outline" className="flex flex-col gap-1 sm:gap-2 h-auto py-3 sm:py-4">
                <Droplets className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs">+1L</span>
              </Button>
            </div>
          </CardContent>
        </DecorativeCard>

        {/* Refeições Card */}
        <Card className="gradient-card shadow-card">
          <CardHeader className="px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Utensils className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  Alimentação de Hoje
                </CardTitle>
              </div>
              {user && <AddRefeicaoDialog userId={user.id} onRefeicaoAdded={() => carregarDados(user.id)} />}
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {refeicoes.length === 0 ? (
              <EmptyStateVisual
                icon={Utensils}
                illustration={saudeIllustration}
                title="Nenhuma refeição ainda"
                description="Que tal registrar o que você comeu hoje? Cada passo na sua jornada de saúde conta!"
              />
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {refeicoes.map((refeicao) => (
                  <div key={refeicao.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 sm:p-4 hover-lift">
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                      <Utensils className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold capitalize text-foreground text-sm sm:text-base">{refeicao.tipo}</h4>
                      {refeicao.descricao && <p className="text-xs sm:text-sm text-muted-foreground break-words">{refeicao.descricao}</p>}
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
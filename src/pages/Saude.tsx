import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Droplets, Plus } from "lucide-react";
import { toast } from "sonner";

const Saude = () => {
  const [user, setUser] = useState<any>(null);
  const [aguaHoje, setAguaHoje] = useState(0);
  const [metaAgua] = useState(2000); // 2L por padrão
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
      await carregarAguaHoje(session.user.id);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

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
      <main className="container mx-auto px-4 py-8">
        {/* Água Card */}
        <Card className="gradient-card mb-6 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-6 w-6 text-accent" />
              Água de Hoje
            </CardTitle>
            <CardDescription>
              Mantenha-se hidratada para ter mais energia e saúde
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-3xl font-bold text-accent">
                  {aguaHoje}ml
                </span>
                <span className="text-sm text-muted-foreground">
                  Meta: {metaAgua}ml
                </span>
              </div>
              <Progress value={progressoAgua} className="h-3" />
              {aguaHoje >= metaAgua && (
                <p className="mt-2 text-sm font-semibold text-success">
                  🎉 Meta alcançada! Parabéns!
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => adicionarAgua(250)}
                className="flex-1 min-w-[100px]"
              >
                +250ml
              </Button>
              <Button
                variant="outline"
                onClick={() => adicionarAgua(500)}
                className="flex-1 min-w-[100px]"
              >
                +500ml
              </Button>
              <Button
                variant="outline"
                onClick={() => adicionarAgua(1000)}
                className="flex-1 min-w-[100px]"
              >
                +1L
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Other Health Modules - Coming Soon */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="gradient-card shadow-card">
            <CardHeader>
              <CardTitle>Humor & Energia</CardTitle>
              <CardDescription>
                Como você está se sentindo hoje?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Em breve...</p>
                <Button variant="outline" disabled>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Humor
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card">
            <CardHeader>
              <CardTitle>Ciclo Menstrual</CardTitle>
              <CardDescription>
                Acompanhe seu ciclo e sintomas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Em breve...</p>
                <Button variant="outline" disabled>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Período
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-card">
            <CardHeader>
              <CardTitle>Refeições</CardTitle>
              <CardDescription>
                Registre suas refeições do dia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Em breve...</p>
                <Button variant="outline" disabled>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Refeição
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Saude;

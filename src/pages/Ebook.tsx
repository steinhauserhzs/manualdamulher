import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Trophy, CheckCircle2, Lock, Zap, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { EmptyStateVisual } from "@/components/ui/EmptyStateVisual";

interface Capitulo {
  id: string;
  numero: number;
  titulo: string;
  tempo_leitura: number;
  xp_recompensa: number;
  ordem: number;
}

interface CapituloComProgresso extends Capitulo {
  progresso?: number;
  concluido?: boolean;
  posicao_scroll?: number;
}

export default function Ebook() {
  const navigate = useNavigate();
  const [capitulos, setCapitulos] = useState<CapituloComProgresso[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressoGeral, setProgressoGeral] = useState(0);
  const [xpTotal, setXpTotal] = useState(0);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: caps, error: capsError } = await supabase
        .from("ebook_capitulos")
        .select("*")
        .order("ordem", { ascending: true });

      if (capsError) throw capsError;

      const { data: progresso, error: progressoError } = await supabase
        .from("ebook_progresso")
        .select("*")
        .eq("user_id", user.id);

      if (progressoError) throw progressoError;

      const capitulosComProgresso = caps?.map(cap => {
        const prog = progresso?.find(p => p.capitulo_id === cap.id);
        return {
          ...cap,
          progresso: prog?.progresso || 0,
          concluido: prog?.concluido || false,
          posicao_scroll: prog?.posicao_scroll || 0,
        };
      }) || [];

      setCapitulos(capitulosComProgresso);

      const concluidos = capitulosComProgresso.filter(c => c.concluido).length;
      const total = capitulosComProgresso.length;
      setProgressoGeral(total > 0 ? (concluidos / total) * 100 : 0);

      const xp = capitulosComProgresso
        .filter(c => c.concluido)
        .reduce((sum, c) => sum + c.xp_recompensa, 0);
      setXpTotal(xp);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar e-book");
    } finally {
      setLoading(false);
    }
  };

  const abrirCapitulo = (capitulo: CapituloComProgresso) => {
    navigate(`/ebook/${capitulo.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const capitulosLidos = capitulos.filter(c => c.concluido).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6">
        <div className="container mx-auto px-3 sm:px-4 pt-4 pb-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        </div>
        <ModuleHeader 
          icon={BookOpen}
          title="E-book"
          subtitle="Manual da Mulher Independente"
          gradient="ebook"
        />
      </div>

      <main className="container mx-auto px-3 sm:px-4 py-6 space-y-4 sm:space-y-6 animate-fade-in">
        <Card className="gradient-card shadow-card hover-lift">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              Seu Progresso de Leitura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-2xl sm:text-3xl font-bold text-primary">{Math.round(progressoGeral)}%</span>
                <span className="text-xs sm:text-sm text-muted-foreground">{capitulosLidos} de {capitulos.length}</span>
              </div>
              <Progress value={progressoGeral} className="h-2 sm:h-3" />
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-xp" />
              <span>{xpTotal} XP conquistados</span>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-card">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Capítulos</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Comece sua jornada de leitura</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {capitulos.length === 0 ? (
              <EmptyStateVisual
                icon={BookOpen}
                title="Nenhum capítulo ainda"
                description="Os capítulos do e-book estarão disponíveis em breve!"
              />
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {capitulos.map((capitulo, index) => {
                  const capituloAnteriorConcluido = index === 0 || capitulos[index - 1].concluido;
                  const bloqueado = !capituloAnteriorConcluido && !capitulo.concluido;

                  return (
                    <div
                      key={capitulo.id}
                      className={`rounded-lg border p-3 sm:p-4 transition-all hover-lift ${
                        bloqueado ? "border-muted bg-muted/20 opacity-60" : capitulo.concluido ? "border-primary/40 bg-primary/5 hover:bg-primary/10" : "border-border bg-card hover:border-primary/20"
                      }`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full flex-shrink-0 ${bloqueado ? "bg-muted" : capitulo.concluido ? "bg-primary/20" : "bg-accent/20"}`}>
                          {bloqueado ? <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" /> : capitulo.concluido ? <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> : <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-1">
                            <h3 className={`font-semibold text-sm sm:text-base break-words ${bloqueado ? "text-muted-foreground" : "text-foreground"}`}>
                              {capitulo.numero}. {capitulo.titulo}
                            </h3>
                            <Badge variant={capitulo.concluido ? "default" : "secondary"} className="text-xs self-start">
                              +{capitulo.xp_recompensa} XP
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>{capitulo.tempo_leitura} min</span>
                            </div>
                            <span className="hidden sm:inline">•</span>
                            <span>{capitulo.concluido ? "Concluído" : capitulo.progresso > 0 ? `${capitulo.progresso}% lido` : bloqueado ? "Bloqueado" : "Não iniciado"}</span>
                          </div>
                          {capitulo.progresso > 0 && capitulo.progresso < 100 && (
                            <div className="mb-2 sm:mb-3">
                              <Progress value={capitulo.progresso} className="h-1.5 sm:h-2" />
                            </div>
                          )}
                          <Button onClick={() => abrirCapitulo(capitulo)} disabled={bloqueado} size="sm" variant={capitulo.concluido ? "outline" : "default"} className="text-xs sm:text-sm">
                            {capitulo.concluido ? "Reler capítulo" : capitulo.progresso > 0 ? "Continuar leitura" : "Iniciar leitura"}
                          </Button>
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
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Star, Trophy, CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";

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

      // Buscar capítulos
      const { data: caps, error: capsError } = await supabase
        .from("ebook_capitulos")
        .select("*")
        .order("ordem", { ascending: true });

      if (capsError) throw capsError;

      // Buscar progresso do usuário
      const { data: progresso, error: progressoError } = await supabase
        .from("ebook_progresso")
        .select("*")
        .eq("user_id", user.id);

      if (progressoError) throw progressoError;

      // Combinar dados
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

      // Calcular progresso geral
      const concluidos = capitulosComProgresso.filter(c => c.concluido).length;
      const total = capitulosComProgresso.length;
      setProgressoGeral(total > 0 ? (concluidos / total) * 100 : 0);

      // Calcular XP total
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const capitulosConcluidos = capitulos.filter(c => c.concluido).length;
  const totalCapitulos = capitulos.length;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          📖 Manual da Mulher Independente
        </h1>
        <p className="text-muted-foreground">
          Sua jornada rumo à independência e autonomia
        </p>
      </div>

      {/* Card de Progresso Geral */}
      <Card className="p-6 mb-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Seu Progresso de Leitura</h2>
        </div>
        
        <Progress value={progressoGeral} className="h-3 mb-4" />
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Capítulos Lidos</p>
            <p className="text-xl font-bold text-foreground">{capitulosConcluidos}/{totalCapitulos}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Progresso</p>
            <p className="text-xl font-bold text-primary">{Math.round(progressoGeral)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">XP Conquistado</p>
            <p className="text-xl font-bold text-secondary">+{xpTotal} XP</p>
          </div>
        </div>

        {progressoGeral === 100 && (
          <div className="mt-4 p-3 bg-primary/20 rounded-lg text-center">
            <p className="text-sm font-semibold text-primary">
              🎉 Parabéns! Você completou todo o e-book!
            </p>
          </div>
        )}
      </Card>

      {/* Lista de Capítulos */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground mb-4">📑 Capítulos</h2>
        
        {capitulos.map((capitulo, index) => {
          const isEmProgresso = capitulo.progresso > 0 && !capitulo.concluido;
          
          return (
            <Card 
              key={capitulo.id} 
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => abrirCapitulo(capitulo)}
            >
              <div className="flex items-start gap-4">
                {/* Ícone de Status */}
                <div className="flex-shrink-0 mt-1">
                  {capitulo.concluido ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : isEmProgresso ? (
                    <BookOpen className="h-6 w-6 text-primary" />
                  ) : (
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-foreground break-words">
                      {capitulo.numero}. {capitulo.titulo}
                    </h3>
                    <div className="flex items-center gap-1 text-secondary flex-shrink-0">
                      <Star className="h-4 w-4" />
                      <span className="text-sm font-medium">+{capitulo.xp_recompensa}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{capitulo.tempo_leitura} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {capitulo.concluido ? (
                        <span className="text-green-500 font-medium">✓ Concluído</span>
                      ) : isEmProgresso ? (
                        <span className="text-primary font-medium">Em progresso ({capitulo.progresso}%)</span>
                      ) : (
                        <span>Não iniciado</span>
                      )}
                    </div>
                  </div>

                  {/* Barra de progresso do capítulo */}
                  {isEmProgresso && (
                    <Progress value={capitulo.progresso} className="h-2 mb-3" />
                  )}

                  {/* Botão */}
                  <Button 
                    size="sm" 
                    variant={capitulo.concluido ? "outline" : "default"}
                    className="w-full sm:w-auto"
                  >
                    {capitulo.concluido ? "Reler" : isEmProgresso ? "Continuar leitura" : "Começar"}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { toast } from "sonner";
import { EbookContentRenderer } from "@/components/ebook/EbookContentRenderer";

interface Capitulo {
  id: string;
  numero: number;
  titulo: string;
  conteudo: string;
  tempo_leitura: number;
  xp_recompensa: number;
  ordem: number;
}

export default function EbookReader() {
  const { capitulo: capituloId } = useParams<{ capitulo: string }>();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [capitulo, setCapitulo] = useState<Capitulo | null>(null);
  const [capituloAnterior, setCapituloAnterior] = useState<string | null>(null);
  const [capituloProximo, setCapituloProximo] = useState<string | null>(null);
  const [progresso, setProgresso] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [totalCapitulos, setTotalCapitulos] = useState(0);

  useEffect(() => {
    carregarCapitulo();
  }, [capituloId]);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const element = contentRef.current;
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight - element.clientHeight;
      const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      
      setProgresso(Math.min(Math.round(scrollPercent), 100));
    };

    const element = contentRef.current;
    if (element) {
      element.addEventListener("scroll", handleScroll);
      return () => element.removeEventListener("scroll", handleScroll);
    }
  }, [capitulo]);

  useEffect(() => {
    // Auto-save do progresso
    const interval = setInterval(() => {
      if (capitulo && progresso > 0) {
        salvarProgresso(false);
      }
    }, 10000); // Salva a cada 10 segundos

    return () => clearInterval(interval);
  }, [capitulo, progresso]);

  const carregarCapitulo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar capítulo atual
      const { data: cap, error: capError } = await supabase
        .from("ebook_capitulos")
        .select("*")
        .eq("id", capituloId)
        .single();

      if (capError) throw capError;
      setCapitulo(cap);

      // Buscar todos os capítulos para navegação
      const { data: todosCapitulos, error: todosError } = await supabase
        .from("ebook_capitulos")
        .select("id, ordem")
        .order("ordem", { ascending: true });

      if (todosError) throw todosError;

      setTotalCapitulos(todosCapitulos.length);

      // Encontrar capítulo anterior e próximo
      const currentIndex = todosCapitulos.findIndex(c => c.id === capituloId);
      if (currentIndex > 0) {
        setCapituloAnterior(todosCapitulos[currentIndex - 1].id);
      }
      if (currentIndex < todosCapitulos.length - 1) {
        setCapituloProximo(todosCapitulos[currentIndex + 1].id);
      }

      // Buscar progresso salvo
      const { data: prog } = await supabase
        .from("ebook_progresso")
        .select("*")
        .eq("user_id", user.id)
        .eq("capitulo_id", capituloId)
        .maybeSingle();

      if (prog) {
        setProgresso(prog.progresso || 0);
        // Restaurar posição de scroll
        setTimeout(() => {
          if (contentRef.current && prog.posicao_scroll) {
            contentRef.current.scrollTop = prog.posicao_scroll;
          }
        }, 100);
      }

    } catch (error) {
      console.error("Erro ao carregar capítulo:", error);
      toast.error("Erro ao carregar capítulo");
    } finally {
      setLoading(false);
    }
  };

  const salvarProgresso = async (concluido: boolean = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !capitulo) return;

      const scrollPos = contentRef.current?.scrollTop || 0;
      const progressoFinal = concluido ? 100 : progresso;

      const { error } = await supabase
        .from("ebook_progresso")
        .upsert({
          user_id: user.id,
          capitulo_id: capitulo.id,
          progresso: progressoFinal,
          concluido,
          posicao_scroll: scrollPos,
          data_conclusao: concluido ? new Date().toISOString() : null,
        }, {
          onConflict: "user_id,capitulo_id"
        });

      if (error) throw error;

      if (concluido) {
        toast.success(`🎉 Capítulo concluído! +${capitulo.xp_recompensa} XP`, {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Erro ao salvar progresso:", error);
    }
  };

  const marcarComoConcluido = () => {
    salvarProgresso(true);
    if (capituloProximo) {
      navigate(`/ebook/${capituloProximo}`);
    } else {
      navigate("/ebook");
    }
  };

  if (loading || !capitulo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/ebook")}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Voltar</span>
        </Button>

        <div className="text-sm text-muted-foreground">
          Cap {capitulo.numero}/{totalCapitulos}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (fontSize === 16) setFontSize(18);
            else if (fontSize === 18) setFontSize(20);
            else setFontSize(16);
          }}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Conteúdo */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto px-5 sm:px-6 py-6"
        style={{ fontSize: `${fontSize}px` }}
      >
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold text-primary mb-6 leading-tight">
            {capitulo.titulo}
          </h1>

          <EbookContentRenderer content={capitulo.conteudo} />

          {/* Espaçamento no final */}
          <div className="h-24"></div>
        </div>
      </div>

      {/* Footer com Progresso e Navegação */}
      <div className="sticky bottom-0 bg-card border-t px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Barra de Progresso */}
          <div>
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Progresso do capítulo</span>
              <span className="font-medium">{progresso}%</span>
            </div>
            <Progress value={progresso} className="h-2" />
          </div>

          {/* Botões de Navegação */}
          <div className="flex gap-2">
            {capituloAnterior && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate(`/ebook/${capituloAnterior}`)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
            )}

            {progresso >= 90 && (
              <Button
                className="flex-1"
                onClick={marcarComoConcluido}
              >
                {capituloProximo ? "Concluir e Próximo" : "Concluir"}
                {capituloProximo && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            )}

            {progresso < 90 && capituloProximo && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate(`/ebook/${capituloProximo}`)}
              >
                Próximo
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

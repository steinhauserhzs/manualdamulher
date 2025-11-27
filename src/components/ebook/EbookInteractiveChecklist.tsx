import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

interface EbookInteractiveChecklistProps {
  id: string;
  titulo: string;
  opcoes: string[];
  multiSelect?: boolean;
}

export const EbookInteractiveChecklist = ({
  id,
  titulo,
  opcoes,
  multiSelect = true,
}: EbookInteractiveChecklistProps) => {
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarRespostas();
  }, [id]);

  const carregarRespostas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const hoje = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('ebook_respostas_interativas')
        .select('respostas')
        .eq('user_id', user.id)
        .eq('tipo_resposta', id)
        .eq('data', hoje)
        .maybeSingle();

      if (error) throw error;

      if (data?.respostas) {
        setSelecionadas((data.respostas as any).opcoes || []);
      }
    } catch (error) {
      console.error('Erro ao carregar respostas:', error);
    } finally {
      setLoading(false);
    }
  };

  const salvarResposta = async (novasSelecionadas: string[]) => {
    setSalvando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const hoje = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from('ebook_respostas_interativas')
        .upsert({
          user_id: user.id,
          tipo_resposta: id,
          data: hoje,
          respostas: { opcoes: novasSelecionadas },
        }, {
          onConflict: 'user_id,tipo_resposta,data',
        });

      if (error) throw error;

      toast.success("Salvo automaticamente ✓", {
        duration: 1500,
      });
    } catch (error) {
      console.error('Erro ao salvar resposta:', error);
      toast.error("Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  const handleToggle = (opcao: string) => {
    let novasSelecionadas: string[];

    if (multiSelect) {
      novasSelecionadas = selecionadas.includes(opcao)
        ? selecionadas.filter((o) => o !== opcao)
        : [...selecionadas, opcao];
    } else {
      novasSelecionadas = [opcao];
    }

    setSelecionadas(novasSelecionadas);
    salvarResposta(novasSelecionadas);
  };

  if (loading) {
    return (
      <div className="my-8 p-6 rounded-xl border border-border bg-card animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 bg-muted rounded w-2/3"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-8 p-6 rounded-xl border border-border bg-card shadow-sm animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🌸</span>
        <h3 className="text-lg font-semibold text-foreground">{titulo}</h3>
      </div>
      
      <div className="space-y-3">
        {opcoes.map((opcao) => (
          <div
            key={opcao}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => handleToggle(opcao)}
          >
            <Checkbox
              checked={selecionadas.includes(opcao)}
              onCheckedChange={() => handleToggle(opcao)}
              className="mt-0.5"
            />
            <label className="text-sm text-foreground leading-relaxed cursor-pointer flex-1">
              {opcao}
            </label>
          </div>
        ))}
      </div>

      {salvando && (
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Salvando...</span>
        </div>
      )}

      {!salvando && selecionadas.length > 0 && (
        <div className="mt-4 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
          <CheckCircle2 className="w-3 h-3" />
          <span>Salvo automaticamente</span>
        </div>
      )}
    </div>
  );
};

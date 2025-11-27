import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save, CheckCircle2 } from "lucide-react";

interface Campo {
  tipo: 'text' | 'textarea' | 'number' | 'checklist';
  label: string;
  opcoes?: string[];
}

interface EbookInteractiveFormProps {
  id: string;
  titulo?: string;
  campos: Campo[];
}

export const EbookInteractiveForm = ({
  id,
  titulo,
  campos,
}: EbookInteractiveFormProps) => {
  const [valores, setValores] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvoRecentemente, setSalvoRecentemente] = useState(false);

  useEffect(() => {
    carregarRespostas();
  }, [id]);

  const carregarRespostas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ebook_respostas_interativas')
        .select('respostas')
        .eq('user_id', user.id)
        .eq('tipo_resposta', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data?.respostas) {
        setValores((data.respostas as any).campos || {});
      }
    } catch (error) {
      console.error('Erro ao carregar respostas:', error);
    } finally {
      setLoading(false);
    }
  };

  const salvarResposta = async () => {
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
          respostas: { campos: valores },
        }, {
          onConflict: 'user_id,tipo_resposta,data',
        });

      if (error) throw error;

      setSalvoRecentemente(true);
      toast.success("Salvo com sucesso ✓");
      
      setTimeout(() => setSalvoRecentemente(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar resposta:', error);
      toast.error("Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  const handleChange = (label: string, value: any) => {
    setValores((prev) => ({
      ...prev,
      [label]: value,
    }));
  };

  const handleChecklistToggle = (label: string, opcao: string) => {
    const atual = valores[label] || [];
    const novo = atual.includes(opcao)
      ? atual.filter((o: string) => o !== opcao)
      : [...atual, opcao];
    
    handleChange(label, novo);
  };

  if (loading) {
    return (
      <div className="my-8 p-6 rounded-xl border border-border bg-card animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-8 p-6 rounded-xl border border-border bg-card shadow-sm animate-fade-in">
      {titulo && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🖊️</span>
          <h3 className="text-lg font-semibold text-foreground">{titulo}</h3>
        </div>
      )}

      <div className="space-y-6">
        {campos.map((campo, index) => (
          <div key={index} className="space-y-2">
            <Label htmlFor={`campo-${index}`} className="text-sm font-medium">
              {campo.label}
            </Label>

            {campo.tipo === 'text' && (
              <Input
                id={`campo-${index}`}
                value={valores[campo.label] || ''}
                onChange={(e) => handleChange(campo.label, e.target.value)}
                placeholder={`Digite ${campo.label.toLowerCase()}...`}
                className="w-full"
              />
            )}

            {campo.tipo === 'number' && (
              <Input
                id={`campo-${index}`}
                type="number"
                value={valores[campo.label] || ''}
                onChange={(e) => handleChange(campo.label, e.target.value)}
                placeholder={`Digite ${campo.label.toLowerCase()}...`}
                className="w-full"
              />
            )}

            {campo.tipo === 'textarea' && (
              <Textarea
                id={`campo-${index}`}
                value={valores[campo.label] || ''}
                onChange={(e) => handleChange(campo.label, e.target.value)}
                placeholder={`Escreva sobre ${campo.label.toLowerCase()}...`}
                rows={4}
                className="w-full resize-none"
              />
            )}

            {campo.tipo === 'checklist' && campo.opcoes && (
              <div className="space-y-3 pt-2">
                {campo.opcoes.map((opcao) => (
                  <div
                    key={opcao}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleChecklistToggle(campo.label, opcao)}
                  >
                    <Checkbox
                      checked={(valores[campo.label] || []).includes(opcao)}
                      onCheckedChange={() => handleChecklistToggle(campo.label, opcao)}
                      className="mt-0.5"
                    />
                    <label className="text-sm text-foreground leading-relaxed cursor-pointer flex-1">
                      {opcao}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button
          onClick={salvarResposta}
          disabled={salvando}
          className="gap-2"
        >
          {salvando ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvar
            </>
          )}
        </Button>

        {salvoRecentemente && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Salvo com sucesso</span>
          </div>
        )}
      </div>
    </div>
  );
};

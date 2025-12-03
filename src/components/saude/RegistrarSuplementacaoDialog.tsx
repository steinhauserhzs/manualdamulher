import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, Clock } from "lucide-react";

const TIPOS_EMOJI: Record<string, string> = {
  whey: "🥛",
  creatina: "💎",
  bcaa: "🔗",
  glutamina: "🧬",
  pre_treino: "⚡",
  cafeina: "☕",
  multivitaminico: "💊",
  omega3: "🐟",
  colageno: "✨",
  melatonina: "😴",
  termogenico: "🔥",
  albumina: "🥚",
  caseina: "🌙",
  zma: "💤",
  beta_alanina: "⚡",
  outro: "📦",
};

const HORARIOS_LABEL: Record<string, string> = {
  manha: "Manhã",
  pre_treino: "Pré-treino",
  pos_treino: "Pós-treino",
  tarde: "Tarde",
  noite: "Noite",
  antes_dormir: "Antes de dormir",
};

interface Suplemento {
  id: string;
  nome: string;
  tipo: string;
  marca: string | null;
  dosagem_recomendada: string | null;
  horario_ideal: string | null;
}

interface RegistrarSuplementacaoDialogProps {
  userId: string;
  suplementos: Suplemento[];
  registrosHoje: string[];
  onRegistroAdded: () => void;
}

export function RegistrarSuplementacaoDialog({ 
  userId, 
  suplementos, 
  registrosHoje,
  onRegistroAdded 
}: RegistrarSuplementacaoDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selecionados, setSelecionados] = useState<Record<string, boolean>>({});
  const [quantidades, setQuantidades] = useState<Record<string, string>>({});

  useEffect(() => {
    // Inicializar com dosagem recomendada
    const qtds: Record<string, string> = {};
    suplementos.forEach((s) => {
      qtds[s.id] = s.dosagem_recomendada || "";
    });
    setQuantidades(qtds);
  }, [suplementos]);

  const toggleSuplemento = (id: string) => {
    setSelecionados((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSalvar = async () => {
    const idsParaRegistrar = Object.keys(selecionados).filter((id) => selecionados[id]);
    
    if (idsParaRegistrar.length === 0) {
      toast.error("Selecione pelo menos um suplemento");
      return;
    }

    setSaving(true);

    const hoje = new Date().toISOString().split("T")[0];
    const horaAtual = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const registros = idsParaRegistrar.map((suplementoId) => ({
      user_id: userId,
      suplemento_id: suplementoId,
      data: hoje,
      horario: horaAtual,
      quantidade: quantidades[suplementoId] || null,
      tomou: true,
    }));

    const { error } = await supabase.from("registro_suplementacao").insert(registros);

    // Atualizar quantidade restante dos suplementos
    for (const suplementoId of idsParaRegistrar) {
      const suplemento = suplementos.find((s) => s.id === suplementoId);
      if (suplemento) {
        const qtdUsada = parseFloat(quantidades[suplementoId]?.replace(/[^\d.]/g, "") || "0");
        if (qtdUsada > 0) {
          await supabase
            .from("suplementos_cadastrados")
            .update({ 
              quantidade_restante: supabase.rpc ? undefined : undefined 
            })
            .eq("id", suplementoId);
          
          // Decrement manually
          const { data: currentData } = await supabase
            .from("suplementos_cadastrados")
            .select("quantidade_restante")
            .eq("id", suplementoId)
            .single();
          
          if (currentData?.quantidade_restante) {
            await supabase
              .from("suplementos_cadastrados")
              .update({ 
                quantidade_restante: Math.max(0, currentData.quantidade_restante - qtdUsada)
              })
              .eq("id", suplementoId);
          }
        }
      }
    }

    setSaving(false);

    if (error) {
      toast.error("Erro ao registrar suplementação");
      console.error(error);
      return;
    }

    toast.success(`${idsParaRegistrar.length} suplemento(s) registrado(s)! 💪`);
    setSelecionados({});
    setOpen(false);
    onRegistroAdded();
  };

  const suplementosNaoTomados = suplementos.filter((s) => !registrosHoje.includes(s.id));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Check className="h-4 w-4" />
          <span className="hidden sm:inline">Registrar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>✅ Registrar Suplementação</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {suplementosNaoTomados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-2xl mb-2">🎉</p>
              <p>Você já tomou todos os suplementos de hoje!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                Marque os suplementos que você tomou agora:
              </p>
              
              {suplementosNaoTomados.map((suplemento) => (
                <div
                  key={suplemento.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    selecionados[suplemento.id] 
                      ? "bg-primary/10 border-primary" 
                      : "bg-card hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selecionados[suplemento.id] || false}
                      onCheckedChange={() => toggleSuplemento(suplemento.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{TIPOS_EMOJI[suplemento.tipo] || "📦"}</span>
                        <span className="font-medium">{suplemento.nome}</span>
                      </div>
                      {suplemento.marca && (
                        <p className="text-xs text-muted-foreground">{suplemento.marca}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {suplemento.horario_ideal && (
                          <span className="text-xs flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {HORARIOS_LABEL[suplemento.horario_ideal] || suplemento.horario_ideal}
                          </span>
                        )}
                      </div>
                      {selecionados[suplemento.id] && (
                        <div className="mt-2">
                          <Label className="text-xs">Quantidade</Label>
                          <Input
                            className="h-8 text-sm mt-1"
                            value={quantidades[suplemento.id] || ""}
                            onChange={(e) => 
                              setQuantidades((prev) => ({ 
                                ...prev, 
                                [suplemento.id]: e.target.value 
                              }))
                            }
                            placeholder={suplemento.dosagem_recomendada || "Ex: 30g"}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
            Cancelar
          </Button>
          <Button 
            onClick={handleSalvar} 
            disabled={saving || suplementosNaoTomados.length === 0} 
            className="flex-1"
          >
            {saving ? "Salvando..." : "Confirmar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

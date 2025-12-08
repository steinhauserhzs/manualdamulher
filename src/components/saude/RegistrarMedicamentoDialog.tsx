import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, Clock, AlertCircle } from "lucide-react";

interface Medicamento {
  id: string;
  nome: string;
  dosagem: string | null;
  horarios: string[];
  categoria: string;
}

interface RegistroMedicamento {
  id: string;
  medicamento_id: string;
  horario_programado: string;
  tomou: boolean;
}

interface RegistrarMedicamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  medicamentos: Medicamento[];
  registrosHoje: RegistroMedicamento[];
  onRegistroAdded: () => void;
}

const categoriaIcons: Record<string, string> = {
  cardiaco: "❤️",
  hormonal: "🔄",
  psiquiatrico: "🧠",
  analgesico: "💊",
  antibiotico: "🦠",
  antiinflamatorio: "🔥",
  vitamina: "🌟",
  outro: "💊"
};

export const RegistrarMedicamentoDialog = ({
  open,
  onOpenChange,
  userId,
  medicamentos,
  registrosHoje,
  onRegistroAdded
}: RegistrarMedicamentoDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [selecionados, setSelecionados] = useState<{ medicamentoId: string; horario: string }[]>([]);
  const [pulando, setPulando] = useState<{ medicamentoId: string; horario: string; motivo: string } | null>(null);

  // Gerar lista de todas as doses do dia
  const dosesHoje = medicamentos.flatMap(med =>
    (med.horarios || []).map(horario => ({
      medicamento: med,
      horario,
      jaRegistrado: registrosHoje.some(
        r => r.medicamento_id === med.id && r.horario_programado === horario
      ),
      tomou: registrosHoje.find(
        r => r.medicamento_id === med.id && r.horario_programado === horario
      )?.tomou || false
    }))
  ).sort((a, b) => a.horario.localeCompare(b.horario));

  const toggleSelecao = (medicamentoId: string, horario: string) => {
    const existe = selecionados.some(
      s => s.medicamentoId === medicamentoId && s.horario === horario
    );
    
    if (existe) {
      setSelecionados(prev => 
        prev.filter(s => !(s.medicamentoId === medicamentoId && s.horario === horario))
      );
    } else {
      setSelecionados(prev => [...prev, { medicamentoId, horario }]);
    }
  };

  const marcarSelecionados = async () => {
    if (selecionados.length === 0) {
      toast.error("Selecione pelo menos um medicamento");
      return;
    }

    setLoading(true);
    const hoje = new Date().toISOString().split("T")[0];
    const agora = new Date().toISOString();

    const registros = selecionados.map(s => ({
      user_id: userId,
      medicamento_id: s.medicamentoId,
      data: hoje,
      horario_programado: s.horario,
      horario_tomado: agora,
      tomou: true
    }));

    const { error } = await supabase
      .from("registro_medicamento")
      .insert(registros);

    setLoading(false);

    if (error) {
      toast.error("Erro ao registrar medicamentos");
      console.error(error);
      return;
    }

    toast.success(`${selecionados.length} medicamento(s) registrado(s)! 💊`);
    setSelecionados([]);
    onRegistroAdded();
  };

  const pularMedicamento = async () => {
    if (!pulando) return;

    setLoading(true);
    const hoje = new Date().toISOString().split("T")[0];

    const { error } = await supabase
      .from("registro_medicamento")
      .insert({
        user_id: userId,
        medicamento_id: pulando.medicamentoId,
        data: hoje,
        horario_programado: pulando.horario,
        tomou: false,
        pulou_motivo: pulando.motivo
      });

    setLoading(false);

    if (error) {
      toast.error("Erro ao registrar");
      console.error(error);
      return;
    }

    toast.info("Medicamento pulado registrado");
    setPulando(null);
    onRegistroAdded();
  };

  const agora = new Date();
  const horaAtual = `${agora.getHours().toString().padStart(2, "0")}:${agora.getMinutes().toString().padStart(2, "0")}`;

  // Separar pendentes, futuros e já tomados
  const pendentes = dosesHoje.filter(d => !d.jaRegistrado && d.horario <= horaAtual);
  const futuros = dosesHoje.filter(d => !d.jaRegistrado && d.horario > horaAtual);
  const concluidos = dosesHoje.filter(d => d.jaRegistrado && d.tomou);
  const pulados = dosesHoje.filter(d => d.jaRegistrado && !d.tomou);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Registrar Medicamentos de Hoje
          </DialogTitle>
          <DialogDescription>
            Marque os medicamentos que você já tomou
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Modal para pular */}
          {pulando && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium">Por que está pulando este medicamento?</p>
              <div className="flex flex-wrap gap-2">
                {["Esqueci", "Efeito colateral", "Acabou o estoque", "Orientação médica", "Outro"].map(motivo => (
                  <Button
                    key={motivo}
                    size="sm"
                    variant={pulando.motivo === motivo ? "default" : "outline"}
                    onClick={() => setPulando(prev => prev ? { ...prev, motivo } : null)}
                  >
                    {motivo}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setPulando(null)}>
                  Cancelar
                </Button>
                <Button 
                  size="sm" 
                  onClick={pularMedicamento} 
                  disabled={!pulando.motivo || loading}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          )}

          {/* Pendentes (atrasados) */}
          {pendentes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium text-warning">Pendentes</span>
              </div>
              <div className="space-y-2">
                {pendentes.map((dose, idx) => {
                  const isSelected = selecionados.some(
                    s => s.medicamentoId === dose.medicamento.id && s.horario === dose.horario
                  );
                  return (
                    <div
                      key={`${dose.medicamento.id}-${dose.horario}-${idx}`}
                      className="flex items-center justify-between p-3 bg-warning/5 border border-warning/20 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelecao(dose.medicamento.id, dose.horario)}
                        />
                        <div>
                          <p className="text-sm font-medium">
                            {categoriaIcons[dose.medicamento.categoria]} {dose.medicamento.nome}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {dose.medicamento.dosagem} • Programado: {dose.horario}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs"
                        onClick={() => setPulando({ 
                          medicamentoId: dose.medicamento.id, 
                          horario: dose.horario, 
                          motivo: "" 
                        })}
                      >
                        Pular
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Próximos */}
          {futuros.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Próximos horários</span>
              </div>
              <div className="space-y-2">
                {futuros.map((dose, idx) => {
                  const isSelected = selecionados.some(
                    s => s.medicamentoId === dose.medicamento.id && s.horario === dose.horario
                  );
                  return (
                    <div
                      key={`${dose.medicamento.id}-${dose.horario}-${idx}`}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelecao(dose.medicamento.id, dose.horario)}
                        />
                        <div>
                          <p className="text-sm font-medium">
                            {categoriaIcons[dose.medicamento.categoria]} {dose.medicamento.nome}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {dose.medicamento.dosagem} • {dose.horario}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {dose.horario}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Já tomados */}
          {concluidos.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">Já tomados</span>
              </div>
              <div className="space-y-2">
                {concluidos.map((dose, idx) => (
                  <div
                    key={`${dose.medicamento.id}-${dose.horario}-${idx}`}
                    className="flex items-center justify-between p-3 bg-success/10 rounded-lg opacity-70"
                  >
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-success" />
                      <div>
                        <p className="text-sm font-medium">
                          {categoriaIcons[dose.medicamento.categoria]} {dose.medicamento.nome}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {dose.medicamento.dosagem} • {dose.horario}
                        </p>
                      </div>
                    </div>
                    <Badge variant="default" className="text-xs bg-success">
                      ✓
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mensagem se não há medicamentos */}
          {dosesHoje.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum medicamento programado para hoje.</p>
            </div>
          )}
        </div>

        {selecionados.length > 0 && (
          <div className="flex gap-2 justify-end border-t pt-4">
            <Button variant="outline" onClick={() => setSelecionados([])}>
              Limpar seleção
            </Button>
            <Button onClick={marcarSelecionados} disabled={loading}>
              {loading ? "Registrando..." : `Registrar ${selecionados.length} selecionado(s)`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

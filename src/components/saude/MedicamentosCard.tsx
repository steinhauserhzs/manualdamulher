import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Pill, Plus, Check, Clock, AlertTriangle, Package } from "lucide-react";
import { toast } from "sonner";
import { AddMedicamentoDialog } from "./AddMedicamentoDialog";
import { RegistrarMedicamentoDialog } from "./RegistrarMedicamentoDialog";

interface MedicamentosCardProps {
  userId: string;
}

interface Medicamento {
  id: string;
  nome: string;
  dosagem: string | null;
  horarios: string[];
  quantidade_estoque: number;
  alerta_estoque_minimo: number;
  categoria: string;
}

interface RegistroMedicamento {
  id: string;
  medicamento_id: string;
  horario_programado: string;
  tomou: boolean;
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

export const MedicamentosCard = ({ userId }: MedicamentosCardProps) => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [registrosHoje, setRegistrosHoje] = useState<RegistroMedicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRegistrarDialog, setShowRegistrarDialog] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [userId]);

  const carregarDados = async () => {
    setLoading(true);
    const hoje = new Date().toISOString().split("T")[0];

    // Carregar medicamentos ativos
    const { data: meds, error: medsError } = await supabase
      .from("medicamentos_cadastrados")
      .select("id, nome, dosagem, horarios, quantidade_estoque, alerta_estoque_minimo, categoria")
      .eq("user_id", userId)
      .eq("ativo", true);

    if (medsError) {
      console.error("Erro ao carregar medicamentos:", medsError);
    } else {
      setMedicamentos(meds || []);
    }

    // Carregar registros de hoje
    const { data: regs, error: regsError } = await supabase
      .from("registro_medicamento")
      .select("id, medicamento_id, horario_programado, tomou")
      .eq("user_id", userId)
      .eq("data", hoje);

    if (regsError) {
      console.error("Erro ao carregar registros:", regsError);
    } else {
      setRegistrosHoje(regs || []);
    }

    setLoading(false);
  };

  // Calcular progresso do dia
  const totalDoses = medicamentos.reduce((acc, med) => acc + (med.horarios?.length || 0), 0);
  const dosesTomadas = registrosHoje.filter(r => r.tomou).length;
  const progresso = totalDoses > 0 ? (dosesTomadas / totalDoses) * 100 : 0;

  // Medicamentos com estoque baixo
  const estoqueBaixo = medicamentos.filter(
    med => med.quantidade_estoque <= med.alerta_estoque_minimo
  );

  // Verificar próximo horário
  const agora = new Date();
  const horaAtual = `${agora.getHours().toString().padStart(2, "0")}:${agora.getMinutes().toString().padStart(2, "0")}`;
  
  const proximoMedicamento = medicamentos
    .flatMap(med => 
      (med.horarios || []).map(horario => ({
        medicamento: med,
        horario,
        tomou: registrosHoje.some(r => r.medicamento_id === med.id && r.horario_programado === horario && r.tomou)
      }))
    )
    .filter(item => !item.tomou && item.horario >= horaAtual)
    .sort((a, b) => a.horario.localeCompare(b.horario))[0];

  const marcarTomado = async (medicamentoId: string, horario: string) => {
    const hoje = new Date().toISOString().split("T")[0];
    
    const { error } = await supabase
      .from("registro_medicamento")
      .insert({
        user_id: userId,
        medicamento_id: medicamentoId,
        data: hoje,
        horario_programado: horario,
        horario_tomado: new Date().toISOString(),
        tomou: true
      });

    if (error) {
      toast.error("Erro ao registrar medicamento");
      return;
    }

    toast.success("Medicamento registrado! 💊");
    carregarDados();
  };

  if (loading) {
    return (
      <Card className="gradient-card shadow-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="gradient-card shadow-card hover-lift">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Pill className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                Meus Medicamentos
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Acompanhe suas medicações diárias
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          {medicamentos.length === 0 ? (
            <div className="text-center py-6">
              <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhum medicamento cadastrado ainda.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Cadastrar primeiro medicamento
              </Button>
            </div>
          ) : (
            <>
              {/* Progresso do dia */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso de hoje</span>
                  <span className="font-semibold">{dosesTomadas}/{totalDoses} doses</span>
                </div>
                <Progress value={progresso} className="h-2" />
              </div>

              {/* Próximo medicamento */}
              {proximoMedicamento && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Próximo: {proximoMedicamento.horario}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {categoriaIcons[proximoMedicamento.medicamento.categoria]} {proximoMedicamento.medicamento.nome}
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => marcarTomado(proximoMedicamento.medicamento.id, proximoMedicamento.horario)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Marcar como tomado
                  </Button>
                </div>
              )}

              {/* Lista resumida de medicamentos */}
              <div className="space-y-2">
                {medicamentos.slice(0, 3).map(med => {
                  const dosesHoje = med.horarios?.length || 0;
                  const tomouHoje = registrosHoje.filter(
                    r => r.medicamento_id === med.id && r.tomou
                  ).length;
                  
                  return (
                    <div key={med.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span>{categoriaIcons[med.categoria]}</span>
                        <div>
                          <p className="text-sm font-medium">{med.nome}</p>
                          <p className="text-xs text-muted-foreground">{med.dosagem}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={tomouHoje === dosesHoje ? "default" : "secondary"} className="text-xs">
                          {tomouHoje}/{dosesHoje}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Alerta de estoque baixo */}
              {estoqueBaixo.length > 0 && (
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-warning">
                    <Package className="h-4 w-4" />
                    <span className="text-sm font-medium">Estoque baixo</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {estoqueBaixo.map(med => (
                      <p key={med.id} className="text-xs text-muted-foreground">
                        • {med.nome}: {med.quantidade_estoque} restantes
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Botão para ver todos/registrar */}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowRegistrarDialog(true)}
              >
                <Pill className="h-4 w-4 mr-2" />
                Registrar medicamentos
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <AddMedicamentoDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        userId={userId}
        onMedicamentoAdded={carregarDados}
      />

      <RegistrarMedicamentoDialog
        open={showRegistrarDialog}
        onOpenChange={setShowRegistrarDialog}
        userId={userId}
        medicamentos={medicamentos}
        registrosHoje={registrosHoje}
        onRegistroAdded={carregarDados}
      />
    </>
  );
};

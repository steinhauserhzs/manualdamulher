import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, X, Pill } from "lucide-react";

interface AddMedicamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onMedicamentoAdded: () => void;
}

const categorias = [
  { value: "cardiaco", label: "❤️ Cardíaco" },
  { value: "hormonal", label: "🔄 Hormonal" },
  { value: "psiquiatrico", label: "🧠 Psiquiátrico" },
  { value: "analgesico", label: "💊 Analgésico" },
  { value: "antibiotico", label: "🦠 Antibiótico" },
  { value: "antiinflamatorio", label: "🔥 Anti-inflamatório" },
  { value: "vitamina", label: "🌟 Vitamina/Suplemento" },
  { value: "outro", label: "📦 Outro" }
];

const vias = [
  { value: "oral", label: "Via oral" },
  { value: "sublingual", label: "Sublingual" },
  { value: "injetavel", label: "Injetável" },
  { value: "topico", label: "Tópico (pele)" },
  { value: "inalatorio", label: "Inalatório" }
];

const tipos = [
  { value: "continuo", label: "Uso contínuo" },
  { value: "temporario", label: "Uso temporário" },
  { value: "sos", label: "Quando necessário (SOS)" }
];

const diasSemana = [
  { value: "dom", label: "Dom" },
  { value: "seg", label: "Seg" },
  { value: "ter", label: "Ter" },
  { value: "qua", label: "Qua" },
  { value: "qui", label: "Qui" },
  { value: "sex", label: "Sex" },
  { value: "sab", label: "Sáb" }
];

export const AddMedicamentoDialog = ({
  open,
  onOpenChange,
  userId,
  onMedicamentoAdded
}: AddMedicamentoDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    principio_ativo: "",
    categoria: "outro",
    tipo: "continuo",
    dosagem: "",
    quantidade_por_dose: 1,
    via_administracao: "oral",
    horarios: ["08:00"],
    dias_semana: [] as string[],
    data_inicio: new Date().toISOString().split("T")[0],
    data_fim: "",
    medico_prescreveu: "",
    crm_medico: "",
    farmacia: "",
    quantidade_estoque: 0,
    alerta_estoque_minimo: 10,
    observacoes: ""
  });

  const addHorario = () => {
    setForm(prev => ({ ...prev, horarios: [...prev.horarios, "12:00"] }));
  };

  const removeHorario = (index: number) => {
    setForm(prev => ({
      ...prev,
      horarios: prev.horarios.filter((_, i) => i !== index)
    }));
  };

  const updateHorario = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      horarios: prev.horarios.map((h, i) => (i === index ? value : h))
    }));
  };

  const toggleDia = (dia: string) => {
    setForm(prev => ({
      ...prev,
      dias_semana: prev.dias_semana.includes(dia)
        ? prev.dias_semana.filter(d => d !== dia)
        : [...prev.dias_semana, dia]
    }));
  };

  const handleSubmit = async () => {
    if (!form.nome.trim()) {
      toast.error("Informe o nome do medicamento");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("medicamentos_cadastrados")
      .insert({
        user_id: userId,
        nome: form.nome,
        principio_ativo: form.principio_ativo || null,
        categoria: form.categoria,
        tipo: form.tipo,
        dosagem: form.dosagem || null,
        quantidade_por_dose: form.quantidade_por_dose,
        via_administracao: form.via_administracao,
        horarios: form.horarios,
        dias_semana: form.dias_semana.length > 0 ? form.dias_semana : null,
        data_inicio: form.data_inicio,
        data_fim: form.data_fim || null,
        medico_prescreveu: form.medico_prescreveu || null,
        crm_medico: form.crm_medico || null,
        farmacia: form.farmacia || null,
        quantidade_estoque: form.quantidade_estoque,
        alerta_estoque_minimo: form.alerta_estoque_minimo,
        observacoes: form.observacoes || null
      });

    setLoading(false);

    if (error) {
      toast.error("Erro ao cadastrar medicamento");
      console.error(error);
      return;
    }

    toast.success("Medicamento cadastrado! 💊");
    onMedicamentoAdded();
    onOpenChange(false);
    
    // Reset form
    setForm({
      nome: "",
      principio_ativo: "",
      categoria: "outro",
      tipo: "continuo",
      dosagem: "",
      quantidade_por_dose: 1,
      via_administracao: "oral",
      horarios: ["08:00"],
      dias_semana: [],
      data_inicio: new Date().toISOString().split("T")[0],
      data_fim: "",
      medico_prescreveu: "",
      crm_medico: "",
      farmacia: "",
      quantidade_estoque: 0,
      alerta_estoque_minimo: 10,
      observacoes: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            Cadastrar Medicamento
          </DialogTitle>
          <DialogDescription>
            Adicione um novo medicamento para acompanhar sua rotina
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome e Princípio Ativo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do medicamento *</Label>
              <Input
                id="nome"
                placeholder="Ex: Losartana 50mg"
                value={form.nome}
                onChange={(e) => setForm(prev => ({ ...prev, nome: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="principio">Princípio ativo</Label>
              <Input
                id="principio"
                placeholder="Ex: Losartana Potássica"
                value={form.principio_ativo}
                onChange={(e) => setForm(prev => ({ ...prev, principio_ativo: e.target.value }))}
              />
            </div>
          </div>

          {/* Categoria e Tipo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={form.categoria}
                onValueChange={(value) => setForm(prev => ({ ...prev, categoria: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de uso</Label>
              <Select
                value={form.tipo}
                onValueChange={(value) => setForm(prev => ({ ...prev, tipo: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tipos.map(tipo => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dosagem e Via */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="dosagem">Dosagem</Label>
              <Input
                id="dosagem"
                placeholder="Ex: 50mg"
                value={form.dosagem}
                onChange={(e) => setForm(prev => ({ ...prev, dosagem: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qtd">Qtd. por dose</Label>
              <Input
                id="qtd"
                type="number"
                min="1"
                value={form.quantidade_por_dose}
                onChange={(e) => setForm(prev => ({ ...prev, quantidade_por_dose: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Via</Label>
              <Select
                value={form.via_administracao}
                onValueChange={(value) => setForm(prev => ({ ...prev, via_administracao: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {vias.map(via => (
                    <SelectItem key={via.value} value={via.value}>
                      {via.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Horários */}
          <div className="space-y-2">
            <Label>Horários</Label>
            <div className="space-y-2">
              {form.horarios.map((horario, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={horario}
                    onChange={(e) => updateHorario(index, e.target.value)}
                    className="flex-1"
                  />
                  {form.horarios.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHorario(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addHorario}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar horário
              </Button>
            </div>
          </div>

          {/* Dias da semana */}
          <div className="space-y-2">
            <Label>Dias da semana (deixe vazio para todos os dias)</Label>
            <div className="flex flex-wrap gap-2">
              {diasSemana.map(dia => (
                <Button
                  key={dia.value}
                  type="button"
                  variant={form.dias_semana.includes(dia.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleDia(dia.value)}
                >
                  {dia.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Período */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="inicio">Data de início</Label>
              <Input
                id="inicio"
                type="date"
                value={form.data_inicio}
                onChange={(e) => setForm(prev => ({ ...prev, data_inicio: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fim">Data de término (opcional)</Label>
              <Input
                id="fim"
                type="date"
                value={form.data_fim}
                onChange={(e) => setForm(prev => ({ ...prev, data_fim: e.target.value }))}
              />
            </div>
          </div>

          {/* Médico */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="medico">Médico que prescreveu</Label>
              <Input
                id="medico"
                placeholder="Dr(a). Nome"
                value={form.medico_prescreveu}
                onChange={(e) => setForm(prev => ({ ...prev, medico_prescreveu: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crm">CRM</Label>
              <Input
                id="crm"
                placeholder="CRM 123456/SP"
                value={form.crm_medico}
                onChange={(e) => setForm(prev => ({ ...prev, crm_medico: e.target.value }))}
              />
            </div>
          </div>

          {/* Estoque */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="estoque">Estoque atual</Label>
              <Input
                id="estoque"
                type="number"
                min="0"
                value={form.quantidade_estoque}
                onChange={(e) => setForm(prev => ({ ...prev, quantidade_estoque: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alerta">Alerta quando atingir</Label>
              <Input
                id="alerta"
                type="number"
                min="0"
                value={form.alerta_estoque_minimo}
                onChange={(e) => setForm(prev => ({ ...prev, alerta_estoque_minimo: parseInt(e.target.value) || 10 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="farmacia">Farmácia</Label>
              <Input
                id="farmacia"
                placeholder="Onde compra"
                value={form.farmacia}
                onChange={(e) => setForm(prev => ({ ...prev, farmacia: e.target.value }))}
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="obs">Observações</Label>
            <Textarea
              id="obs"
              placeholder="Tomar em jejum, evitar com leite, etc."
              value={form.observacoes}
              onChange={(e) => setForm(prev => ({ ...prev, observacoes: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Salvando..." : "Cadastrar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

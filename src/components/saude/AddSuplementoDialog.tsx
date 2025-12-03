import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const TIPOS_SUPLEMENTO = [
  { value: "whey", label: "🥛 Whey Protein" },
  { value: "creatina", label: "💎 Creatina" },
  { value: "bcaa", label: "🔗 BCAA" },
  { value: "glutamina", label: "🧬 Glutamina" },
  { value: "pre_treino", label: "⚡ Pré-treino" },
  { value: "cafeina", label: "☕ Cafeína" },
  { value: "multivitaminico", label: "💊 Multivitamínico" },
  { value: "omega3", label: "🐟 Ômega 3" },
  { value: "colageno", label: "✨ Colágeno" },
  { value: "melatonina", label: "😴 Melatonina" },
  { value: "termogenico", label: "🔥 Termogênico" },
  { value: "albumina", label: "🥚 Albumina" },
  { value: "caseina", label: "🌙 Caseína" },
  { value: "zma", label: "💤 ZMA" },
  { value: "beta_alanina", label: "⚡ Beta-Alanina" },
  { value: "outro", label: "📦 Outro" },
];

const MARCAS_POPULARES = [
  "Growth Supplements",
  "Max Titanium",
  "Integral Médica",
  "Probiótica",
  "Black Skull",
  "Atlhetica Nutrition",
  "Darkness",
  "Dux Nutrition",
  "Essential Nutrition",
  "Optimum Nutrition",
  "Dymatize",
  "MuscleTech",
  "Universal Nutrition",
];

const HORARIOS = [
  { value: "manha", label: "🌅 Manhã" },
  { value: "pre_treino", label: "💪 Pré-treino" },
  { value: "pos_treino", label: "🏋️ Pós-treino" },
  { value: "tarde", label: "☀️ Tarde" },
  { value: "noite", label: "🌙 Noite" },
  { value: "antes_dormir", label: "😴 Antes de dormir" },
];

const UNIDADES = [
  { value: "g", label: "gramas (g)" },
  { value: "ml", label: "mililitros (ml)" },
  { value: "capsulas", label: "cápsulas" },
  { value: "saches", label: "sachês" },
  { value: "doses", label: "doses" },
];

interface AddSuplementoDialogProps {
  userId: string;
  onSuplementoAdded: () => void;
}

export function AddSuplementoDialog({ userId, onSuplementoAdded }: AddSuplementoDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [tipo, setTipo] = useState("");
  const [nome, setNome] = useState("");
  const [marca, setMarca] = useState("");
  const [sabor, setSabor] = useState("");
  const [dosagemRecomendada, setDosagemRecomendada] = useState("");
  const [horarioIdeal, setHorarioIdeal] = useState("");
  const [quantidadeTotal, setQuantidadeTotal] = useState("");
  const [unidade, setUnidade] = useState("g");
  const [dataValidade, setDataValidade] = useState("");
  const [notas, setNotas] = useState("");

  const resetForm = () => {
    setTipo("");
    setNome("");
    setMarca("");
    setSabor("");
    setDosagemRecomendada("");
    setHorarioIdeal("");
    setQuantidadeTotal("");
    setUnidade("g");
    setDataValidade("");
    setNotas("");
  };

  const handleSalvar = async () => {
    if (!tipo || !nome) {
      toast.error("Preencha o tipo e nome do suplemento");
      return;
    }

    setSaving(true);

    const qtdTotal = quantidadeTotal ? parseInt(quantidadeTotal) : null;

    const { error } = await supabase.from("suplementos_cadastrados").insert({
      user_id: userId,
      tipo,
      nome,
      marca: marca || null,
      sabor: sabor || null,
      dosagem_recomendada: dosagemRecomendada || null,
      horario_ideal: horarioIdeal || null,
      quantidade_total: qtdTotal,
      quantidade_restante: qtdTotal,
      unidade,
      data_validade: dataValidade || null,
      notas: notas || null,
    });

    setSaving(false);

    if (error) {
      toast.error("Erro ao cadastrar suplemento");
      console.error(error);
      return;
    }

    toast.success("Suplemento cadastrado com sucesso! 💪");
    resetForm();
    setOpen(false);
    onSuplementoAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo Suplemento</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>💪 Cadastrar Suplemento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tipo */}
          <div className="space-y-2">
            <Label>Tipo de Suplemento *</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_SUPLEMENTO.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label>Nome do Produto *</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Whey Protein Concentrado"
            />
          </div>

          {/* Marca */}
          <div className="space-y-2">
            <Label>Marca</Label>
            <Select value={marca} onValueChange={setMarca}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione ou digite" />
              </SelectTrigger>
              <SelectContent>
                {MARCAS_POPULARES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
                <SelectItem value="outra">Outra marca</SelectItem>
              </SelectContent>
            </Select>
            {marca === "outra" && (
              <Input
                className="mt-2"
                placeholder="Digite o nome da marca"
                onChange={(e) => setMarca(e.target.value)}
              />
            )}
          </div>

          {/* Sabor */}
          <div className="space-y-2">
            <Label>Sabor (opcional)</Label>
            <Input
              value={sabor}
              onChange={(e) => setSabor(e.target.value)}
              placeholder="Ex: Chocolate, Morango, Natural"
            />
          </div>

          {/* Dosagem e Horário */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Dosagem Recomendada</Label>
              <Input
                value={dosagemRecomendada}
                onChange={(e) => setDosagemRecomendada(e.target.value)}
                placeholder="Ex: 30g, 5g, 2 cáps"
              />
            </div>
            <div className="space-y-2">
              <Label>Horário Ideal</Label>
              <Select value={horarioIdeal} onValueChange={setHorarioIdeal}>
                <SelectTrigger>
                  <SelectValue placeholder="Quando tomar" />
                </SelectTrigger>
                <SelectContent>
                  {HORARIOS.map((h) => (
                    <SelectItem key={h.value} value={h.value}>
                      {h.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quantidade e Unidade */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Quantidade Total</Label>
              <Input
                type="number"
                value={quantidadeTotal}
                onChange={(e) => setQuantidadeTotal(e.target.value)}
                placeholder="Ex: 900, 60"
              />
            </div>
            <div className="space-y-2">
              <Label>Unidade</Label>
              <Select value={unidade} onValueChange={setUnidade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIDADES.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data de Validade */}
          <div className="space-y-2">
            <Label>Data de Validade</Label>
            <Input
              type="date"
              value={dataValidade}
              onChange={(e) => setDataValidade(e.target.value)}
            />
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Anotações pessoais sobre o suplemento..."
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={saving} className="flex-1">
            {saving ? "Salvando..." : "Cadastrar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RegistroDiarioDialogProps {
  userId: string;
  selectedDate: Date;
  onRegistroAdded: () => void;
  existingRegistro?: {
    id: string;
    teve_relacao: boolean;
    usou_protecao: boolean | null;
    medicamento: string | null;
    sintomas: string[] | null;
    humor: string | null;
    fluxo: string | null;
    notas: string | null;
  } | null;
}

const SINTOMAS_OPTIONS = [
  "Cólica", "Dor de cabeça", "Inchaço", "Sensibilidade nos seios",
  "Fadiga", "Alteração de humor", "Náusea", "Dor nas costas"
];

export function RegistroDiarioDialog({ 
  userId, 
  selectedDate, 
  onRegistroAdded,
  existingRegistro 
}: RegistroDiarioDialogProps) {
  const [open, setOpen] = useState(false);
  const [teveRelacao, setTeveRelacao] = useState(existingRegistro?.teve_relacao || false);
  const [usouProtecao, setUsouProtecao] = useState<string>(
    existingRegistro?.usou_protecao === true ? "sim" : 
    existingRegistro?.usou_protecao === false ? "nao" : "na"
  );
  const [medicamento, setMedicamento] = useState(existingRegistro?.medicamento || "");
  const [sintomasSelecionados, setSintomasSelecionados] = useState<string[]>(existingRegistro?.sintomas || []);
  const [humor, setHumor] = useState(existingRegistro?.humor || "");
  const [fluxo, setFluxo] = useState(existingRegistro?.fluxo || "");
  const [notas, setNotas] = useState(existingRegistro?.notas || "");
  const [salvando, setSalvando] = useState(false);
  const { toast } = useToast();

  const toggleSintoma = (sintoma: string) => {
    setSintomasSelecionados(prev => 
      prev.includes(sintoma) 
        ? prev.filter(s => s !== sintoma)
        : [...prev, sintoma]
    );
  };

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      const dataFormatada = format(selectedDate, "yyyy-MM-dd");
      
      const registro = {
        user_id: userId,
        data: dataFormatada,
        teve_relacao: teveRelacao,
        usou_protecao: usouProtecao === "na" ? null : usouProtecao === "sim",
        medicamento: medicamento || null,
        sintomas: sintomasSelecionados.length > 0 ? sintomasSelecionados : null,
        humor: humor || null,
        fluxo: fluxo || null,
        notas: notas || null,
      };

      if (existingRegistro?.id) {
        const { error } = await supabase
          .from("registro_ciclo_diario")
          .update(registro)
          .eq("id", existingRegistro.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("registro_ciclo_diario")
          .upsert(registro, { onConflict: "user_id,data" });
        if (error) throw error;
      }

      toast({ title: "Registro salvo!", description: "Seu registro diário foi salvo com sucesso." });
      setOpen(false);
      onRegistroAdded();
    } catch (error) {
      console.error("Erro ao salvar registro:", error);
      toast({ 
        title: "Erro", 
        description: "Não foi possível salvar o registro.", 
        variant: "destructive" 
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CalendarDays className="h-4 w-4" />
          Registrar Dia
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-rose-500" />
            Registro de {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Relação */}
          <div className="flex items-center justify-between">
            <Label htmlFor="relacao">Teve relação sexual?</Label>
            <Switch
              id="relacao"
              checked={teveRelacao}
              onCheckedChange={setTeveRelacao}
            />
          </div>

          {teveRelacao && (
            <div className="space-y-2">
              <Label>Usou proteção?</Label>
              <Select value={usouProtecao} onValueChange={setUsouProtecao}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                  <SelectItem value="na">Não se aplica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Fluxo menstrual */}
          <div className="space-y-2">
            <Label>Fluxo menstrual</Label>
            <Select value={fluxo} onValueChange={setFluxo}>
              <SelectTrigger>
                <SelectValue placeholder="Sem fluxo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sem fluxo</SelectItem>
                <SelectItem value="leve">🔴 Leve</SelectItem>
                <SelectItem value="moderado">🔴🔴 Moderado</SelectItem>
                <SelectItem value="intenso">🔴🔴🔴 Intenso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Humor */}
          <div className="space-y-2">
            <Label>Como está seu humor?</Label>
            <Select value={humor} onValueChange={setHumor}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="otimo">😊 Ótimo</SelectItem>
                <SelectItem value="bom">🙂 Bom</SelectItem>
                <SelectItem value="normal">😐 Normal</SelectItem>
                <SelectItem value="irritada">😤 Irritada</SelectItem>
                <SelectItem value="triste">😢 Triste</SelectItem>
                <SelectItem value="ansiosa">😰 Ansiosa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sintomas */}
          <div className="space-y-2">
            <Label>Sintomas</Label>
            <div className="flex flex-wrap gap-2">
              {SINTOMAS_OPTIONS.map((sintoma) => (
                <Button
                  key={sintoma}
                  type="button"
                  variant={sintomasSelecionados.includes(sintoma) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSintoma(sintoma)}
                  className="text-xs"
                >
                  {sintoma}
                </Button>
              ))}
            </div>
          </div>

          {/* Medicamento */}
          <div className="space-y-2">
            <Label htmlFor="medicamento">Medicamentos tomados</Label>
            <Input
              id="medicamento"
              value={medicamento}
              onChange={(e) => setMedicamento(e.target.value)}
              placeholder="Ex: Anticoncepcional, Ibuprofeno..."
            />
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas adicionais</Label>
            <Textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Observações sobre o dia..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

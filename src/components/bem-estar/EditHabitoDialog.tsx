import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Habito {
  id: string;
  nome: string;
  descricao: string | null;
  frequencia: string;
}

interface EditHabitoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habito: Habito;
  onHabitoUpdated: () => void;
}

export const EditHabitoDialog = ({ open, onOpenChange, habito, onHabitoUpdated }: EditHabitoDialogProps) => {
  const [nome, setNome] = useState(habito.nome);
  const [descricao, setDescricao] = useState(habito.descricao || "");
  const [frequencia, setFrequencia] = useState(habito.frequencia);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setNome(habito.nome);
    setDescricao(habito.descricao || "");
    setFrequencia(habito.frequencia);
  }, [habito]);

  const handleSubmit = async () => {
    if (!nome.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, dê um nome para o hábito.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('habitos_bem_estar')
      .update({
        nome,
        descricao,
        frequencia,
      })
      .eq('id', habito.id);

    if (error) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Hábito atualizado! ✅",
        description: "As alterações foram salvas.",
      });
      onOpenChange(false);
      onHabitoUpdated();
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Hábito</DialogTitle>
          <DialogDescription>Atualize os detalhes do hábito</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Hábito *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Meditar 10 minutos"
            />
          </div>
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes opcionais"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="frequencia">Frequência</Label>
            <Select value={frequencia} onValueChange={setFrequencia}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diario">Diário</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

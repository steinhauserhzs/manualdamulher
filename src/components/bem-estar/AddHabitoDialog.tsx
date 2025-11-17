import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface AddHabitoDialogProps {
  userId: string;
  onHabitoAdded: () => void;
}

export const AddHabitoDialog = ({ userId, onHabitoAdded }: AddHabitoDialogProps) => {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [frequencia, setFrequencia] = useState("diario");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("habitos_bem_estar")
        .insert({
          user_id: userId,
          nome,
          descricao: descricao || null,
          frequencia,
        });

      if (error) throw error;

      toast.success("Hábito criado com sucesso! ✨");
      setOpen(false);
      resetForm();
      onHabitoAdded();
    } catch (error) {
      toast.error("Erro ao criar hábito");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNome("");
    setDescricao("");
    setFrequencia("diario");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Novo Hábito
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Hábito</DialogTitle>
          <DialogDescription>
            Crie um hábito de autocuidado para sua rotina
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Hábito *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Meditar 5 minutos"
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes do hábito..."
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
                <SelectItem value="3x por semana">3x por semana</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Salvando..." : "Criar Hábito"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

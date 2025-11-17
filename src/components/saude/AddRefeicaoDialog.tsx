import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Utensils } from "lucide-react";

interface AddRefeicaoDialogProps {
  userId: string;
  onRefeicaoAdded: () => void;
}

export const AddRefeicaoDialog = ({ userId, onRefeicaoAdded }: AddRefeicaoDialogProps) => {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState("almoço");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("refeicoes")
        .insert({
          user_id: userId,
          tipo,
          descricao: descricao || null,
          data_hora: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Refeição registrada! 🍽️");
      setOpen(false);
      resetForm();
      onRefeicaoAdded();
    } catch (error) {
      toast.error("Erro ao registrar refeição");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTipo("almoço");
    setDescricao("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Registrar Refeição
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Registrar Refeição
          </DialogTitle>
          <DialogDescription>O que você comeu hoje?</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tipo">Tipo de Refeição *</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="café da manhã">Café da Manhã</SelectItem>
                <SelectItem value="lanche">Lanche</SelectItem>
                <SelectItem value="almoço">Almoço</SelectItem>
                <SelectItem value="jantar">Jantar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="descricao">O que você comeu?</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Arroz, feijão, frango grelhado, salada..."
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Salvando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

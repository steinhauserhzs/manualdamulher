import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Target } from "lucide-react";

interface AddMetaDialogProps {
  userId: string;
  onMetaAdded: () => void;
}

export const AddMetaDialog = ({ userId, onMetaAdded }: AddMetaDialogProps) => {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [valorAtual, setValorAtual] = useState("0");
  const [dataLimite, setDataLimite] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("metas_financeiras")
        .insert({
          user_id: userId,
          nome,
          valor_total: parseFloat(valorTotal),
          valor_atual: parseFloat(valorAtual),
          data_limite: dataLimite || null,
        });

      if (error) throw error;

      toast.success("Meta criada!");
      setOpen(false);
      resetForm();
      onMetaAdded();
    } catch (error) {
      toast.error("Erro ao criar meta");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNome("");
    setValorTotal("");
    setValorAtual("0");
    setDataLimite("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Target className="mr-2 h-4 w-4" />
          Nova Meta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Meta Financeira</DialogTitle>
          <DialogDescription>Defina um objetivo de economia</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome da Meta *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Reserva de emergência"
              required
            />
          </div>

          <div>
            <Label htmlFor="valorTotal">Valor Total (R$) *</Label>
            <Input
              id="valorTotal"
              type="number"
              step="0.01"
              value={valorTotal}
              onChange={(e) => setValorTotal(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="valorAtual">Valor Atual (R$)</Label>
            <Input
              id="valorAtual"
              type="number"
              step="0.01"
              value={valorAtual}
              onChange={(e) => setValorAtual(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="dataLimite">Data Limite (opcional)</Label>
            <Input
              id="dataLimite"
              type="date"
              value={dataLimite}
              onChange={(e) => setDataLimite(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Criando..." : "Criar Meta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

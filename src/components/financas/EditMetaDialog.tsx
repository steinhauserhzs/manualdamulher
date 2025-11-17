import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Meta {
  id: string;
  nome: string;
  valor_total: number;
  valor_atual: number;
  data_limite: string | null;
}

interface EditMetaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meta: Meta;
  onMetaUpdated: () => void;
}

export const EditMetaDialog = ({ open, onOpenChange, meta, onMetaUpdated }: EditMetaDialogProps) => {
  const [nome, setNome] = useState(meta.nome);
  const [valorTotal, setValorTotal] = useState(meta.valor_total.toString());
  const [valorAtual, setValorAtual] = useState(meta.valor_atual.toString());
  const [dataLimite, setDataLimite] = useState(meta.data_limite || "");
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setNome(meta.nome);
    setValorTotal(meta.valor_total.toString());
    setValorAtual(meta.valor_atual.toString());
    setDataLimite(meta.data_limite || "");
  }, [meta]);

  const handleSubmit = async () => {
    if (!nome.trim() || !valorTotal) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome e valor total.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('metas_financeiras')
      .update({
        nome,
        valor_total: parseFloat(valorTotal),
        valor_atual: parseFloat(valorAtual) || 0,
        data_limite: dataLimite || null,
      })
      .eq('id', meta.id);

    if (error) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Meta atualizada! 🎯",
        description: "As alterações foram salvas.",
      });
      onOpenChange(false);
      onMetaUpdated();
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Meta</DialogTitle>
          <DialogDescription>Atualize os detalhes da meta financeira</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome da Meta *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Viagem de férias"
            />
          </div>
          <div>
            <Label htmlFor="valorTotal">Valor Total *</Label>
            <Input
              id="valorTotal"
              type="number"
              step="0.01"
              value={valorTotal}
              onChange={(e) => setValorTotal(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="valorAtual">Valor Atual</Label>
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
            <Label htmlFor="dataLimite">Data Limite</Label>
            <Input
              id="dataLimite"
              type="date"
              value={dataLimite}
              onChange={(e) => setDataLimite(e.target.value)}
            />
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

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Transacao {
  id: string;
  tipo: string;
  categoria: string;
  valor: number;
  descricao: string | null;
  data: string;
}

interface EditTransacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transacao: Transacao;
  onTransacaoUpdated: () => void;
}

const categoriasDespesa = ["Alimentação", "Transporte", "Moradia", "Saúde", "Lazer", "Educação", "Outros"];
const categoriasReceita = ["Salário", "Freelance", "Investimentos", "Presente", "Outros"];

export const EditTransacaoDialog = ({ open, onOpenChange, transacao, onTransacaoUpdated }: EditTransacaoDialogProps) => {
  const [tipo, setTipo] = useState(transacao.tipo);
  const [categoria, setCategoria] = useState(transacao.categoria);
  const [valor, setValor] = useState(transacao.valor.toString());
  const [descricao, setDescricao] = useState(transacao.descricao || "");
  const [data, setData] = useState(transacao.data);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setTipo(transacao.tipo);
    setCategoria(transacao.categoria);
    setValor(transacao.valor.toString());
    setDescricao(transacao.descricao || "");
    setData(transacao.data);
  }, [transacao]);

  const categoriasAtuais = tipo === "despesa" ? categoriasDespesa : categoriasReceita;

  const handleSubmit = async () => {
    if (!valor || !categoria) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha valor e categoria.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('transacoes_financeiras')
      .update({
        tipo,
        categoria,
        valor: parseFloat(valor),
        descricao,
        data,
      })
      .eq('id', transacao.id);

    if (error) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Transação atualizada! 💰",
        description: "As alterações foram salvas.",
      });
      onOpenChange(false);
      onTransacaoUpdated();
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
          <DialogDescription>Atualize os detalhes da transação</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="tipo">Tipo</Label>
            <Select value={tipo} onValueChange={(value) => {
              setTipo(value);
              setCategoria("");
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="categoria">Categoria *</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {categoriasAtuais.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="valor">Valor *</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
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

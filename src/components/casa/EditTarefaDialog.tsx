import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Tarefa {
  id: string;
  nome: string;
  descricao: string | null;
  frequencia: string;
  categoria_id: string | null;
  pontos_xp: number;
}

interface Categoria {
  id: string;
  nome: string;
}

interface EditTarefaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tarefa: Tarefa;
  onTarefaUpdated: () => void;
}

export const EditTarefaDialog = ({ open, onOpenChange, tarefa, onTarefaUpdated }: EditTarefaDialogProps) => {
  const [nome, setNome] = useState(tarefa.nome);
  const [descricao, setDescricao] = useState(tarefa.descricao || "");
  const [frequencia, setFrequencia] = useState(tarefa.frequencia);
  const [categoriaId, setCategoriaId] = useState(tarefa.categoria_id || "");
  const [pontosXp, setPontosXp] = useState(tarefa.pontos_xp.toString());
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    carregarCategorias();
  }, []);

  useEffect(() => {
    setNome(tarefa.nome);
    setDescricao(tarefa.descricao || "");
    setFrequencia(tarefa.frequencia);
    setCategoriaId(tarefa.categoria_id || "");
    setPontosXp(tarefa.pontos_xp.toString());
  }, [tarefa]);

  const carregarCategorias = async () => {
    const { data } = await supabase
      .from('categorias_tarefa_casa')
      .select('*')
      .order('nome');
    setCategorias(data || []);
  };

  const handleSubmit = async () => {
    if (!nome.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, dê um nome para a tarefa.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('tarefas_casa')
      .update({
        nome,
        descricao,
        frequencia,
        categoria_id: categoriaId || null,
        pontos_xp: parseInt(pontosXp) || 10,
      })
      .eq('id', tarefa.id);

    if (error) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Tarefa atualizada! ✅",
        description: "As alterações foram salvas.",
      });
      onOpenChange(false);
      onTarefaUpdated();
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
          <DialogDescription>Atualize os detalhes da tarefa</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome da Tarefa *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Lavar louça"
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
            <Label htmlFor="categoria">Categoria</Label>
            <Select value={categoriaId} onValueChange={setCategoriaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="frequencia">Frequência</Label>
            <Select value={frequencia} onValueChange={setFrequencia}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diaria">Diária</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="pontosXp">Pontos XP</Label>
            <Input
              id="pontosXp"
              type="number"
              value={pontosXp}
              onChange={(e) => setPontosXp(e.target.value)}
              min="1"
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

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface Categoria {
  id: string;
  nome: string;
  icone: string;
}

interface AddTarefaDialogProps {
  userId: string;
  onTarefaAdded: () => void;
  tarefaEdit?: any;
}

export const AddTarefaDialog = ({ userId, onTarefaAdded, tarefaEdit }: AddTarefaDialogProps) => {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [frequencia, setFrequencia] = useState("diaria");
  const [categoriaId, setCategoriaId] = useState("");
  const [pontosXp, setPontosXp] = useState("10");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarCategorias();
  }, []);

  useEffect(() => {
    if (tarefaEdit) {
      setNome(tarefaEdit.nome);
      setDescricao(tarefaEdit.descricao || "");
      setFrequencia(tarefaEdit.frequencia);
      setCategoriaId(tarefaEdit.categoria_id || "");
      setPontosXp(tarefaEdit.pontos_xp.toString());
      setOpen(true);
    }
  }, [tarefaEdit]);

  const carregarCategorias = async () => {
    const { data } = await supabase
      .from("categorias_tarefa_casa")
      .select("*")
      .order("nome");
    
    if (data) {
      setCategorias(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (tarefaEdit) {
        // Editar
        const { error } = await supabase
          .from("tarefas_casa")
          .update({
            nome,
            descricao: descricao || null,
            frequencia,
            categoria_id: categoriaId || null,
            pontos_xp: parseInt(pontosXp),
          })
          .eq("id", tarefaEdit.id);

        if (error) throw error;
        toast.success("Tarefa atualizada!");
      } else {
        // Criar
        const { error } = await supabase
          .from("tarefas_casa")
          .insert({
            user_id: userId,
            nome,
            descricao: descricao || null,
            frequencia,
            categoria_id: categoriaId || null,
            pontos_xp: parseInt(pontosXp),
          });

        if (error) throw error;
        toast.success("Tarefa criada!");
      }

      setOpen(false);
      resetForm();
      onTarefaAdded();
    } catch (error) {
      toast.error("Erro ao salvar tarefa");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNome("");
    setDescricao("");
    setFrequencia("diaria");
    setCategoriaId("");
    setPontosXp("10");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          {tarefaEdit ? "Editar Tarefa" : "Nova Tarefa"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tarefaEdit ? "Editar Tarefa" : "Adicionar Nova Tarefa"}</DialogTitle>
          <DialogDescription>
            Crie uma tarefa personalizada para sua rotina
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome da Tarefa *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Lavar louça"
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes da tarefa..."
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
                {categorias.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icone} {cat.nome}
                  </SelectItem>
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
                <SelectItem value="personalizada">Personalizada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="pontos">Pontos XP</Label>
            <Input
              id="pontos"
              type="number"
              value={pontosXp}
              onChange={(e) => setPontosXp(e.target.value)}
              min="1"
              max="100"
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

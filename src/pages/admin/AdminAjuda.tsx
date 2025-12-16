import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { HelpCircle, Plus, Edit, Trash2, Eye, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

interface Artigo {
  id: string;
  categoria: string;
  titulo: string;
  conteudo: string;
  ordem: number | null;
  views: number | null;
  helpful_yes: number | null;
  helpful_no: number | null;
  created_at: string | null;
}

const categorias = [
  { value: "primeiros-passos", label: "Primeiros Passos" },
  { value: "casa", label: "Módulo Casa" },
  { value: "saude", label: "Módulo Saúde" },
  { value: "financas", label: "Módulo Finanças" },
  { value: "comunidade", label: "Comunidade" },
  { value: "marketplace", label: "Marketplace" },
  { value: "conta", label: "Conta e Perfil" },
  { value: "outros", label: "Outros" }
];

const AdminAjuda = () => {
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArtigo, setEditingArtigo] = useState<Artigo | null>(null);
  const [formData, setFormData] = useState({
    categoria: "primeiros-passos",
    titulo: "",
    conteudo: "",
    ordem: 0
  });

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('ajuda_artigos')
        .select('*')
        .order('categoria')
        .order('ordem');

      if (error) throw error;
      setArtigos(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    try {
      if (editingArtigo) {
        const { error } = await supabase
          .from('ajuda_artigos')
          .update({
            categoria: formData.categoria,
            titulo: formData.titulo,
            conteudo: formData.conteudo,
            ordem: formData.ordem
          })
          .eq('id', editingArtigo.id);

        if (error) throw error;
        toast.success('Artigo atualizado!');
      } else {
        const { error } = await supabase
          .from('ajuda_artigos')
          .insert({
            categoria: formData.categoria,
            titulo: formData.titulo,
            conteudo: formData.conteudo,
            ordem: formData.ordem
          });

        if (error) throw error;
        toast.success('Artigo criado!');
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao salvar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este artigo?')) return;
    try {
      const { error } = await supabase.from('ajuda_artigos').delete().eq('id', id);
      if (error) throw error;
      toast.success('Artigo excluído');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const resetForm = () => {
    setFormData({
      categoria: "primeiros-passos",
      titulo: "",
      conteudo: "",
      ordem: 0
    });
    setEditingArtigo(null);
  };

  const openEditDialog = (artigo: Artigo) => {
    setEditingArtigo(artigo);
    setFormData({
      categoria: artigo.categoria,
      titulo: artigo.titulo,
      conteudo: artigo.conteudo,
      ordem: artigo.ordem || 0
    });
    setDialogOpen(true);
  };

  const getCategoriaLabel = (value: string) => {
    return categorias.find(c => c.value === value)?.label || value;
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Ajuda</h1>
          <p className="text-muted-foreground">Crie e edite artigos de ajuda</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Artigo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingArtigo ? 'Editar Artigo' : 'Novo Artigo'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Categoria</Label>
                  <Select value={formData.categoria} onValueChange={(v) => setFormData({ ...formData, categoria: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ordem</Label>
                  <Input
                    type="number"
                    value={formData.ordem}
                    onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label>Título</Label>
                <Input
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Título do artigo"
                />
              </div>
              <div>
                <Label>Conteúdo (Markdown)</Label>
                <Textarea
                  value={formData.conteudo}
                  onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                  placeholder="Conteúdo do artigo em Markdown..."
                  rows={12}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingArtigo ? 'Atualizar' : 'Criar'} Artigo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Artigos ({artigos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {artigos.map((artigo) => (
              <div key={artigo.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{artigo.titulo}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge variant="secondary">{getCategoriaLabel(artigo.categoria)}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {artigo.views || 0}
                    </span>
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" /> {artigo.helpful_yes || 0}
                    </span>
                    <span className="text-xs text-red-600 flex items-center gap-1">
                      <ThumbsDown className="h-3 w-3" /> {artigo.helpful_no || 0}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(artigo)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(artigo.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAjuda;

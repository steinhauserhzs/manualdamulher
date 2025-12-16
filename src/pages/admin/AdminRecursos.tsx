import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { FolderOpen, Plus, Edit, Trash2, FileText, Lock, Globe } from "lucide-react";
import { toast } from "sonner";

interface Recurso {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: string;
  url_arquivo: string | null;
  exige_login: boolean;
  created_at: string;
}

const AdminRecursos = () => {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecurso, setEditingRecurso] = useState<Recurso | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipo: "ebook",
    url_arquivo: "",
    exige_login: true
  });

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('recursos_digitais')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecursos(data || []);
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
      if (editingRecurso) {
        const { error } = await supabase
          .from('recursos_digitais')
          .update({
            titulo: formData.titulo,
            descricao: formData.descricao || null,
            tipo: formData.tipo,
            url_arquivo: formData.url_arquivo || null,
            exige_login: formData.exige_login
          })
          .eq('id', editingRecurso.id);

        if (error) throw error;
        toast.success('Recurso atualizado!');
      } else {
        const { error } = await supabase
          .from('recursos_digitais')
          .insert({
            titulo: formData.titulo,
            descricao: formData.descricao || null,
            tipo: formData.tipo,
            url_arquivo: formData.url_arquivo || null,
            exige_login: formData.exige_login
          });

        if (error) throw error;
        toast.success('Recurso criado!');
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
    if (!confirm('Excluir este recurso?')) return;
    try {
      const { error } = await supabase.from('recursos_digitais').delete().eq('id', id);
      if (error) throw error;
      toast.success('Recurso excluído');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: "",
      descricao: "",
      tipo: "ebook",
      url_arquivo: "",
      exige_login: true
    });
    setEditingRecurso(null);
  };

  const openEditDialog = (recurso: Recurso) => {
    setEditingRecurso(recurso);
    setFormData({
      titulo: recurso.titulo,
      descricao: recurso.descricao || "",
      tipo: recurso.tipo,
      url_arquivo: recurso.url_arquivo || "",
      exige_login: recurso.exige_login
    });
    setDialogOpen(true);
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Recursos</h1>
          <p className="text-muted-foreground">Gerencie recursos digitais da biblioteca</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Recurso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRecurso ? 'Editar Recurso' : 'Novo Recurso'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Nome do recurso"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição do recurso"
                  rows={3}
                />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ebook">E-book</SelectItem>
                    <SelectItem value="planilha">Planilha</SelectItem>
                    <SelectItem value="checklist">Checklist</SelectItem>
                    <SelectItem value="guia">Guia</SelectItem>
                    <SelectItem value="template">Template</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>URL do Arquivo</Label>
                <Input
                  value={formData.url_arquivo}
                  onChange={(e) => setFormData({ ...formData, url_arquivo: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.exige_login}
                  onCheckedChange={(checked) => setFormData({ ...formData, exige_login: checked })}
                />
                <Label>Exige login para acessar</Label>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingRecurso ? 'Atualizar' : 'Criar'} Recurso
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Recursos ({recursos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recursos.map((recurso) => (
              <div key={recurso.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{recurso.titulo}</p>
                    <p className="text-sm text-muted-foreground">{recurso.descricao}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary">{recurso.tipo}</Badge>
                      <Badge variant="outline">
                        {recurso.exige_login ? (
                          <><Lock className="h-3 w-3 mr-1" /> Login</>
                        ) : (
                          <><Globe className="h-3 w-3 mr-1" /> Público</>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(recurso)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(recurso.id)}>
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

export default AdminRecursos;

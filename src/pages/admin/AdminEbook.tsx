import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { BookOpen, Plus, Edit, Trash2, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Capitulo {
  id: string;
  numero: number;
  titulo: string;
  conteudo: string;
  tempo_leitura: number | null;
  xp_recompensa: number | null;
  ordem: number;
}

const AdminEbook = () => {
  const [capitulos, setCapitulos] = useState<Capitulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCapitulo, setEditingCapitulo] = useState<Capitulo | null>(null);
  const [stats, setStats] = useState({ totalLeitoras: 0, capitulosConcluidos: 0 });
  const [formData, setFormData] = useState({
    numero: 1,
    titulo: "",
    conteudo: "",
    tempo_leitura: 10,
    xp_recompensa: 40,
    ordem: 1
  });

  const fetchData = async () => {
    try {
      const [{ data: capitulosData }, { count: leitoras }, { count: concluidos }] = await Promise.all([
        supabase.from('ebook_capitulos').select('*').order('ordem'),
        supabase.from('ebook_progresso').select('*', { count: 'exact', head: true }),
        supabase.from('ebook_progresso').select('*', { count: 'exact', head: true }).eq('concluido', true)
      ]);

      setCapitulos(capitulosData || []);
      setStats({
        totalLeitoras: leitoras || 0,
        capitulosConcluidos: concluidos || 0
      });
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
      if (editingCapitulo) {
        const { error } = await supabase
          .from('ebook_capitulos')
          .update({
            numero: formData.numero,
            titulo: formData.titulo,
            conteudo: formData.conteudo,
            tempo_leitura: formData.tempo_leitura,
            xp_recompensa: formData.xp_recompensa,
            ordem: formData.ordem
          })
          .eq('id', editingCapitulo.id);

        if (error) throw error;
        toast.success('Capítulo atualizado!');
      } else {
        const { error } = await supabase
          .from('ebook_capitulos')
          .insert({
            numero: formData.numero,
            titulo: formData.titulo,
            conteudo: formData.conteudo,
            tempo_leitura: formData.tempo_leitura,
            xp_recompensa: formData.xp_recompensa,
            ordem: formData.ordem
          });

        if (error) throw error;
        toast.success('Capítulo criado!');
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
    if (!confirm('Excluir este capítulo?')) return;
    try {
      const { error } = await supabase.from('ebook_capitulos').delete().eq('id', id);
      if (error) throw error;
      toast.success('Capítulo excluído');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const resetForm = () => {
    setFormData({
      numero: capitulos.length + 1,
      titulo: "",
      conteudo: "",
      tempo_leitura: 10,
      xp_recompensa: 40,
      ordem: capitulos.length + 1
    });
    setEditingCapitulo(null);
  };

  const openEditDialog = (capitulo: Capitulo) => {
    setEditingCapitulo(capitulo);
    setFormData({
      numero: capitulo.numero,
      titulo: capitulo.titulo,
      conteudo: capitulo.conteudo,
      tempo_leitura: capitulo.tempo_leitura || 10,
      xp_recompensa: capitulo.xp_recompensa || 40,
      ordem: capitulo.ordem
    });
    setDialogOpen(true);
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar E-book</h1>
          <p className="text-muted-foreground">Edite capítulos e acompanhe o progresso</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Capítulo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCapitulo ? 'Editar Capítulo' : 'Novo Capítulo'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Número</Label>
                  <Input
                    type="number"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Ordem</Label>
                  <Input
                    type="number"
                    value={formData.ordem}
                    onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Tempo (min)</Label>
                  <Input
                    type="number"
                    value={formData.tempo_leitura}
                    onChange={(e) => setFormData({ ...formData, tempo_leitura: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label>Título</Label>
                <Input
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Título do capítulo"
                />
              </div>
              <div>
                <Label>XP Recompensa</Label>
                <Input
                  type="number"
                  value={formData.xp_recompensa}
                  onChange={(e) => setFormData({ ...formData, xp_recompensa: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Conteúdo (Markdown)</Label>
                <Textarea
                  value={formData.conteudo}
                  onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                  placeholder="Conteúdo do capítulo em Markdown..."
                  rows={15}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingCapitulo ? 'Atualizar' : 'Criar'} Capítulo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Leitoras</p>
              <p className="text-2xl font-bold">{stats.totalLeitoras}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Capítulos Concluídos</p>
              <p className="text-2xl font-bold">{stats.capitulosConcluidos}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chapters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Capítulos ({capitulos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {capitulos.map((capitulo) => (
              <div key={capitulo.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                    {capitulo.numero}
                  </div>
                  <div>
                    <p className="font-medium">{capitulo.titulo}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary">{capitulo.tempo_leitura} min</Badge>
                      <Badge variant="outline">+{capitulo.xp_recompensa} XP</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(capitulo)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(capitulo.id)}>
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

export default AdminEbook;

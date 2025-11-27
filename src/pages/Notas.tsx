import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Star, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface Nota {
  id: string;
  titulo: string;
  conteudo: string;
  categoria: string;
  created_at: string;
  updated_at: string;
}

const categorias = ["Pessoal", "Casa", "Saúde", "Finanças", "Bem-estar", "Trabalho", "Outros"];

const Notas = () => {
  const [user, setUser] = useState<any>(null);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [filteredNotas, setFilteredNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("all");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNota, setEditingNota] = useState<Nota | null>(null);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [saving, setSaving] = useState(false);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notaToDelete, setNotaToDelete] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      carregarNotas(session.user.id);
    };
    checkAuth();
  }, [navigate]);

  const carregarNotas = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notas')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar notas",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setNotas(data || []);
      setFilteredNotas(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    let filtered = notas;

    if (search) {
      filtered = filtered.filter(nota =>
        nota.titulo.toLowerCase().includes(search.toLowerCase()) ||
        nota.conteudo?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categoriaFilter !== "all") {
      filtered = filtered.filter(nota => nota.categoria === categoriaFilter);
    }

    setFilteredNotas(filtered);
  }, [search, categoriaFilter, notas]);

  const handleOpenDialog = (nota?: Nota) => {
    if (nota) {
      setEditingNota(nota);
      setTitulo(nota.titulo);
      setConteudo(nota.conteudo || "");
      setCategoria(nota.categoria || "");
    } else {
      setEditingNota(null);
      setTitulo("");
      setConteudo("");
      setCategoria("");
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!titulo.trim()) {
      toast({
        title: "Ops!",
        description: "Por favor, dê um título para sua nota.",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    setSaving(true);

    try {
      if (editingNota) {
        const { error } = await supabase
          .from('notas')
          .update({
            titulo,
            conteudo,
            categoria,
          })
          .eq('id', editingNota.id);

        if (error) throw error;

        toast({
          title: "Nota atualizada! ✅",
          description: "Suas alterações foram salvas.",
        });
      } else {
        const { error } = await supabase
          .from('notas')
          .insert({
            user_id: user.id,
            titulo,
            conteudo,
            categoria,
          });

        if (error) throw error;

        toast({
          title: "Nota criada! 📝",
          description: "Sua nota foi salva com sucesso.",
        });
      }

      setDialogOpen(false);
      carregarNotas(user.id);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar nota",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!notaToDelete) return;

    const { error } = await supabase
      .from('notas')
      .delete()
      .eq('id', notaToDelete);

    if (error) {
      toast({
        title: "Erro ao excluir nota",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Nota excluída",
        description: "A nota foi removida com sucesso.",
      });
      if (user) carregarNotas(user.id);
    }

    setDeleteDialogOpen(false);
    setNotaToDelete(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Breadcrumbs items={[{ label: "Notas" }]} />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Minhas Notas 📝</h1>
            <p className="text-muted-foreground">Organize seus pensamentos e ideias</p>
          </div>
          <Button onClick={() => handleOpenDialog()} size="lg">
            <Plus className="mr-2 h-4 w-4" /> Nova Nota
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar notas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categorias.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredNotas.length === 0 ? (
          <EmptyState
            icon={Search}
            title={search || categoriaFilter !== "all" ? "Nenhuma nota encontrada" : "Você ainda não tem notas"}
            description={search || categoriaFilter !== "all" ? "Tente ajustar seus filtros" : "Crie sua primeira nota para começar a organizar suas ideias!"}
            actionLabel={search || categoriaFilter !== "all" ? undefined : "Criar Nota"}
            onAction={() => handleOpenDialog()}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredNotas.map((nota) => (
              <Card key={nota.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{nota.titulo}</CardTitle>
                      {nota.categoria && (
                        <CardDescription>{nota.categoria}</CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(nota)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setNotaToDelete(nota.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {nota.conteudo || "Sem conteúdo"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    Atualizado: {new Date(nota.updated_at).toLocaleDateString('pt-BR')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingNota ? "Editar Nota" : "Nova Nota"}</DialogTitle>
              <DialogDescription>
                {editingNota ? "Atualize sua nota" : "Crie uma nova nota para organizar suas ideias"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Dê um título para sua nota"
                />
              </div>
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="conteudo">Conteúdo</Label>
                <Textarea
                  id="conteudo"
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  placeholder="Escreva sua nota aqui..."
                  rows={10}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : "Salvar Nota"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Excluir nota?"
          description="Esta ação não pode ser desfeita. A nota será permanentemente removida."
          onConfirm={handleDelete}
          confirmText="Sim, excluir"
          variant="destructive"
        />
      </div>
    </div>
  );
};

export default Notas;

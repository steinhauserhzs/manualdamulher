import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Trash2, Edit, BookHeart } from "lucide-react";
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

interface Entrada {
  id: string;
  titulo: string;
  conteudo: string;
  categoria: string;
  created_at: string;
  updated_at: string;
}

const categorias = ["Reflexões", "Gratidão", "Sonhos", "Memórias", "Desabafos", "Metas", "Outros"];

const MeuDiario = () => {
  const [user, setUser] = useState<any>(null);
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [filteredEntradas, setFilteredEntradas] = useState<Entrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("all");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntrada, setEditingEntrada] = useState<Entrada | null>(null);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [saving, setSaving] = useState(false);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entradaToDelete, setEntradaToDelete] = useState<string | null>(null);

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
      carregarEntradas(session.user.id);
    };
    checkAuth();
  }, [navigate]);

  const carregarEntradas = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notas')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar entradas",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setEntradas(data || []);
      setFilteredEntradas(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    let filtered = entradas;

    if (search) {
      filtered = filtered.filter(entrada =>
        entrada.titulo.toLowerCase().includes(search.toLowerCase()) ||
        entrada.conteudo?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categoriaFilter !== "all") {
      filtered = filtered.filter(entrada => entrada.categoria === categoriaFilter);
    }

    setFilteredEntradas(filtered);
  }, [search, categoriaFilter, entradas]);

  const handleOpenDialog = (entrada?: Entrada) => {
    if (entrada) {
      setEditingEntrada(entrada);
      setTitulo(entrada.titulo);
      setConteudo(entrada.conteudo || "");
      setCategoria(entrada.categoria || "");
    } else {
      setEditingEntrada(null);
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
        description: "Por favor, dê um título para sua entrada.",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    setSaving(true);

    try {
      if (editingEntrada) {
        const { error } = await supabase
          .from('notas')
          .update({
            titulo,
            conteudo,
            categoria,
          })
          .eq('id', editingEntrada.id);

        if (error) throw error;

        toast({
          title: "Entrada atualizada! ✅",
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
          title: "Entrada criada! 📔",
          description: "Sua entrada foi salva no diário.",
        });
      }

      setDialogOpen(false);
      carregarEntradas(user.id);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar entrada",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!entradaToDelete) return;

    const { error } = await supabase
      .from('notas')
      .delete()
      .eq('id', entradaToDelete);

    if (error) {
      toast({
        title: "Erro ao excluir entrada",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Entrada excluída",
        description: "A entrada foi removida do seu diário.",
      });
      if (user) carregarEntradas(user.id);
    }

    setDeleteDialogOpen(false);
    setEntradaToDelete(null);
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
        <Breadcrumbs items={[{ label: "Meu Diário" }]} />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Meu Diário 📔</h1>
            <p className="text-muted-foreground">Seu espaço pessoal para reflexões e memórias</p>
          </div>
          <Button onClick={() => handleOpenDialog()} size="lg">
            <Plus className="mr-2 h-4 w-4" /> Nova Entrada
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar no diário..."
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

        {filteredEntradas.length === 0 ? (
          <EmptyState
            icon={BookHeart}
            title={search || categoriaFilter !== "all" ? "Nenhuma entrada encontrada" : "Seu diário está vazio"}
            description={search || categoriaFilter !== "all" ? "Tente ajustar seus filtros" : "Comece a escrever suas reflexões, memórias e pensamentos!"}
            actionLabel={search || categoriaFilter !== "all" ? undefined : "Nova Entrada"}
            onAction={() => handleOpenDialog()}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEntradas.map((entrada) => (
              <Card key={entrada.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{entrada.titulo}</CardTitle>
                      {entrada.categoria && (
                        <CardDescription>{entrada.categoria}</CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(entrada)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEntradaToDelete(entrada.id);
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
                    {entrada.conteudo || "Sem conteúdo"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {new Date(entrada.updated_at).toLocaleDateString('pt-BR')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEntrada ? "Editar Entrada" : "Nova Entrada do Diário"}</DialogTitle>
              <DialogDescription>
                {editingEntrada ? "Atualize sua entrada" : "Registre seus pensamentos, memórias ou reflexões"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Título da entrada"
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
                  placeholder="Escreva seus pensamentos, memórias ou reflexões..."
                  rows={10}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : "Salvar Entrada"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Excluir entrada?"
          description="Esta ação não pode ser desfeita. A entrada será permanentemente removida do seu diário."
          onConfirm={handleDelete}
          confirmText="Sim, excluir"
          variant="destructive"
        />
      </div>
    </div>
  );
};

export default MeuDiario;

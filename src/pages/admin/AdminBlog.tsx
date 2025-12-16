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
import { Search, Plus, Edit, Trash2, Eye, FileText } from "lucide-react";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  titulo: string;
  slug: string;
  conteudo: string;
  autor: string | null;
  status: string;
  created_at: string;
  categoria_id: string | null;
}

interface Categoria {
  id: string;
  nome: string;
  slug: string;
}

const AdminBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    slug: "",
    conteudo: "",
    autor: "",
    status: "rascunho",
    categoria_id: ""
  });

  const fetchData = async () => {
    try {
      const [{ data: postsData }, { data: categoriasData }] = await Promise.all([
        supabase.from('posts_blog').select('*').order('created_at', { ascending: false }),
        supabase.from('categorias_blog').select('*')
      ]);

      setPosts(postsData || []);
      setCategorias(categoriasData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateSlug = (titulo: string) => {
    return titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async () => {
    try {
      const slug = formData.slug || generateSlug(formData.titulo);
      
      if (editingPost) {
        const { error } = await supabase
          .from('posts_blog')
          .update({
            titulo: formData.titulo,
            slug,
            conteudo: formData.conteudo,
            autor: formData.autor || null,
            status: formData.status,
            categoria_id: formData.categoria_id || null
          })
          .eq('id', editingPost.id);

        if (error) throw error;
        toast.success('Post atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('posts_blog')
          .insert({
            titulo: formData.titulo,
            slug,
            conteudo: formData.conteudo,
            autor: formData.autor || null,
            status: formData.status,
            categoria_id: formData.categoria_id || null
          });

        if (error) throw error;
        toast.success('Post criado com sucesso!');
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Erro ao salvar post');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;

    try {
      const { error } = await supabase.from('posts_blog').delete().eq('id', id);
      if (error) throw error;
      toast.success('Post excluído');
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Erro ao excluir');
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: "",
      slug: "",
      conteudo: "",
      autor: "",
      status: "rascunho",
      categoria_id: ""
    });
    setEditingPost(null);
  };

  const openEditDialog = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      titulo: post.titulo,
      slug: post.slug,
      conteudo: post.conteudo,
      autor: post.autor || "",
      status: post.status,
      categoria_id: post.categoria_id || ""
    });
    setDialogOpen(true);
  };

  const filteredPosts = posts.filter(post =>
    post.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Blog</h1>
          <p className="text-muted-foreground">Crie e edite posts do blog</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Editar Post' : 'Novo Post'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Título do post"
                />
              </div>
              <div>
                <Label>Slug (URL)</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Deixe vazio para gerar automaticamente"
                />
              </div>
              <div>
                <Label>Autor</Label>
                <Input
                  value={formData.autor}
                  onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
                  placeholder="Nome do autor"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Categoria</Label>
                  <Select value={formData.categoria_id} onValueChange={(v) => setFormData({ ...formData, categoria_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rascunho">Rascunho</SelectItem>
                      <SelectItem value="publicado">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Conteúdo (Markdown)</Label>
                <Textarea
                  value={formData.conteudo}
                  onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                  placeholder="Conteúdo do post em Markdown..."
                  rows={12}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingPost ? 'Atualizar' : 'Criar'} Post
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Posts ({filteredPosts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{post.titulo}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString('pt-BR')}
                    {post.autor && ` • ${post.autor}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={post.status === 'publicado' ? 'default' : 'secondary'}>
                    {post.status}
                  </Badge>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(post)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}>
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

export default AdminBlog;

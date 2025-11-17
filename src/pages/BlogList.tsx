import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, BookOpen, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Post {
  id: string;
  titulo: string;
  slug: string;
  conteudo: string;
  autor: string;
  data_publicacao: string;
  categoria_id: string;
  categorias_blog?: {
    nome: string;
    slug: string;
  };
}

const BlogList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("all");

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);

    const { data: postsData, error: postsError } = await supabase
      .from('posts_blog')
      .select(`
        *,
        categorias_blog (nome, slug)
      `)
      .eq('status', 'publicado')
      .order('data_publicacao', { ascending: false });

    if (postsError) {
      toast({
        title: "Erro ao carregar posts",
        description: postsError.message,
        variant: "destructive",
      });
    } else {
      setPosts(postsData || []);
      setFilteredPosts(postsData || []);
    }

    const { data: categoriasData } = await supabase
      .from('categorias_blog')
      .select('*')
      .order('nome');

    setCategorias(categoriasData || []);
    setLoading(false);
  };

  useEffect(() => {
    let filtered = posts;

    if (search) {
      filtered = filtered.filter(post =>
        post.titulo.toLowerCase().includes(search.toLowerCase()) ||
        post.conteudo.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categoriaFilter !== "all") {
      filtered = filtered.filter(post => post.categoria_id === categoriaFilter);
    }

    setFilteredPosts(filtered);
  }, [search, categoriaFilter, posts]);

  const getExcerpt = (content: string, maxLength: number = 150) => {
    const text = content.replace(/<[^>]*>/g, '');
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 md:ml-64 mb-16 md:mb-0">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:ml-64 mb-16 md:mb-0">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ label: "Blog" }]} />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Blog 📖</h1>
          <p className="text-muted-foreground">Dicas, histórias e inspiração para sua jornada</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar posts..."
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
                <SelectItem key={cat.id} value={cat.id}>{cat.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredPosts.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Nenhum post encontrado"
            description={search || categoriaFilter !== "all" ? "Tente ajustar seus filtros" : "Os posts do blog aparecerão aqui em breve"}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    {post.categorias_blog && (
                      <Badge variant="secondary">{post.categorias_blog.nome}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl line-clamp-2">{post.titulo}</CardTitle>
                  <CardDescription>
                    {post.autor && `Por ${post.autor} • `}
                    {new Date(post.data_publicacao).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {getExcerpt(post.conteudo)}
                  </p>
                  <Link to={`/blog/${post.slug}`}>
                    <Button variant="ghost" className="w-full">
                      Ler mais <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;

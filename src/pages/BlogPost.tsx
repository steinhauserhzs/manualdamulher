import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, User, Clock, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BlogContentRenderer } from "@/components/blog/BlogContentRenderer";
import { Separator } from "@/components/ui/separator";

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

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [postsRelacionados, setPostsRelacionados] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      carregarPost(slug);
    }
  }, [slug]);

  const carregarPost = async (postSlug: string) => {
    setLoading(true);

    const { data: postData, error } = await supabase
      .from('posts_blog')
      .select(`
        *,
        categorias_blog (nome, slug)
      `)
      .eq('slug', postSlug)
      .eq('status', 'publicado')
      .single();

    if (error || !postData) {
      toast({
        title: "Post não encontrado",
        description: "Este post não existe ou foi removido.",
        variant: "destructive",
      });
      navigate("/blog");
      return;
    }

    setPost(postData);

    if (postData.categoria_id) {
      const { data: relacionados } = await supabase
        .from('posts_blog')
        .select(`
          *,
          categorias_blog (nome, slug)
        `)
        .eq('categoria_id', postData.categoria_id)
        .eq('status', 'publicado')
        .neq('id', postData.id)
        .limit(3);

      setPostsRelacionados(relacionados || []);
    }

    setLoading(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.titulo,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado!",
        description: "O link do artigo foi copiado para a área de transferência.",
      });
    }
  };

  // Calculate reading time (roughly 200 words per minute)
  const calcularTempoLeitura = (conteudo: string) => {
    const palavras = conteudo.split(/\s+/).length;
    const minutos = Math.ceil(palavras / 200);
    return minutos;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 md:ml-64 mb-16 md:mb-0">
        <div className="max-w-3xl mx-auto">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const tempoLeitura = calcularTempoLeitura(post.conteudo);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 md:ml-64 mb-16 md:mb-0">
      <div className="max-w-3xl mx-auto">
        <Breadcrumbs 
          items={[
            { label: "Blog", href: "/blog" },
            { label: post.categorias_blog?.nome || "Post" },
          ]} 
        />
        
        <div className="flex items-center justify-between mb-6">
          <Link to="/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" /> Compartilhar
          </Button>
        </div>

        <article className="mb-12">
          {/* Header do Artigo */}
          <header className="mb-8">
            {post.categorias_blog && (
              <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary">
                {post.categorias_blog.nome}
              </Badge>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight">
              {post.titulo}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {post.autor && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span>{post.autor}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(post.data_publicacao).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{tempoLeitura} min de leitura</span>
              </div>
            </div>
          </header>

          <Separator className="my-6" />

          {/* Conteúdo do Artigo */}
          <BlogContentRenderer content={post.conteudo} />

          <Separator className="my-8" />

          {/* Sobre a Autora */}
          <Card className="bg-muted/30 border-none">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold">
                  M
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Equipe Manual da Mulher</h3>
                  <p className="text-sm text-muted-foreground">
                    Somos uma equipe dedicada a apoiar mulheres em sua jornada de independência. 
                    Acreditamos que toda mulher merece ter acesso a informações práticas e 
                    acolhedoras para viver uma vida plena e autônoma.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </article>

        {/* Posts Relacionados */}
        {postsRelacionados.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4">Continue lendo</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {postsRelacionados.map((postRel) => (
                <Card key={postRel.id} className="hover:shadow-md transition-all hover:-translate-y-1 group">
                  <CardHeader className="pb-2">
                    {postRel.categorias_blog && (
                      <Badge variant="secondary" className="w-fit mb-2 text-xs">
                        {postRel.categorias_blog.nome}
                      </Badge>
                    )}
                    <CardTitle className="text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {postRel.titulo}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {new Date(postRel.data_publicacao).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to={`/blog/${postRel.slug}`}>
                      <Button variant="ghost" size="sm" className="w-full text-primary">
                        Ler artigo →
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default BlogPost;

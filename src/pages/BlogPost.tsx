import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 md:ml-64 mb-16 md:mb-0">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6 md:ml-64 mb-16 md:mb-0">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs 
          items={[
            { label: "Blog", href: "/blog" },
            { label: post.categorias_blog?.nome || "Post" },
          ]} 
        />
        
        <Link to="/blog">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Blog
          </Button>
        </Link>

        <article className="mb-12">
          <div className="mb-6">
            {post.categorias_blog && (
              <Badge variant="secondary" className="mb-4">{post.categorias_blog.nome}</Badge>
            )}
            <h1 className="text-4xl font-bold mb-4">{post.titulo}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {post.autor && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
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
            </div>
          </div>

          <div 
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: post.conteudo }}
          />
        </article>

        {postsRelacionados.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Posts Relacionados</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {postsRelacionados.map((postRel) => (
                <Card key={postRel.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    {postRel.categorias_blog && (
                      <Badge variant="secondary" className="w-fit mb-2">
                        {postRel.categorias_blog.nome}
                      </Badge>
                    )}
                    <CardTitle className="text-base line-clamp-2">{postRel.titulo}</CardTitle>
                    <CardDescription className="text-xs">
                      {new Date(postRel.data_publicacao).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to={`/blog/${postRel.slug}`}>
                      <Button variant="ghost" size="sm" className="w-full">
                        Ler post
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPost;

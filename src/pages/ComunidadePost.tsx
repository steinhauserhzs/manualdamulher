import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LikeButton } from "@/components/comunidade/LikeButton";
import { ComentarioForm } from "@/components/comunidade/ComentarioForm";
import { ComentarioCard } from "@/components/comunidade/ComentarioCard";
import { EnqueteDisplay } from "@/components/comunidade/EnqueteDisplay";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { LinkifyText } from "@/components/comunidade/LinkifyText";

interface Post {
  id: string;
  tipo: string;
  titulo: string | null;
  conteudo: string;
  imagem_url: string | null;
  tags: string[] | null;
  likes_count: number;
  comentarios_count: number;
  created_at: string;
  user_id: string;
  perfis: {
    nome: string;
    avatar_url: string | null;
  };
  comunidade_enquetes: Array<{
    id: string;
    opcoes: any;
    multipla_escolha: boolean;
    data_fim: string | null;
  }>;
}

interface Comentario {
  id: string;
  conteudo: string;
  created_at: string;
  likes_count: number;
  user_id: string;
  parent_id: string | null;
  perfis: {
    nome: string;
    avatar_url: string | null;
  };
}

export default function ComunidadePost() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      carregarPost();
      carregarComentarios();
    }
  }, [id]);

  const carregarPost = async () => {
    try {
      const { data, error } = await supabase
        .from("comunidade_posts")
        .select(`
          *,
          perfis!inner (nome, avatar_url),
          comunidade_enquetes (id, opcoes, multipla_escolha, data_fim)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setPost(data as any);
    } catch (error) {
      console.error("Erro ao carregar post:", error);
      toast.error("Erro ao carregar post");
    } finally {
      setIsLoading(false);
    }
  };

  const carregarComentarios = async () => {
    try {
      const { data, error } = await supabase
        .from("comunidade_comentarios")
        .select(`
          *,
          perfis!inner (nome, avatar_url)
        `)
        .eq("post_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComentarios(data as any || []);
    } catch (error) {
      console.error("Erro ao carregar comentários:", error);
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      post: "Post",
      pergunta: "Pergunta",
      dica: "Dica",
      enquete: "Enquete",
    };
    return labels[tipo] || tipo;
  };

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      post: "📝",
      pergunta: "❓",
      dica: "💡",
      enquete: "📊",
    };
    return icons[tipo] || "📝";
  };

  const comentariosPrincipais = comentarios.filter((c) => !c.parent_id);
  const respostasMap = comentarios.reduce((acc, comentario) => {
    if (comentario.parent_id) {
      if (!acc[comentario.parent_id]) {
        acc[comentario.parent_id] = [];
      }
      acc[comentario.parent_id].push(comentario);
    }
    return acc;
  }, {} as Record<string, Comentario[]>);

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container max-w-4xl mx-auto p-4 md:p-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Post não encontrado</p>
          <Button asChild>
            <Link to="/comunidade">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Comunidade
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <Button variant="ghost" asChild>
        <Link to="/comunidade">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>
      </Button>

      <Card className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Link to={`/perfil/${post.user_id}`} className="flex-shrink-0">
            <Avatar className="h-12 w-12 cursor-pointer hover:ring-2 ring-primary transition-all">
              <AvatarImage src={post.perfis?.avatar_url || undefined} />
              <AvatarFallback>
                {post.perfis?.nome?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Link 
                to={`/perfil/${post.user_id}`}
                className="font-semibold hover:underline"
              >
                {post.perfis?.nome || "Usuária"}
              </Link>
              <Badge variant="secondary" className="text-xs">
                {getTipoIcon(post.tipo)} {getTipoLabel(post.tipo)}
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          </div>
        </div>

        {post.titulo && (
          <h1 className="text-2xl font-bold mb-3">{post.titulo}</h1>
        )}

        <p className="text-foreground whitespace-pre-wrap mb-4">
          <LinkifyText text={post.conteudo} />
        </p>

        {post.imagem_url && (
          <img
            src={post.imagem_url}
            alt="Imagem do post"
            className="rounded-lg w-full mb-4"
          />
        )}

        {post.tipo === "enquete" && post.comunidade_enquetes?.[0] && (
          <EnqueteDisplay
            enquete={post.comunidade_enquetes[0]}
            postId={post.id}
          />
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <Separator className="my-4" />

        <div className="flex items-center gap-4">
          <LikeButton
            postId={post.id}
            initialLikesCount={post.likes_count || 0}
            onLikeChange={carregarPost}
          />
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">{post.comentarios_count || 0}</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          Comentários ({comentariosPrincipais.length})
        </h2>

        <ComentarioForm
          postId={post.id}
          onSuccess={carregarComentarios}
          placeholder="Deixe seu comentário..."
        />

        {comentariosPrincipais.length > 0 && (
          <div className="mt-6 space-y-4">
            {comentariosPrincipais.map((comentario) => (
              <ComentarioCard
                key={comentario.id}
                comentario={comentario}
                postId={post.id}
                respostas={respostasMap[comentario.id] || []}
                onUpdate={carregarComentarios}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

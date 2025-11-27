import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import { EnqueteDisplay } from "./EnqueteDisplay";

interface PostCardProps {
  post: {
    id: string;
    user_id: string;
    tipo: string;
    titulo: string | null;
    conteudo: string;
    imagem_url: string | null;
    tags: string[] | null;
    likes_count: number;
    comentarios_count: number;
    created_at: string;
    perfis: {
      nome: string;
      avatar_url: string | null;
    };
    comunidade_enquetes?: Array<{
      id: string;
      opcoes: any;
      multipla_escolha: boolean;
      data_fim: string | null;
    }>;
  };
  onUpdate?: () => void;
}

const getTipoIcon = (tipo: string) => {
  switch (tipo) {
    case "pergunta":
      return "❓";
    case "dica":
      return "💡";
    case "enquete":
      return "📊";
    default:
      return "📝";
  }
};

const getTipoLabel = (tipo: string) => {
  switch (tipo) {
    case "pergunta":
      return "Pergunta";
    case "dica":
      return "Dica";
    case "enquete":
      return "Enquete";
    default:
      return "Post";
  }
};

export const PostCard = ({ post, onUpdate }: PostCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <div className="bg-card rounded-lg p-4 sm:p-6 border shadow-sm hover:shadow-md transition-shadow">
      {/* Header do Post */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.perfis.avatar_url || undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(post.perfis.nome)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-foreground">{post.perfis.nome}</p>
            <Badge variant="secondary" className="text-xs">
              {getTipoIcon(post.tipo)} {getTipoLabel(post.tipo)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{timeAgo}</p>
        </div>
      </div>

      {/* Título (se houver) */}
      {post.titulo && (
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {post.titulo}
        </h3>
      )}

      {/* Conteúdo */}
      <p className="text-foreground whitespace-pre-wrap mb-4">{post.conteudo}</p>

      {/* Imagem (se houver) */}
      {post.imagem_url && (
        <img
          src={post.imagem_url}
          alt="Post"
          className="w-full rounded-lg mb-4 max-h-96 object-cover"
        />
      )}

      {/* Enquete (se houver) */}
      {post.tipo === "enquete" && post.comunidade_enquetes && post.comunidade_enquetes[0] && (
        <EnqueteDisplay
          enquete={post.comunidade_enquetes[0]}
          postId={post.id}
          onUpdate={onUpdate}
        />
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="text-sm text-primary hover:underline cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Ações */}
      <div className="flex items-center gap-6 text-muted-foreground border-t pt-4">
        <button className="flex items-center gap-2 hover:text-primary transition-colors">
          <Heart className="h-5 w-5" />
          <span className="text-sm">{post.likes_count}</span>
        </button>
        <button className="flex items-center gap-2 hover:text-primary transition-colors">
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm">{post.comentarios_count}</span>
        </button>
        <button className="flex items-center gap-2 hover:text-primary transition-colors ml-auto">
          <Bookmark className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

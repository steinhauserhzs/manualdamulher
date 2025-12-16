import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Bookmark, User } from "lucide-react";
import { EnqueteDisplay } from "./EnqueteDisplay";
import { LikeButton } from "./LikeButton";
import { LinkifyText } from "./LinkifyText";
import { UserBadges } from "./UserBadges";

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
    anonimo?: boolean;
    perfis: {
      nome: string;
      avatar_url: string | null;
      username?: string | null;
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
  const isAnonimo = post.anonimo === true;

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

  const displayName = isAnonimo ? "Usuária Anônima" : post.perfis.nome;
  const displayUsername = isAnonimo ? null : post.perfis.username;
  const displayAvatar = isAnonimo ? null : post.perfis.avatar_url;

  return (
    <Card className="p-4 sm:p-6">
      {/* Header do Post */}
      <div className="flex items-start gap-3 mb-4">
        {isAnonimo ? (
          <div className="flex-shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-muted text-muted-foreground">
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <Link to={`/perfil/${post.user_id}`} className="flex-shrink-0">
            <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 ring-primary transition-all">
              <AvatarImage src={displayAvatar || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {isAnonimo ? (
              <span className="font-semibold text-muted-foreground">
                {displayName}
              </span>
            ) : (
              <Link 
                to={`/perfil/${post.user_id}`}
                className="font-semibold text-foreground hover:underline"
              >
                {displayName}
              </Link>
            )}
            {displayUsername && (
              <span className="text-sm text-muted-foreground">
                @{displayUsername}
              </span>
            )}
            <Badge variant="secondary" className="text-xs">
              {getTipoIcon(post.tipo)} {getTipoLabel(post.tipo)}
            </Badge>
          </div>
          {!isAnonimo && <UserBadges userId={post.user_id} maxDisplay={2} />}
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
      <p className="text-foreground whitespace-pre-wrap mb-4">
        <LinkifyText text={post.conteudo} />
      </p>

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
      <div className="flex items-center gap-4 pt-3 border-t">
        <LikeButton
          postId={post.id}
          initialLikesCount={post.likes_count || 0}
          onLikeChange={onUpdate}
        />
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link to={`/comunidade/${post.id}`}>
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">{post.comentarios_count || 0}</span>
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="ml-auto">
          <Bookmark className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

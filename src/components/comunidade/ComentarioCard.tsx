import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { LikeButton } from "./LikeButton";
import { ComentarioForm } from "./ComentarioForm";
import { LinkifyText } from "./LinkifyText";

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

interface ComentarioCardProps {
  comentario: Comentario;
  postId: string;
  respostas?: Comentario[];
  onUpdate: () => void;
}

export function ComentarioCard({ comentario, postId, respostas = [], onUpdate }: ComentarioCardProps) {
  const [mostrarFormResposta, setMostrarFormResposta] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Link to={`/perfil/${comentario.user_id}`} className="flex-shrink-0">
          <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 ring-primary transition-all">
            <AvatarImage src={comentario.perfis?.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {comentario.perfis?.nome?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 space-y-2">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Link 
                to={`/perfil/${comentario.user_id}`}
                className="font-semibold text-sm hover:underline"
              >
                {comentario.perfis?.nome || "Usuária"}
              </Link>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comentario.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              <LinkifyText text={comentario.conteudo} />
            </p>
          </div>

          <div className="flex items-center gap-1">
            <LikeButton
              comentarioId={comentario.id}
              initialLikesCount={comentario.likes_count || 0}
              onLikeChange={onUpdate}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMostrarFormResposta(!mostrarFormResposta)}
              className="gap-1 text-muted-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              Responder
            </Button>
          </div>

          {mostrarFormResposta && (
            <div className="mt-3">
              <ComentarioForm
                postId={postId}
                parentId={comentario.id}
                onSuccess={() => {
                  setMostrarFormResposta(false);
                  onUpdate();
                }}
                onCancel={() => setMostrarFormResposta(false)}
                placeholder={`Respondendo ${comentario.perfis?.nome}...`}
              />
            </div>
          )}

          {respostas.length > 0 && (
            <div className="ml-4 mt-3 space-y-3 border-l-2 border-border pl-3">
              {respostas.map((resposta) => (
                <ComentarioCard
                  key={resposta.id}
                  comentario={resposta}
                  postId={postId}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

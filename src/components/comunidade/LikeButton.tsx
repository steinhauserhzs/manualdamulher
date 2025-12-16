import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { criarNotificacao, getAutorPost, getAutorComentario, getNomeUsuario } from "@/lib/notificacoes";

interface LikeButtonProps {
  postId?: string;
  comentarioId?: string;
  initialLikesCount: number;
  onLikeChange?: (newCount: number) => void;
}

export function LikeButton({ postId, comentarioId, initialLikesCount, onLikeChange }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    verificarLike();
  }, [postId, comentarioId]);

  const verificarLike = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const query = supabase
      .from("comunidade_likes")
      .select("id")
      .eq("user_id", user.id);

    if (postId) {
      query.eq("post_id", postId);
    } else if (comentarioId) {
      query.eq("comentario_id", comentarioId);
    }

    const { data } = await query.maybeSingle();
    setIsLiked(!!data);
  };

  const handleLike = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Você precisa estar logada para curtir");
      setIsLoading(false);
      return;
    }

    try {
      if (isLiked) {
        // Remover like
        const query = supabase
          .from("comunidade_likes")
          .delete()
          .eq("user_id", user.id);

        if (postId) {
          query.eq("post_id", postId);
        } else if (comentarioId) {
          query.eq("comentario_id", comentarioId);
        }

        const { error } = await query;
        if (error) throw error;

        const newCount = likesCount - 1;
        setLikesCount(newCount);
        setIsLiked(false);
        onLikeChange?.(newCount);

        if (postId) {
          await supabase
            .from("comunidade_posts")
            .update({ likes_count: newCount })
            .eq("id", postId);
        } else if (comentarioId) {
          await supabase
            .from("comunidade_comentarios")
            .update({ likes_count: newCount })
            .eq("id", comentarioId);
        }
      } else {
        // Adicionar like
        const likeData: any = { user_id: user.id };
        if (postId) likeData.post_id = postId;
        if (comentarioId) likeData.comentario_id = comentarioId;

        const { error } = await supabase
          .from("comunidade_likes")
          .insert(likeData);

        if (error) throw error;

        const newCount = likesCount + 1;
        setLikesCount(newCount);
        setIsLiked(true);
        onLikeChange?.(newCount);

        if (postId) {
          await supabase
            .from("comunidade_posts")
            .update({ likes_count: newCount })
            .eq("id", postId);
          
          // Notificar autor do post
          const autorId = await getAutorPost(postId);
          if (autorId) {
            const nomeUsuario = await getNomeUsuario(user.id);
            await criarNotificacao({
              userId: autorId,
              tipo: 'like',
              titulo: 'Nova curtida! ❤️',
              mensagem: `${nomeUsuario} curtiu seu post`,
              referenciaId: postId,
              referenciaTipo: 'post'
            });
          }
        } else if (comentarioId) {
          await supabase
            .from("comunidade_comentarios")
            .update({ likes_count: newCount })
            .eq("id", comentarioId);
          
          // Notificar autor do comentário
          const autorId = await getAutorComentario(comentarioId);
          if (autorId) {
            const nomeUsuario = await getNomeUsuario(user.id);
            await criarNotificacao({
              userId: autorId,
              tipo: 'like',
              titulo: 'Nova curtida! ❤️',
              mensagem: `${nomeUsuario} curtiu seu comentário`,
              referenciaId: comentarioId,
              referenciaTipo: 'comentario'
            });
          }
        }
      }
    } catch (error) {
      console.error("Erro ao curtir:", error);
      toast.error("Erro ao curtir. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={isLoading}
      className="gap-1 text-muted-foreground hover:text-rose-600 transition-colors"
    >
      <Heart
        className={`h-4 w-4 transition-all ${
          isLiked ? "fill-rose-600 text-rose-600" : ""
        }`}
      />
      <span className={isLiked ? "text-rose-600" : ""}>{likesCount}</span>
    </Button>
  );
}

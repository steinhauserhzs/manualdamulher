import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { criarNotificacao, getAutorPost, getAutorComentario, getNomeUsuario } from "@/lib/notificacoes";

interface LikeButtonProps {
  postId?: string;
  comentarioId?: string;
  initialLikesCount: number;
  onLikeChange?: () => void;
}

export const LikeButton = ({
  postId,
  comentarioId,
  initialLikesCount,
  onLikeChange,
}: LikeButtonProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Buscar contagem real de likes do banco
  const fetchRealLikesCount = useCallback(async () => {
    const query = supabase
      .from("comunidade_likes")
      .select("id", { count: "exact" });

    if (postId) {
      query.eq("post_id", postId);
    } else if (comentarioId) {
      query.eq("comentario_id", comentarioId);
    }

    const { count } = await query;
    if (count !== null) {
      setLikesCount(count);
    }
  }, [postId, comentarioId]);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        verificarLike(user.id);
      }
    };
    getCurrentUser();
    fetchRealLikesCount();
  }, [postId, comentarioId, fetchRealLikesCount]);

  const verificarLike = async (userId: string) => {
    const query = supabase
      .from("comunidade_likes")
      .select("id")
      .eq("user_id", userId);

    if (postId) {
      query.eq("post_id", postId);
    } else if (comentarioId) {
      query.eq("comentario_id", comentarioId);
    }

    const { data } = await query.maybeSingle();
    setIsLiked(!!data);
  };

  const handleLike = async () => {
    if (!currentUserId) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logada para curtir.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isLiked) {
        // Remover like
        const query = supabase
          .from("comunidade_likes")
          .delete()
          .eq("user_id", currentUserId);

        if (postId) {
          query.eq("post_id", postId);
        } else if (comentarioId) {
          query.eq("comentario_id", comentarioId);
        }

        const { error } = await query;
        if (error) throw error;

        setIsLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
      } else {
        // Adicionar like
        const { error } = await supabase.from("comunidade_likes").insert({
          user_id: currentUserId,
          post_id: postId || null,
          comentario_id: comentarioId || null,
        });

        if (error) throw error;

        setIsLiked(true);
        setLikesCount((prev) => prev + 1);

        // Criar notificação para o autor (se não for o próprio usuário)
        try {
          let autorId: string | null = null;
          
          if (postId) {
            autorId = await getAutorPost(postId);
          } else if (comentarioId) {
            autorId = await getAutorComentario(comentarioId);
          }

          if (autorId && autorId !== currentUserId) {
            const nomeUsuario = await getNomeUsuario(currentUserId);
            await criarNotificacao({
              userId: autorId,
              tipo: "like",
              titulo: "Nova curtida! ❤️",
              mensagem: `${nomeUsuario} curtiu seu ${postId ? "post" : "comentário"}`,
              referenciaId: postId || comentarioId || null,
              referenciaTipo: postId ? "post" : "comentario",
            });
          }
        } catch (notifError) {
          console.error("Erro ao criar notificação:", notifError);
        }
      }

      // Atualizar contador na tabela original para manter sincronizado
      if (postId) {
        const { count } = await supabase
          .from("comunidade_likes")
          .select("id", { count: "exact" })
          .eq("post_id", postId);

        await supabase
          .from("comunidade_posts")
          .update({ likes_count: count || 0 })
          .eq("id", postId);
      } else if (comentarioId) {
        const { count } = await supabase
          .from("comunidade_likes")
          .select("id", { count: "exact" })
          .eq("comentario_id", comentarioId);

        await supabase
          .from("comunidade_comentarios")
          .update({ likes_count: count || 0 })
          .eq("id", comentarioId);
      }

      onLikeChange?.();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1"
      onClick={handleLike}
      disabled={isLoading}
    >
      <Heart
        className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
      />
      <span className="text-sm">{likesCount}</span>
    </Button>
  );
};

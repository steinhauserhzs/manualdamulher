import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { criarNotificacao, getAutorPost, getAutorComentario, getNomeUsuario, detectarMencoes } from "@/lib/notificacoes";

interface ComentarioFormProps {
  postId: string;
  parentId?: string;
  onSuccess: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export function ComentarioForm({ postId, parentId, onSuccess, onCancel, placeholder }: ComentarioFormProps) {
  const [conteudo, setConteudo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!conteudo.trim()) {
      toast.error("Escreva algo antes de comentar");
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logada para comentar");
        return;
      }

      const { data: novoComentario, error } = await supabase
        .from("comunidade_comentarios")
        .insert({
          post_id: postId,
          user_id: user.id,
          conteudo: conteudo.trim(),
          parent_id: parentId || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar contador de comentários no post
      const { data: currentPost } = await supabase
        .from("comunidade_posts")
        .select("comentarios_count")
        .eq("id", postId)
        .single();

      if (currentPost) {
        await supabase
          .from("comunidade_posts")
          .update({ comentarios_count: (currentPost.comentarios_count || 0) + 1 })
          .eq("id", postId);
      }

      // Get user name for notification
      const nomeUsuario = await getNomeUsuario(user.id);

      // Notify based on comment type
      if (parentId) {
        // It's a reply - notify the comment author
        const autorComentario = await getAutorComentario(parentId);
        if (autorComentario) {
          await criarNotificacao({
            userId: autorComentario,
            tipo: 'resposta',
            titulo: 'Nova resposta! 💬',
            mensagem: `${nomeUsuario} respondeu seu comentário`,
            referenciaId: postId,
            referenciaTipo: 'post'
          });
        }
      } else {
        // It's a new comment - notify the post author
        const autorPost = await getAutorPost(postId);
        if (autorPost) {
          await criarNotificacao({
            userId: autorPost,
            tipo: 'comentario',
            titulo: 'Novo comentário! 💬',
            mensagem: `${nomeUsuario} comentou em seu post`,
            referenciaId: postId,
            referenciaTipo: 'post'
          });
        }
      }

      // Detect and notify mentions
      const mencionados = await detectarMencoes(conteudo);
      for (const mencionadoId of mencionados) {
        await criarNotificacao({
          userId: mencionadoId,
          tipo: 'mencao',
          titulo: 'Você foi mencionada! 📢',
          mensagem: `${nomeUsuario} mencionou você em um comentário`,
          referenciaId: postId,
          referenciaTipo: 'post'
        });
      }

      toast.success(parentId ? "Resposta enviada!" : "Comentário enviado!");
      setConteudo("");
      onSuccess();
    } catch (error) {
      console.error("Erro ao comentar:", error);
      toast.error("Erro ao enviar comentário. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        placeholder={placeholder || "Escreva seu comentário..."}
        rows={3}
        disabled={isLoading}
        className="resize-none"
      />
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading || !conteudo.trim()}>
          <Send className="h-4 w-4 mr-2" />
          {isLoading ? "Enviando..." : parentId ? "Responder" : "Comentar"}
        </Button>
      </div>
    </form>
  );
}

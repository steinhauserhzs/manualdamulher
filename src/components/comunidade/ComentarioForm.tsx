import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

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

      const { error } = await supabase
        .from("comunidade_comentarios")
        .insert({
          post_id: postId,
          user_id: user.id,
          conteudo: conteudo.trim(),
          parent_id: parentId || null,
        });

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

import { supabase } from "@/integrations/supabase/client";

export type TipoNotificacao = 
  | 'like' 
  | 'comentario' 
  | 'resposta'
  | 'seguidor' 
  | 'mensagem' 
  | 'marketplace'
  | 'mencao'
  | 'badge';

interface CriarNotificacaoParams {
  userId: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem?: string;
  referenciaId?: string | null;
  referenciaTipo?: string | null;
}

export async function criarNotificacao({
  userId,
  tipo,
  titulo,
  mensagem,
  referenciaId,
  referenciaTipo
}: CriarNotificacaoParams): Promise<boolean> {
  try {
    // Get current user to avoid self-notification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id === userId) return false;

    const { error } = await supabase.from("notificacoes").insert({
      user_id: userId,
      tipo,
      titulo,
      mensagem: mensagem || null,
      referencia_id: referenciaId || null,
      referencia_tipo: referenciaTipo || null,
      lida: false
    });

    if (error) {
      console.error("Erro ao criar notificação:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao criar notificação:", error);
    return false;
  }
}

// Helper to get author of a post
export async function getAutorPost(postId: string): Promise<string | null> {
  const { data } = await supabase
    .from("comunidade_posts")
    .select("user_id")
    .eq("id", postId)
    .single();
  return data?.user_id || null;
}

// Helper to get author of a comment
export async function getAutorComentario(comentarioId: string): Promise<string | null> {
  const { data } = await supabase
    .from("comunidade_comentarios")
    .select("user_id")
    .eq("id", comentarioId)
    .single();
  return data?.user_id || null;
}

// Helper to get user name
export async function getNomeUsuario(userId: string): Promise<string> {
  const { data } = await supabase
    .from("perfis")
    .select("nome")
    .eq("user_id", userId)
    .single();
  return data?.nome || "Alguém";
}

// Detect @mentions in text and return user IDs
export async function detectarMencoes(texto: string): Promise<string[]> {
  const mencoes = texto.match(/@(\w+)/g);
  if (!mencoes) return [];

  const nomes = mencoes.map(m => m.substring(1));
  const { data } = await supabase
    .from("perfis")
    .select("user_id, nome")
    .in("nome", nomes);

  return data?.map(p => p.user_id) || [];
}

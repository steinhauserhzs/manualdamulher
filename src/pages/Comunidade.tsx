import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

import { PostCard } from "@/components/comunidade/PostCard";
import { PostForm } from "@/components/comunidade/PostForm";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Post {
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
}

const Comunidade = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState<string>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    carregarPosts();
  }, [filtroAtivo]);

  const carregarPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("comunidade_posts")
        .select(`
          *,
          comunidade_enquetes (id, opcoes, multipla_escolha, data_fim)
        `)
        .order("created_at", { ascending: false });

      if (filtroAtivo !== "todos") {
        query = query.eq("tipo", filtroAtivo);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Buscar perfis separadamente
      if (data) {
        const userIds = [...new Set(data.map((p) => p.user_id))];
        const { data: perfisData } = await supabase
          .from("perfis")
          .select("user_id, nome, avatar_url")
          .in("user_id", userIds);

        const perfisMap = new Map(
          perfisData?.map((p) => [p.user_id, p]) || []
        );

        const postsComPerfis = data.map((post) => ({
          ...post,
          perfis: perfisMap.get(post.user_id) || {
            nome: "Usuária",
            avatar_url: null,
          },
        }));

        setPosts(postsComPerfis);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar posts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    setDialogOpen(false);
    carregarPosts();
    toast({
      title: "Post criado!",
      description: "Seu post foi publicado na comunidade.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            🌐 Comunidade
          </h1>
          <p className="text-muted-foreground">
            Conecte-se, compartilhe experiências e apoie outras mulheres
          </p>
        </div>

        {/* Filtros e Botão de Criar */}
        <div className="space-y-4 mb-6">
          {/* Filtros como botões individuais */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: "todos", emoji: "📝", label: "Todos" },
              { value: "pergunta", emoji: "❓", label: "Perguntas" },
              { value: "dica", emoji: "💡", label: "Dicas" },
              { value: "enquete", emoji: "📊", label: "Enquetes" },
            ].map((filtro) => (
              <Button
                key={filtro.value}
                variant={filtroAtivo === filtro.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltroAtivo(filtro.value)}
                className="flex items-center gap-1.5"
              >
                <span>{filtro.emoji}</span>
                <span>{filtro.label}</span>
              </Button>
            ))}
          </div>

          {/* Botão de Criar Post */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Criar Post
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-2xl mx-4 sm:mx-auto max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Post</DialogTitle>
              </DialogHeader>
              <PostForm onSuccess={handlePostCreated} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Feed de Posts */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card rounded-lg p-6 border animate-pulse"
              >
                <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              Nenhum post encontrado
            </p>
            <p className="text-sm text-muted-foreground">
              Seja a primeira a compartilhar algo na comunidade!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onUpdate={carregarPosts} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comunidade;

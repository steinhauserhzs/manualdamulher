import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

import { PostCard } from "@/components/comunidade/PostCard";
import { PostForm } from "@/components/comunidade/PostForm";
import { MensagensDirectas } from "@/components/comunidade/MensagensDirectas";
import { GruposCard } from "@/components/comunidade/GruposCard";
import { StoriesSection } from "@/components/comunidade/StoriesSection";
import { UsuariosOnline } from "@/components/comunidade/UsuariosOnline";
import { SearchBar } from "@/components/comunidade/SearchBar";
import { Plus, MessageCircle, Users, UserCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
}

const Comunidade = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState<string>("todos");
  const [filtroSeguindo, setFiltroSeguindo] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId !== null) {
      carregarPosts();
    }
  }, [filtroAtivo, filtroSeguindo, currentUserId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const carregarPosts = async () => {
    setLoading(true);
    try {
      // Se filtro "seguindo" estiver ativo, buscar IDs de quem eu sigo
      let seguindoIds: string[] = [];
      if (filtroSeguindo && currentUserId) {
        const { data: seguindoData } = await supabase
          .from("comunidade_seguidores")
          .select("seguindo_id")
          .eq("seguidor_id", currentUserId);
        
        seguindoIds = seguindoData?.map(s => s.seguindo_id) || [];
        
        // Se não seguir ninguém, mostrar lista vazia
        if (seguindoIds.length === 0) {
          setPosts([]);
          setLoading(false);
          return;
        }
      }

      let query = supabase
        .from("comunidade_posts")
        .select(`
          *,
          comunidade_enquetes (id, opcoes, multipla_escolha, data_fim)
        `)
        .is("grupo_id", null) // Apenas posts do feed geral (não de grupos)
        .order("created_at", { ascending: false });

      if (filtroAtivo !== "todos") {
        query = query.eq("tipo", filtroAtivo);
      }

      // Filtrar por usuários seguidos
      if (filtroSeguindo && seguindoIds.length > 0) {
        query = query.in("user_id", seguindoIds);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Buscar perfis separadamente
      if (data) {
        const userIds = [...new Set(data.map((p) => p.user_id))];
        const { data: perfisData } = await supabase
          .from("perfis")
          .select("user_id, nome, avatar_url, username")
          .in("user_id", userIds);

        const perfisMap = new Map(
          perfisData?.map((p) => [p.user_id, p]) || []
        );

        const postsComPerfis = data.map((post) => ({
          ...post,
          perfis: perfisMap.get(post.user_id) || {
            nome: "Usuária",
            avatar_url: null,
            username: null,
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

        {/* Barra de Pesquisa */}
        <div className="mb-6">
          <SearchBar />
        </div>

        {/* Usuários Online */}
        <UsuariosOnline />

        {/* Stories */}
        <StoriesSection />

        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feed" className="text-xs sm:text-sm">📝 Feed</TabsTrigger>
            <TabsTrigger value="mensagens" className="text-xs sm:text-sm">
              <MessageCircle className="h-4 w-4 mr-1" />
              Mensagens
            </TabsTrigger>
            <TabsTrigger value="grupos" className="text-xs sm:text-sm">
              <Users className="h-4 w-4 mr-1" />
              Grupos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            {/* Filtros e Botão de Criar */}
            <div className="space-y-4">
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
                
                {/* Filtro Seguindo */}
                <Button
                  variant={filtroSeguindo ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroSeguindo(!filtroSeguindo)}
                  className="flex items-center gap-1.5"
                >
                  <UserCheck className="h-4 w-4" />
                  <span>Seguindo</span>
                </Button>
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
                  {filtroSeguindo 
                    ? "Nenhum post de quem você segue" 
                    : "Nenhum post encontrado"
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {filtroSeguindo 
                    ? "Siga mais pessoas para ver seus posts aqui!" 
                    : "Seja a primeira a compartilhar algo na comunidade!"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} onUpdate={carregarPosts} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mensagens">
            <MensagensDirectas />
          </TabsContent>

          <TabsContent value="grupos">
            <GruposCard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Comunidade;

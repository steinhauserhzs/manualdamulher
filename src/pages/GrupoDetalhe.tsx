import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Users2, Lock, Globe, Plus, UserPlus, LogOut, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PostCard } from "@/components/comunidade/PostCard";
import { GrupoPostForm } from "@/components/comunidade/GrupoPostForm";

interface Grupo {
  id: string;
  nome: string;
  descricao: string | null;
  cor: string;
  privado: boolean;
  membros_count: number;
  criadora_id: string;
  created_at: string;
}

interface Membro {
  user_id: string;
  papel: string;
  perfis: {
    nome: string;
    avatar_url: string | null;
  };
}

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

const GrupoDetalhe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMembro, setIsMembro] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      carregarDados();
    }
  }, [id]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);

      // Buscar dados do grupo
      const { data: grupoData, error: grupoError } = await supabase
        .from("comunidade_grupos")
        .select("*")
        .eq("id", id)
        .single();

      if (grupoError) throw grupoError;
      setGrupo(grupoData);

      // Verificar se é membro
      const { data: membroData } = await supabase
        .from("comunidade_grupos_membros")
        .select("papel")
        .eq("grupo_id", id)
        .eq("user_id", user.id)
        .single();

      setIsMembro(!!membroData);
      setIsAdmin(membroData?.papel === "admin" || grupoData.criadora_id === user.id);

      // Buscar membros do grupo
      const { data: membrosData } = await supabase
        .from("comunidade_grupos_membros")
        .select("user_id, papel")
        .eq("grupo_id", id);

      if (membrosData) {
        const userIds = membrosData.map(m => m.user_id);
        const { data: perfisData } = await supabase
          .from("perfis")
          .select("user_id, nome, avatar_url")
          .in("user_id", userIds);

        const perfisMap = new Map(perfisData?.map(p => [p.user_id, p]) || []);
        const membrosComPerfis = membrosData.map(m => ({
          ...m,
          perfis: perfisMap.get(m.user_id) || { nome: "Usuária", avatar_url: null }
        }));
        setMembros(membrosComPerfis);
      }

      // Buscar posts do grupo
      await carregarPosts();
    } catch (error: any) {
      toast({
        title: "Erro ao carregar grupo",
        description: error.message,
        variant: "destructive"
      });
      navigate("/comunidade");
    } finally {
      setLoading(false);
    }
  };

  const carregarPosts = async () => {
    try {
      const { data: postsData, error } = await supabase
        .from("comunidade_posts")
        .select(`
          *,
          comunidade_enquetes (id, opcoes, multipla_escolha, data_fim)
        `)
        .eq("grupo_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (postsData) {
        const userIds = [...new Set(postsData.map(p => p.user_id))];
        const { data: perfisData } = await supabase
          .from("perfis")
          .select("user_id, nome, avatar_url")
          .in("user_id", userIds);

        const perfisMap = new Map(perfisData?.map(p => [p.user_id, p]) || []);
        const postsComPerfis = postsData.map(post => ({
          ...post,
          perfis: perfisMap.get(post.user_id) || { nome: "Usuária", avatar_url: null }
        }));
        setPosts(postsComPerfis);
      }
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
    }
  };

  const entrarGrupo = async () => {
    if (!userId || !grupo) return;

    try {
      await supabase.from("comunidade_grupos_membros").insert({
        grupo_id: grupo.id,
        user_id: userId
      });

      await supabase
        .from("comunidade_grupos")
        .update({ membros_count: grupo.membros_count + 1 })
        .eq("id", grupo.id);

      toast({ title: "Você entrou no grupo!" });
      carregarDados();
    } catch (error: any) {
      toast({ title: "Erro ao entrar no grupo", description: error.message, variant: "destructive" });
    }
  };

  const sairGrupo = async () => {
    if (!userId || !grupo) return;

    try {
      await supabase
        .from("comunidade_grupos_membros")
        .delete()
        .eq("grupo_id", grupo.id)
        .eq("user_id", userId);

      toast({ title: "Você saiu do grupo" });
      navigate("/comunidade");
    } catch (error: any) {
      toast({ title: "Erro ao sair do grupo", description: error.message, variant: "destructive" });
    }
  };

  const handlePostCreated = () => {
    setDialogOpen(false);
    carregarPosts();
    toast({ title: "Post criado no grupo!" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!grupo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Grupo não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/comunidade")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: grupo.cor }}
          >
            {grupo.nome.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{grupo.nome}</h1>
              {grupo.privado ? (
                <Lock className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Globe className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {grupo.membros_count} {grupo.membros_count === 1 ? "membro" : "membros"}
            </p>
          </div>
          {isMembro ? (
            <div className="flex gap-2">
              {isAdmin && (
                <Badge variant="secondary">Admin</Badge>
              )}
              {!isAdmin && (
                <Button variant="outline" size="sm" onClick={sairGrupo}>
                  <LogOut className="h-4 w-4 mr-1" /> Sair
                </Button>
              )}
            </div>
          ) : (
            <Button onClick={entrarGrupo}>
              <UserPlus className="h-4 w-4 mr-2" /> Entrar no Grupo
            </Button>
          )}
        </div>

        {/* Descrição */}
        {grupo.descricao && (
          <Card>
            <CardContent className="pt-4">
              <p className="text-muted-foreground">{grupo.descricao}</p>
            </CardContent>
          </Card>
        )}

        {/* Conteúdo do Grupo (apenas para membros) */}
        {isMembro ? (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feed do Grupo */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Publicações</h2>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" /> Publicar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Publicar no Grupo</DialogTitle>
                    </DialogHeader>
                    <GrupoPostForm grupoId={grupo.id} onSuccess={handlePostCreated} />
                  </DialogContent>
                </Dialog>
              </div>

              {posts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Nenhuma publicação ainda</p>
                    <p className="text-sm text-muted-foreground">Seja a primeira a publicar neste grupo!</p>
                  </CardContent>
                </Card>
              ) : (
                posts.map(post => (
                  <PostCard key={post.id} post={post} onUpdate={carregarPosts} />
                ))
              )}
            </div>

            {/* Sidebar - Membros */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users2 className="h-4 w-4" />
                    Membros ({membros.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {membros.slice(0, 10).map(membro => (
                    <div 
                      key={membro.user_id} 
                      className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                      onClick={() => navigate(`/perfil/${membro.user_id}`)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={membro.perfis.avatar_url || undefined} />
                        <AvatarFallback>{membro.perfis.nome.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{membro.perfis.nome}</p>
                      </div>
                      {membro.papel === "admin" && (
                        <Badge variant="secondary" className="text-xs">Admin</Badge>
                      )}
                    </div>
                  ))}
                  {membros.length > 10 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{membros.length - 10} membros
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium mb-2">Entre no grupo para ver as publicações</p>
              <p className="text-sm text-muted-foreground mb-4">
                Participe para interagir com outros membros
              </p>
              <Button onClick={entrarGrupo}>
                <UserPlus className="h-4 w-4 mr-2" /> Entrar no Grupo
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GrupoDetalhe;

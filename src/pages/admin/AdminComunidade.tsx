import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { MessageSquare, AlertTriangle, Users, Trash2, CheckCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Post {
  id: string;
  conteudo: string;
  tipo: string;
  created_at: string;
  user_id: string;
  perfil?: { nome: string };
}

interface Denuncia {
  id: string;
  motivo: string;
  descricao: string | null;
  status: string;
  created_at: string;
  post_id: string | null;
  comentario_id: string | null;
}

interface Grupo {
  id: string;
  nome: string;
  descricao: string | null;
  membros_count: number;
  privado: boolean;
  created_at: string;
}

const AdminComunidade = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [{ data: postsData }, { data: denunciasData }, { data: gruposData }] = await Promise.all([
        supabase
          .from('comunidade_posts')
          .select('id, conteudo, tipo, created_at, user_id')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('comunidade_denuncias')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('comunidade_grupos')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      // Fetch profiles for posts
      if (postsData) {
        const userIds = [...new Set(postsData.map(p => p.user_id))];
        const { data: perfis } = await supabase
          .from('perfis')
          .select('user_id, nome')
          .in('user_id', userIds);
        
        const postsWithProfile = postsData.map(post => ({
          ...post,
          perfil: perfis?.find(p => p.user_id === post.user_id)
        }));
        setPosts(postsWithProfile);
      }

      setDenuncias(denunciasData || []);
      setGrupos(gruposData || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deletePost = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    try {
      const { error } = await supabase.from('comunidade_posts').delete().eq('id', id);
      if (error) throw error;
      toast.success('Post excluído');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const resolveDenuncia = async (id: string) => {
    try {
      const { error } = await supabase
        .from('comunidade_denuncias')
        .update({ status: 'resolvida' })
        .eq('id', id);
      if (error) throw error;
      toast.success('Denúncia resolvida');
      fetchData();
    } catch (error) {
      toast.error('Erro ao resolver');
    }
  };

  const deleteGrupo = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este grupo?')) return;
    try {
      const { error } = await supabase.from('comunidade_grupos').delete().eq('id', id);
      if (error) throw error;
      toast.success('Grupo excluído');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  if (loading) return <LoadingSkeleton />;

  const pendingDenuncias = denuncias.filter(d => d.status === 'pendente');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gerenciar Comunidade</h1>
        <p className="text-muted-foreground">Modere conteúdo da comunidade</p>
      </div>

      <div className="flex gap-4">
        <Badge variant="outline" className="py-2 px-4">
          <MessageSquare className="h-4 w-4 mr-2" />
          {posts.length} posts
        </Badge>
        <Badge variant={pendingDenuncias.length > 0 ? "destructive" : "outline"} className="py-2 px-4">
          <AlertTriangle className="h-4 w-4 mr-2" />
          {pendingDenuncias.length} denúncias pendentes
        </Badge>
        <Badge variant="outline" className="py-2 px-4">
          <Users className="h-4 w-4 mr-2" />
          {grupos.length} grupos
        </Badge>
      </div>

      <Tabs defaultValue="denuncias">
        <TabsList>
          <TabsTrigger value="denuncias">
            Denúncias ({pendingDenuncias.length})
          </TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="grupos">Grupos</TabsTrigger>
        </TabsList>

        <TabsContent value="denuncias" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Denúncias Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingDenuncias.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma denúncia pendente 🎉
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingDenuncias.map((denuncia) => (
                    <div key={denuncia.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge variant="destructive">{denuncia.motivo}</Badge>
                          <p className="mt-2 text-sm">{denuncia.descricao || 'Sem descrição'}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(denuncia.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {denuncia.post_id && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/comunidade/${denuncia.post_id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                Ver Post
                              </Link>
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => resolveDenuncia(denuncia.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolver
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Posts Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {posts.map((post) => (
                  <div key={post.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{post.perfil?.nome || 'Usuária'}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {post.conteudo.substring(0, 100)}...
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary">{post.tipo}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/comunidade/${post.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deletePost(post.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grupos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Grupos da Comunidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {grupos.map((grupo) => (
                  <div key={grupo.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{grupo.nome}</p>
                      <p className="text-sm text-muted-foreground">{grupo.descricao}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary">{grupo.membros_count} membros</Badge>
                        {grupo.privado && <Badge variant="outline">Privado</Badge>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteGrupo(grupo.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminComunidade;

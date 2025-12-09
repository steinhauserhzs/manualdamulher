import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PostCard } from "@/components/comunidade/PostCard";
import { FollowButton } from "@/components/comunidade/FollowButton";
import { UserBadges } from "@/components/comunidade/UserBadges";
import { ArrowLeft, MapPin, Instagram, Globe, Users, Award } from "lucide-react";
import { toast } from "sonner";

interface Perfil {
  nome: string;
  avatar_url: string | null;
  bio: string | null;
  cidade: string | null;
  estado: string | null;
  instagram: string | null;
  website: string | null;
  visibilidade_perfil: string | null;
  user_id: string;
}

interface Post {
  id: string;
  titulo: string | null;
  conteudo: string;
  tipo: string;
  imagem_url: string | null;
  tags: string[] | null;
  created_at: string;
  likes_count: number;
  comentarios_count: number;
  user_id: string;
  perfis: {
    nome: string;
    avatar_url: string | null;
  };
  comunidade_enquetes: Array<{
    id: string;
    opcoes: any;
    multipla_escolha: boolean;
    data_fim: string | null;
  }> | null;
}

export default function PerfilPublico() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [seguidoresCount, setSeguidoresCount] = useState(0);
  const [seguindoCount, setSeguindoCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      carregarPerfil();
      carregarPosts();
      carregarEstatisticas();
    }
  }, [userId]);

  const carregarPerfil = async () => {
    try {
      const { data, error } = await supabase
        .from("perfis")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      if (data.visibilidade_perfil === "privado") {
        toast.error("Este perfil é privado");
        navigate("/comunidade");
        return;
      }

      setPerfil(data);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      toast.error("Erro ao carregar perfil");
      navigate("/comunidade");
    }
  };

  const carregarPosts = async () => {
    try {
      const { data: postsData, error } = await supabase
        .from("comunidade_posts")
        .select(`
          *,
          comunidade_enquetes(id, opcoes, multipla_escolha, data_fim)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Buscar perfis separadamente
      const { data: perfilData } = await supabase
        .from("perfis")
        .select("nome, avatar_url, user_id")
        .eq("user_id", userId)
        .single();

      const postsComPerfil = (postsData || []).map(post => ({
        ...post,
        perfis: {
          nome: perfilData?.nome || "Usuária",
          avatar_url: perfilData?.avatar_url || null,
        }
      }));

      setPosts(postsComPerfil);
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
      toast.error("Erro ao carregar posts");
    } finally {
      setIsLoading(false);
    }
  };

  const carregarEstatisticas = async () => {
    try {
      const { count: seguidores } = await supabase
        .from("comunidade_seguidores")
        .select("*", { count: "exact", head: true })
        .eq("seguindo_id", userId);

      const { count: seguindo } = await supabase
        .from("comunidade_seguidores")
        .select("*", { count: "exact", head: true })
        .eq("seguidor_id", userId);

      setSeguidoresCount(seguidores || 0);
      setSeguindoCount(seguindo || 0);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  if (isLoading || !perfil) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/comunidade")}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <Card className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={perfil.avatar_url || undefined} />
            <AvatarFallback className="text-2xl">
              {perfil.nome.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-2xl font-bold">{perfil.nome}</h1>
            {perfil.bio && (
              <p className="text-muted-foreground mt-2">{perfil.bio}</p>
            )}
            <div className="mt-3">
              <UserBadges userId={userId!} showAll />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm">
            <div>
              <span className="font-bold">{posts.length}</span>{" "}
              <span className="text-muted-foreground">posts</span>
            </div>
            <div>
              <span className="font-bold">{seguidoresCount}</span>{" "}
              <span className="text-muted-foreground">seguidoras</span>
            </div>
            <div>
              <span className="font-bold">{seguindoCount}</span>{" "}
              <span className="text-muted-foreground">seguindo</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center text-sm text-muted-foreground">
            {perfil.cidade && perfil.estado && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {perfil.cidade}, {perfil.estado}
              </div>
            )}
            {perfil.instagram && (
              <a
                href={`https://instagram.com/${perfil.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-primary"
              >
                <Instagram className="h-4 w-4" />
                {perfil.instagram}
              </a>
            )}
            {perfil.website && (
              <a
                href={perfil.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-primary"
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}
          </div>

          <FollowButton userId={userId!} onFollowChange={carregarEstatisticas} />
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Posts de {perfil.nome}
        </h2>

        {posts.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            Esta usuária ainda não publicou nada.
          </Card>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={carregarPosts} />
          ))
        )}
      </div>
    </div>
  );
}

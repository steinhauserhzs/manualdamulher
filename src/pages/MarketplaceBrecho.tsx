import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Search, Filter } from "lucide-react";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { AnuncioCard } from "@/components/marketplace/AnuncioCard";
import { CriarAnuncioDialog } from "@/components/marketplace/CriarAnuncioDialog";

const categorias = [
  { value: "todas", label: "Todas as categorias" },
  { value: "roupas", label: "Roupas" },
  { value: "calcados", label: "Calçados" },
  { value: "acessorios", label: "Acessórios" },
  { value: "bolsas", label: "Bolsas" },
  { value: "eletronicos", label: "Eletrônicos" },
  { value: "decoracao", label: "Decoração" },
  { value: "livros", label: "Livros" },
  { value: "outros", label: "Outros" }
];

const condicoes = [
  { value: "todas", label: "Todas as condições" },
  { value: "novo", label: "Novo" },
  { value: "usado_otimo", label: "Usado - Ótimo" },
  { value: "usado_bom", label: "Usado - Bom" },
  { value: "usado_regular", label: "Usado - Regular" }
];

interface Anuncio {
  id: string;
  user_id: string;
  titulo: string;
  descricao: string | null;
  preco: number;
  categoria: string;
  condicao: string;
  imagens: string[];
  created_at: string;
  perfil?: {
    nome: string;
    avatar_url: string | null;
  };
}

const MarketplaceBrecho = () => {
  const { toast } = useToast();
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [condicaoFiltro, setCondicaoFiltro] = useState("todas");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  const fetchAnuncios = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("marketplace_anuncios")
        .select("*")
        .eq("status", "ativo")
        .order("created_at", { ascending: false });

      if (categoriaFiltro !== "todas") {
        query = query.eq("categoria", categoriaFiltro);
      }
      if (condicaoFiltro !== "todas") {
        query = query.eq("condicao", condicaoFiltro);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch user profiles
      const userIds = [...new Set((data || []).map(a => a.user_id))];
      const { data: perfis } = await supabase
        .from("perfis")
        .select("user_id, nome, avatar_url")
        .in("user_id", userIds);

      const anunciosComPerfil = (data || []).map(anuncio => ({
        ...anuncio,
        perfil: perfis?.find(p => p.user_id === anuncio.user_id)
      }));

      setAnuncios(anunciosComPerfil);
    } catch (error) {
      console.error("Erro ao carregar anúncios:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os anúncios.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnuncios();
  }, [categoriaFiltro, condicaoFiltro]);

  const filteredAnuncios = anuncios.filter(anuncio =>
    anuncio.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    anuncio.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-4 pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/marketplace">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">👗 Brechó</h1>
            <p className="text-sm text-muted-foreground">Compre e venda itens seminovos</p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar anúncios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={condicaoFiltro} onValueChange={setCondicaoFiltro}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Condição" />
              </SelectTrigger>
              <SelectContent>
                {condicoes.map(cond => (
                  <SelectItem key={cond.value} value={cond.value}>{cond.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Anúncio
                </Button>
              </DialogTrigger>
              <CriarAnuncioDialog 
                onClose={() => setDialogOpen(false)} 
                onSuccess={() => {
                  setDialogOpen(false);
                  fetchAnuncios();
                }}
              />
            </Dialog>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : filteredAnuncios.length === 0 ? (
          <EmptyState
            icon="shopping"
            title="Nenhum anúncio encontrado"
            description="Seja a primeira a criar um anúncio no brechó!"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAnuncios.map(anuncio => (
              <AnuncioCard 
                key={anuncio.id} 
                anuncio={anuncio} 
                currentUserId={userId}
                onUpdate={fetchAnuncios}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceBrecho;

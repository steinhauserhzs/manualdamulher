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
import { ServicoCard } from "@/components/marketplace/ServicoCard";
import { CriarServicoDialog } from "@/components/marketplace/CriarServicoDialog";

const categorias = [
  { value: "todas", label: "Todas as categorias" },
  { value: "beleza", label: "Beleza e Estética" },
  { value: "saude", label: "Saúde e Bem-estar" },
  { value: "educacao", label: "Educação e Aulas" },
  { value: "tecnologia", label: "Tecnologia" },
  { value: "casa", label: "Serviços Domésticos" },
  { value: "moda", label: "Moda e Costura" },
  { value: "alimentacao", label: "Alimentação" },
  { value: "eventos", label: "Eventos e Festas" },
  { value: "consultoria", label: "Consultoria" },
  { value: "outros", label: "Outros" }
];

interface Servico {
  id: string;
  user_id: string;
  titulo: string;
  descricao: string | null;
  categoria: string;
  preco_minimo: number | null;
  preco_maximo: number | null;
  tipo_preco: string;
  imagens: string[];
  contato_whatsapp: string | null;
  contato_instagram: string | null;
  created_at: string;
  perfil?: {
    nome: string;
    avatar_url: string | null;
  };
}

const MarketplaceServicos = () => {
  const { toast } = useToast();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  const fetchServicos = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("marketplace_servicos")
        .select("*")
        .eq("status", "ativo")
        .order("created_at", { ascending: false });

      if (categoriaFiltro !== "todas") {
        query = query.eq("categoria", categoriaFiltro);
      }

      const { data, error } = await query;

      if (error) throw error;

      const userIds = [...new Set((data || []).map(s => s.user_id))];
      const { data: perfis } = await supabase
        .from("perfis")
        .select("user_id, nome, avatar_url")
        .in("user_id", userIds);

      const servicosComPerfil = (data || []).map(servico => ({
        ...servico,
        perfil: perfis?.find(p => p.user_id === servico.user_id)
      }));

      setServicos(servicosComPerfil);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os serviços.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicos();
  }, [categoriaFiltro]);

  const filteredServicos = servicos.filter(servico =>
    servico.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    servico.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">💼 Serviços</h1>
            <p className="text-sm text-muted-foreground">Encontre ou ofereça serviços</p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar serviços..."
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

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Oferecer Serviço
                </Button>
              </DialogTrigger>
              <CriarServicoDialog 
                onClose={() => setDialogOpen(false)} 
                onSuccess={() => {
                  setDialogOpen(false);
                  fetchServicos();
                }}
              />
            </Dialog>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : filteredServicos.length === 0 ? (
          <EmptyState
            icon="briefcase"
            title="Nenhum serviço encontrado"
            description="Seja a primeira a oferecer seus serviços!"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServicos.map(servico => (
              <ServicoCard 
                key={servico.id} 
                servico={servico} 
                currentUserId={userId}
                onUpdate={fetchServicos}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceServicos;

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
import { ParceiroCard } from "@/components/marketplace/ParceiroCard";
import { CriarParceiroDialog } from "@/components/marketplace/CriarParceiroDialog";

const categorias = [
  { value: "todas", label: "Todas as categorias" },
  { value: "alimentacao", label: "Alimentação" },
  { value: "beleza", label: "Beleza e Estética" },
  { value: "moda", label: "Moda e Acessórios" },
  { value: "saude", label: "Saúde e Bem-estar" },
  { value: "educacao", label: "Educação" },
  { value: "servicos", label: "Serviços Gerais" },
  { value: "pets", label: "Pets" },
  { value: "casa", label: "Casa e Decoração" },
  { value: "outros", label: "Outros" }
];

interface Parceiro {
  id: string;
  user_id: string;
  nome_estabelecimento: string;
  descricao: string | null;
  categoria: string;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  telefone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  website: string | null;
  logo_url: string | null;
  verificado: boolean;
  created_at: string;
}

const MarketplaceParceiros = () => {
  const { toast } = useToast();
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
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

  const fetchParceiros = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("marketplace_parceiros")
        .select("*")
        .eq("status", "ativo")
        .order("verificado", { ascending: false })
        .order("created_at", { ascending: false });

      if (categoriaFiltro !== "todas") {
        query = query.eq("categoria", categoriaFiltro);
      }

      const { data, error } = await query;

      if (error) throw error;
      setParceiros(data || []);
    } catch (error) {
      console.error("Erro ao carregar parceiros:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os parceiros.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParceiros();
  }, [categoriaFiltro]);

  const filteredParceiros = parceiros.filter(parceiro =>
    parceiro.nome_estabelecimento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parceiro.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">🏪 Parceiros</h1>
            <p className="text-sm text-muted-foreground">Estabelecimentos da comunidade</p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar parceiros..."
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
                  Cadastrar Parceiro
                </Button>
              </DialogTrigger>
              <CriarParceiroDialog 
                onClose={() => setDialogOpen(false)} 
                onSuccess={() => {
                  setDialogOpen(false);
                  fetchParceiros();
                }}
              />
            </Dialog>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : filteredParceiros.length === 0 ? (
          <EmptyState
            icon="store"
            title="Nenhum parceiro encontrado"
            description="Seja a primeira a cadastrar seu estabelecimento!"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParceiros.map(parceiro => (
              <ParceiroCard 
                key={parceiro.id} 
                parceiro={parceiro} 
                currentUserId={userId}
                onUpdate={fetchParceiros}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceParceiros;

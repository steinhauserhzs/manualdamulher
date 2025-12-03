import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Search, Ticket } from "lucide-react";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { CupomCard } from "@/components/marketplace/CupomCard";
import { CriarCupomDialog } from "@/components/marketplace/CriarCupomDialog";

interface Cupom {
  id: string;
  user_id: string;
  parceiro_id: string | null;
  codigo: string;
  titulo: string;
  descricao: string | null;
  tipo_desconto: string;
  valor_desconto: number;
  valor_minimo: number | null;
  data_inicio: string;
  data_fim: string | null;
  limite_uso: number | null;
  usos_atuais: number;
  created_at: string;
  parceiro?: {
    nome_estabelecimento: string;
    logo_url: string | null;
  };
}

const MarketplaceCupons = () => {
  const { toast } = useToast();
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userParceiros, setUserParceiros] = useState<any[]>([]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      
      if (user) {
        const { data: parceiros } = await supabase
          .from("marketplace_parceiros")
          .select("id, nome_estabelecimento")
          .eq("user_id", user.id)
          .eq("status", "ativo");
        setUserParceiros(parceiros || []);
      }
    };
    getUser();
  }, []);

  const fetchCupons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("marketplace_cupons")
        .select(`
          *,
          parceiro:marketplace_parceiros(nome_estabelecimento, logo_url)
        `)
        .eq("status", "ativo")
        .or(`data_fim.is.null,data_fim.gte.${new Date().toISOString()}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCupons(data || []);
    } catch (error) {
      console.error("Erro ao carregar cupons:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os cupons.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCupons();
  }, []);

  const filteredCupons = cupons.filter(cupom =>
    cupom.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cupom.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cupom.parceiro?.nome_estabelecimento?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">🎟️ Cupons</h1>
            <p className="text-sm text-muted-foreground">Descontos exclusivos para a comunidade</p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {userParceiros.length > 0 && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Cupom
                  </Button>
                </DialogTrigger>
                <CriarCupomDialog 
                  parceiros={userParceiros}
                  onClose={() => setDialogOpen(false)} 
                  onSuccess={() => {
                    setDialogOpen(false);
                    fetchCupons();
                  }}
                />
              </Dialog>
            )}
          </div>

          {userParceiros.length === 0 && userId && (
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              💡 Para criar cupons, primeiro <Link to="/marketplace/parceiros" className="text-primary underline">cadastre seu estabelecimento como parceiro</Link>.
            </p>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : filteredCupons.length === 0 ? (
          <EmptyState
            icon="ticket"
            title="Nenhum cupom encontrado"
            description="Fique de olho! Novos cupons podem aparecer a qualquer momento."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCupons.map(cupom => (
              <CupomCard 
                key={cupom.id} 
                cupom={cupom}
                currentUserId={userId}
                onUpdate={fetchCupons}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceCupons;

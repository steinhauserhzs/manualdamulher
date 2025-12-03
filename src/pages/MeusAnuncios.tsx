import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ShoppingBag, Briefcase, Store, Ticket as TicketIcon } from "lucide-react";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { AnuncioCard } from "@/components/marketplace/AnuncioCard";
import { ServicoCard } from "@/components/marketplace/ServicoCard";
import { ParceiroCard } from "@/components/marketplace/ParceiroCard";
import { CupomCard } from "@/components/marketplace/CupomCard";

const MeusAnuncios = () => {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [anuncios, setAnuncios] = useState<any[]>([]);
  const [servicos, setServicos] = useState<any[]>([]);
  const [parceiros, setParceiros] = useState<any[]>([]);
  const [cupons, setCupons] = useState<any[]>([]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      if (user) {
        fetchAll(user.id);
      }
    };
    getUser();
  }, []);

  const fetchAll = async (uid: string) => {
    try {
      setLoading(true);
      const [anunciosRes, servicosRes, parceirosRes, cuponsRes] = await Promise.all([
        supabase.from("marketplace_anuncios").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
        supabase.from("marketplace_servicos").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
        supabase.from("marketplace_parceiros").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
        supabase.from("marketplace_cupons").select("*, parceiro:marketplace_parceiros(nome_estabelecimento, logo_url)").eq("user_id", uid).order("created_at", { ascending: false })
      ]);

      setAnuncios(anunciosRes.data || []);
      setServicos(servicosRes.data || []);
      setParceiros(parceirosRes.data || []);
      setCupons(cuponsRes.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus anúncios.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    if (userId) fetchAll(userId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 pb-24 md:pb-8">
        <LoadingSkeleton />
      </div>
    );
  }

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
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">📦 Meus Anúncios</h1>
            <p className="text-sm text-muted-foreground">Gerencie seus itens no marketplace</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="anuncios" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="anuncios" className="flex flex-col sm:flex-row gap-1 py-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Brechó ({anuncios.length})</span>
            </TabsTrigger>
            <TabsTrigger value="servicos" className="flex flex-col sm:flex-row gap-1 py-2">
              <Briefcase className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Serviços ({servicos.length})</span>
            </TabsTrigger>
            <TabsTrigger value="parceiros" className="flex flex-col sm:flex-row gap-1 py-2">
              <Store className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Parceiros ({parceiros.length})</span>
            </TabsTrigger>
            <TabsTrigger value="cupons" className="flex flex-col sm:flex-row gap-1 py-2">
              <TicketIcon className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Cupons ({cupons.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="anuncios" className="mt-4">
            {anuncios.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="Nenhum anúncio"
                description="Você ainda não criou anúncios no brechó."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {anuncios.map(anuncio => (
                  <AnuncioCard key={anuncio.id} anuncio={anuncio} currentUserId={userId} onUpdate={refetch} isOwner />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="servicos" className="mt-4">
            {servicos.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="Nenhum serviço"
                description="Você ainda não ofereceu serviços."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {servicos.map(servico => (
                  <ServicoCard key={servico.id} servico={servico} currentUserId={userId} onUpdate={refetch} isOwner />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="parceiros" className="mt-4">
            {parceiros.length === 0 ? (
              <EmptyState
                icon={Store}
                title="Nenhum parceiro"
                description="Você ainda não cadastrou estabelecimentos."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {parceiros.map(parceiro => (
                  <ParceiroCard key={parceiro.id} parceiro={parceiro} currentUserId={userId} onUpdate={refetch} isOwner />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cupons" className="mt-4">
            {cupons.length === 0 ? (
              <EmptyState
                icon={TicketIcon}
                title="Nenhum cupom"
                description="Você ainda não criou cupons de desconto."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cupons.map(cupom => (
                  <CupomCard key={cupom.id} cupom={cupom} currentUserId={userId} onUpdate={refetch} isOwner />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MeusAnuncios;

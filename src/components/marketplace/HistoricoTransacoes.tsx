import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, ShoppingBag, MessageCircle, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

interface Conversa {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  anuncio_id: string | null;
  servico_id: string | null;
  comprador_id: string;
  vendedor_id: string;
  outro_usuario?: {
    nome: string;
    avatar_url: string | null;
  };
  anuncio?: {
    titulo: string;
    preco: number;
  };
  servico?: {
    titulo: string;
  };
  tipo: 'compra' | 'venda';
}

export const HistoricoTransacoes = () => {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("todas");

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data, error } = await supabase
        .from("marketplace_conversas")
        .select("*")
        .or(`comprador_id.eq.${user.id},vendedor_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar histórico:", error);
        setLoading(false);
        return;
      }

      // Fetch related data
      const conversasComDados = await Promise.all((data || []).map(async (conversa) => {
        const outroUsuarioId = conversa.comprador_id === user.id 
          ? conversa.vendedor_id 
          : conversa.comprador_id;

        const { data: perfil } = await supabase
          .from("perfis")
          .select("nome, avatar_url")
          .eq("user_id", outroUsuarioId)
          .single();

        let anuncio = null;
        let servico = null;

        if (conversa.anuncio_id) {
          const { data } = await supabase
            .from("marketplace_anuncios")
            .select("titulo, preco")
            .eq("id", conversa.anuncio_id)
            .single();
          anuncio = data;
        }

        if (conversa.servico_id) {
          const { data } = await supabase
            .from("marketplace_servicos")
            .select("titulo")
            .eq("id", conversa.servico_id)
            .single();
          servico = data;
        }

        return {
          ...conversa,
          outro_usuario: perfil,
          anuncio,
          servico,
          tipo: conversa.comprador_id === user.id ? 'compra' : 'venda'
        } as Conversa;
      }));

      setConversas(conversasComDados);
      setLoading(false);
    };

    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      ativa: { label: "Em andamento", variant: "default" },
      concluida: { label: "Concluída", variant: "secondary" },
      cancelada: { label: "Cancelada", variant: "destructive" }
    };
    const statusInfo = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const filteredConversas = conversas.filter(c => {
    if (activeTab === "compras") return c.tipo === "compra";
    if (activeTab === "vendas") return c.tipo === "venda";
    return true;
  });

  if (loading) return <LoadingSkeleton />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Histórico de Transações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="compras" className="flex items-center gap-1">
              <ArrowDownLeft className="h-3 w-3" />
              Compras
            </TabsTrigger>
            <TabsTrigger value="vendas" className="flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              Vendas
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredConversas.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="Nenhuma transação"
                description="Você ainda não tem transações no marketplace"
              />
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {filteredConversas.map((conversa) => (
                    <div
                      key={conversa.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversa.outro_usuario?.avatar_url || undefined} />
                        <AvatarFallback>
                          {conversa.outro_usuario?.nome?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {conversa.anuncio?.titulo || conversa.servico?.titulo || "Item"}
                          </span>
                          {conversa.tipo === "compra" ? (
                            <ArrowDownLeft className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{conversa.outro_usuario?.nome}</span>
                          <span>•</span>
                          <span>
                            {format(new Date(conversa.updated_at), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        {conversa.anuncio?.preco && (
                          <span className="text-sm font-medium text-primary">
                            R$ {conversa.anuncio.preco.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {getStatusBadge(conversa.status || "ativa")}
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

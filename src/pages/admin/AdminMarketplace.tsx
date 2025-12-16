import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ShoppingBag, Briefcase, Building, Ticket, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const AdminMarketplace = () => {
  const [anuncios, setAnuncios] = useState<any[]>([]);
  const [servicos, setServicos] = useState<any[]>([]);
  const [parceiros, setParceiros] = useState<any[]>([]);
  const [cupons, setCupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [
        { data: anunciosData },
        { data: servicosData },
        { data: parceirosData },
        { data: cuponsData }
      ] = await Promise.all([
        supabase.from('marketplace_anuncios').select('*').order('created_at', { ascending: false }),
        supabase.from('marketplace_servicos').select('*').order('created_at', { ascending: false }),
        supabase.from('marketplace_parceiros').select('*').order('created_at', { ascending: false }),
        supabase.from('marketplace_cupons').select('*').order('created_at', { ascending: false })
      ]);

      setAnuncios(anunciosData || []);
      setServicos(servicosData || []);
      setParceiros(parceirosData || []);
      setCupons(cuponsData || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteAnuncio = async (id: string) => {
    if (!confirm('Excluir anúncio?')) return;
    try {
      await supabase.from('marketplace_anuncios').delete().eq('id', id);
      toast.success('Anúncio excluído');
      fetchData();
    } catch (error) {
      toast.error('Erro');
    }
  };

  const deleteServico = async (id: string) => {
    if (!confirm('Excluir serviço?')) return;
    try {
      await supabase.from('marketplace_servicos').delete().eq('id', id);
      toast.success('Serviço excluído');
      fetchData();
    } catch (error) {
      toast.error('Erro');
    }
  };

  const toggleParceiroVerificado = async (id: string, verificado: boolean) => {
    try {
      await supabase
        .from('marketplace_parceiros')
        .update({ verificado: !verificado })
        .eq('id', id);
      toast.success(verificado ? 'Verificação removida' : 'Parceiro verificado!');
      fetchData();
    } catch (error) {
      toast.error('Erro');
    }
  };

  const deleteCupom = async (id: string) => {
    if (!confirm('Excluir cupom?')) return;
    try {
      await supabase.from('marketplace_cupons').delete().eq('id', id);
      toast.success('Cupom excluído');
      fetchData();
    } catch (error) {
      toast.error('Erro');
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gerenciar Marketplace</h1>
        <p className="text-muted-foreground">Gerencie anúncios, serviços, parceiros e cupons</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Badge variant="outline" className="py-2 px-4">
          <ShoppingBag className="h-4 w-4 mr-2" />
          {anuncios.length} anúncios
        </Badge>
        <Badge variant="outline" className="py-2 px-4">
          <Briefcase className="h-4 w-4 mr-2" />
          {servicos.length} serviços
        </Badge>
        <Badge variant="outline" className="py-2 px-4">
          <Building className="h-4 w-4 mr-2" />
          {parceiros.length} parceiros
        </Badge>
        <Badge variant="outline" className="py-2 px-4">
          <Ticket className="h-4 w-4 mr-2" />
          {cupons.length} cupons
        </Badge>
      </div>

      <Tabs defaultValue="anuncios">
        <TabsList className="flex-wrap">
          <TabsTrigger value="anuncios">Anúncios</TabsTrigger>
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
          <TabsTrigger value="parceiros">Parceiros</TabsTrigger>
          <TabsTrigger value="cupons">Cupons</TabsTrigger>
        </TabsList>

        <TabsContent value="anuncios" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Anúncios do Brechó</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {anuncios.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        R$ {item.preco?.toFixed(2)} • {item.categoria}
                      </p>
                      <Badge variant={item.status === 'ativo' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteAnuncio(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="servicos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Serviços Oferecidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {servicos.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.titulo}</p>
                      <p className="text-sm text-muted-foreground">{item.categoria}</p>
                      <Badge variant={item.status === 'ativo' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteServico(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parceiros" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Parceiros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {parceiros.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.nome_estabelecimento}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.categoria} • {item.cidade}, {item.estado}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={item.status === 'ativo' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                        {item.verificado && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            ✓ Verificado
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleParceiroVerificado(item.id, item.verificado)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {item.verificado ? 'Remover Verificação' : 'Verificar'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cupons" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Cupons de Desconto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cupons.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.titulo}</p>
                      <p className="text-sm font-mono bg-muted px-2 py-1 rounded inline-block">
                        {item.codigo}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.tipo_desconto === 'percentual' 
                          ? `${item.valor_desconto}% de desconto` 
                          : `R$ ${item.valor_desconto} de desconto`}
                      </p>
                      <Badge variant={item.status === 'ativo' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteCupom(item.id)}>
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

export default AdminMarketplace;

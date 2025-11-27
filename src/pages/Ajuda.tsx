import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

interface ArtigoAjuda {
  id: string;
  categoria: string;
  titulo: string;
  conteudo: string;
  helpful_yes: number;
  helpful_no: number;
}

const Ajuda = () => {
  const [user, setUser] = useState<any>(null);
  const [artigos, setArtigos] = useState<ArtigoAjuda[]>([]);
  const [filteredArtigos, setFilteredArtigos] = useState<ArtigoAjuda[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      carregarArtigos();
    };
    checkAuth();
  }, [navigate]);

  const carregarArtigos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ajuda_artigos')
      .select('*')
      .order('ordem', { ascending: true });

    if (error) {
      toast({
        title: "Erro ao carregar artigos",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setArtigos(data || []);
      setFilteredArtigos(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (search) {
      const filtered = artigos.filter(artigo =>
        artigo.titulo.toLowerCase().includes(search.toLowerCase()) ||
        artigo.conteudo.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredArtigos(filtered);
    } else {
      setFilteredArtigos(artigos);
    }
  }, [search, artigos]);

  const handleHelpful = async (artigoId: string, isHelpful: boolean) => {
    const field = isHelpful ? 'helpful_yes' : 'helpful_no';
    const artigo = artigos.find(a => a.id === artigoId);
    if (!artigo) return;

    const currentValue = isHelpful ? artigo.helpful_yes : artigo.helpful_no;

    const { error } = await supabase
      .from('ajuda_artigos')
      .update({ [field]: currentValue + 1 })
      .eq('id', artigoId);

    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: isHelpful ? "Obrigada pelo feedback! 💜" : "Vamos melhorar este artigo",
        description: "Seu feedback nos ajuda a melhorar.",
      });
      carregarArtigos();
    }
  };

  const categoriasAgrupadas = filteredArtigos.reduce((acc, artigo) => {
    if (!acc[artigo.categoria]) {
      acc[artigo.categoria] = [];
    }
    acc[artigo.categoria].push(artigo);
    return acc;
  }, {} as Record<string, ArtigoAjuda[]>);

  const categoriaNomes: Record<string, string> = {
    'primeiros-passos': '🌱 Primeiros Passos',
    'casa': '🏠 Casa',
    'saude': '💜 Saúde',
    'bem-estar': '✨ Bem-estar',
    'financas': '💰 Finanças',
    'problemas-comuns': '🔧 Problemas Comuns',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <Breadcrumbs items={[{ label: "Ajuda" }]} />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Central de Ajuda ❓</h1>
          <p className="text-muted-foreground">Encontre respostas para suas dúvidas</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar na ajuda..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Precisa de mais ajuda?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Não encontrou o que procurava? Nossa equipe está aqui para ajudar!
            </p>
            <Button variant="outline">
              Entrar em Contato (em breve)
            </Button>
          </CardContent>
        </Card>

        <Accordion type="multiple" className="space-y-4">
          {Object.entries(categoriasAgrupadas).map(([categoria, artigosCategoria]) => (
            <AccordionItem key={categoria} value={categoria} className="border rounded-lg">
              <AccordionTrigger className="px-6 hover:no-underline">
                <span className="text-lg font-semibold">{categoriaNomes[categoria] || categoria}</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-4">
                  {artigosCategoria.map((artigo) => (
                    <Card key={artigo.id}>
                      <CardHeader>
                        <CardTitle className="text-base">{artigo.titulo}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-line mb-4">
                          {artigo.conteudo}
                        </p>
                        <div className="flex items-center gap-2 pt-4 border-t">
                          <span className="text-sm text-muted-foreground">Isso ajudou?</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleHelpful(artigo.id, true)}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Sim ({artigo.helpful_yes})
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleHelpful(artigo.id, false)}
                          >
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            Não ({artigo.helpful_no})
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default Ajuda;

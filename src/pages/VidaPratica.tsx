import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Search, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Dica {
  id: string;
  categoria: string;
  titulo: string;
  conteudo: string;
  checklist: string[] | null;
  destacada: boolean;
  isFavorita?: boolean;
}

const VidaPratica = () => {
  const [user, setUser] = useState<any>(null);
  const [dicas, setDicas] = useState<Dica[]>([]);
  const [filteredDicas, setFilteredDicas] = useState<Dica[]>([]);
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
      carregarDicas(session.user.id);
    };
    checkAuth();
  }, [navigate]);

  const carregarDicas = async (userId: string) => {
    setLoading(true);
    const { data: dicasData, error } = await supabase
      .from('dicas_praticas')
      .select('*')
      .order('ordem', { ascending: true });

    if (error) {
      toast({
        title: "Erro ao carregar dicas",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { data: favoritas } = await supabase
      .from('dicas_favoritas')
      .select('dica_id')
      .eq('user_id', userId);

    const favoritasSet = new Set(favoritas?.map(f => f.dica_id) || []);

    const dicasComFavoritas = (dicasData || []).map(dica => ({
      ...dica,
      checklist: dica.checklist ? (Array.isArray(dica.checklist) ? dica.checklist : []) as string[] : null,
      isFavorita: favoritasSet.has(dica.id),
    }));

    setDicas(dicasComFavoritas);
    setFilteredDicas(dicasComFavoritas);
    setLoading(false);
  };

  useEffect(() => {
    if (search) {
      const filtered = dicas.filter(dica =>
        dica.titulo.toLowerCase().includes(search.toLowerCase()) ||
        dica.conteudo.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredDicas(filtered);
    } else {
      setFilteredDicas(dicas);
    }
  }, [search, dicas]);

  const toggleFavorita = async (dicaId: string) => {
    if (!user) return;

    const dica = dicas.find(d => d.id === dicaId);
    if (!dica) return;

    if (dica.isFavorita) {
      const { error } = await supabase
        .from('dicas_favoritas')
        .delete()
        .eq('user_id', user.id)
        .eq('dica_id', dicaId);

      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    } else {
      const { error } = await supabase
        .from('dicas_favoritas')
        .insert({
          user_id: user.id,
          dica_id: dicaId,
        });

      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    }

    setDicas(dicas.map(d =>
      d.id === dicaId ? { ...d, isFavorita: !d.isFavorita } : d
    ));
  };

  const categoriasAgrupadas = filteredDicas.reduce((acc, dica) => {
    if (!acc[dica.categoria]) {
      acc[dica.categoria] = [];
    }
    acc[dica.categoria].push(dica);
    return acc;
  }, {} as Record<string, Dica[]>);

  const categoriaNomes: Record<string, string> = {
    'documentos': 'Documentos Essenciais 📄',
    'planejamento': 'Planejamento e Organização 📅',
    'burocracias': 'Burocracias do Dia a Dia 📋',
    'filhos': 'Mães Solo 💜',
    'direitos': 'Seus Direitos ⚖️',
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
        <Breadcrumbs items={[{ label: "Vida Prática" }]} />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Vida Prática 💡</h1>
          <p className="text-muted-foreground">Dicas e checklists para o dia a dia</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar dicas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Accordion type="multiple" className="space-y-4">
          {Object.entries(categoriasAgrupadas).map(([categoria, dicasCategoria]) => (
            <AccordionItem key={categoria} value={categoria} className="border rounded-lg">
              <AccordionTrigger className="px-6 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <span className="text-lg font-semibold">{categoriaNomes[categoria] || categoria}</span>
                  <Badge variant="secondary">{dicasCategoria.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-4">
                  {dicasCategoria.map((dica) => (
                    <Card key={dica.id} className={dica.destacada ? "border-primary" : ""}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              {dica.titulo}
                              {dica.destacada && <Badge variant="default">Destaque</Badge>}
                            </CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFavorita(dica.id)}
                          >
                            <Star className={`h-5 w-5 ${dica.isFavorita ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{dica.conteudo}</p>
                        {dica.checklist && dica.checklist.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold">Checklist:</p>
                            <ul className="space-y-1">
                              {dica.checklist.map((item, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
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

export default VidaPratica;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Recurso {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  url_arquivo: string;
  exige_login: boolean;
}

const Biblioteca = () => {
  const [user, setUser] = useState<any>(null);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [filteredRecursos, setFilteredRecursos] = useState<Recurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("all");

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
      carregarRecursos();
    };
    checkAuth();
  }, [navigate]);

  const carregarRecursos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('recursos_digitais')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar recursos",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setRecursos(data || []);
      setFilteredRecursos(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    let filtered = recursos;

    if (search) {
      filtered = filtered.filter(recurso =>
        recurso.titulo.toLowerCase().includes(search.toLowerCase()) ||
        recurso.descricao?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (tipoFilter !== "all") {
      filtered = filtered.filter(recurso => recurso.tipo === tipoFilter);
    }

    setFilteredRecursos(filtered);
  }, [search, tipoFilter, recursos]);

  const handleDownload = (recurso: Recurso) => {
    if (recurso.url_arquivo) {
      window.open(recurso.url_arquivo, '_blank');
    }
  };

  const tipoNomes: Record<string, string> = {
    'ebook': 'E-book',
    'pdf': 'PDF',
    'checklist': 'Checklist',
    'guia': 'Guia',
    'template': 'Template',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 md:ml-64 mb-16 md:mb-0">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:ml-64 mb-16 md:mb-0">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ label: "Biblioteca" }]} />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Biblioteca Digital 📚</h1>
          <p className="text-muted-foreground">E-books, guias e materiais gratuitos para você</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar recursos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {Object.entries(tipoNomes).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredRecursos.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum recurso encontrado"
            description={search || tipoFilter !== "all" ? "Tente ajustar seus filtros" : "Os recursos digitais aparecerão aqui"}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecursos.map((recurso) => (
              <Card key={recurso.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{recurso.titulo}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">{tipoNomes[recurso.tipo] || recurso.tipo}</Badge>
                        {recurso.exige_login && <Badge variant="outline">Login necessário</Badge>}
                      </div>
                    </div>
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {recurso.descricao || "Sem descrição"}
                  </p>
                  <Button 
                    onClick={() => handleDownload(recurso)} 
                    className="w-full"
                    disabled={!recurso.url_arquivo}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {recurso.tipo === 'ebook' ? 'Baixar E-book' : 'Baixar'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Biblioteca;

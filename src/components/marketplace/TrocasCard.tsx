import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Repeat, MapPin, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Troca {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: string;
  aceita_troca_por: string[] | null;
  imagens: string[] | null;
  localizacao: string | null;
  visualizacoes: number;
  status: string;
  user_id: string;
  created_at: string;
}

const categorias = [
  "Roupas", "Acessórios", "Eletrônicos", "Livros", "Móveis", 
  "Decoração", "Brinquedos", "Esportes", "Beleza", "Outros"
];

export const TrocasCard = () => {
  const [trocas, setTrocas] = useState<Troca[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [novaTroca, setNovaTroca] = useState({
    titulo: "",
    descricao: "",
    categoria: "",
    aceita_troca_por: "",
    localizacao: ""
  });

  useEffect(() => {
    carregarTrocas();
  }, []);

  const carregarTrocas = async () => {
    const { data, error } = await supabase
      .from("marketplace_trocas")
      .select("*")
      .eq("status", "ativo")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Erro ao carregar trocas:", error);
    } else {
      setTrocas(data || []);
    }
    setLoading(false);
  };

  const criarTroca = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Faça login para criar anúncios", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("marketplace_trocas").insert({
      user_id: user.id,
      titulo: novaTroca.titulo,
      descricao: novaTroca.descricao || null,
      categoria: novaTroca.categoria,
      aceita_troca_por: novaTroca.aceita_troca_por ? novaTroca.aceita_troca_por.split(",").map(s => s.trim()) : null,
      localizacao: novaTroca.localizacao || null
    });

    if (error) {
      toast({ title: "Erro ao criar anúncio de troca", variant: "destructive" });
      return;
    }

    toast({ title: "Anúncio de troca criado!" });
    setDialogOpen(false);
    setNovaTroca({ titulo: "", descricao: "", categoria: "", aceita_troca_por: "", localizacao: "" });
    carregarTrocas();
  };

  if (loading) {
    return (
      <Card className="gradient-card shadow-card">
        <CardContent className="p-6">
          <div className="h-48 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card shadow-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Repeat className="h-5 w-5 text-green-500" />
            Sistema de Trocas
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Anunciar Troca
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Anunciar Item para Troca</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>O que você quer trocar?</Label>
                  <Input 
                    value={novaTroca.titulo}
                    onChange={(e) => setNovaTroca(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Ex: Vestido floral tamanho M"
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={novaTroca.descricao}
                    onChange={(e) => setNovaTroca(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descreva o estado, detalhes..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select value={novaTroca.categoria} onValueChange={(v) => setNovaTroca(prev => ({ ...prev, categoria: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Aceita trocar por (separado por vírgula)</Label>
                  <Input 
                    value={novaTroca.aceita_troca_por}
                    onChange={(e) => setNovaTroca(prev => ({ ...prev, aceita_troca_por: e.target.value }))}
                    placeholder="Ex: roupas, acessórios, livros"
                  />
                </div>
                <div>
                  <Label>Localização</Label>
                  <Input 
                    value={novaTroca.localizacao}
                    onChange={(e) => setNovaTroca(prev => ({ ...prev, localizacao: e.target.value }))}
                    placeholder="Ex: São Paulo, SP"
                  />
                </div>
                <Button 
                  onClick={criarTroca} 
                  className="w-full" 
                  disabled={!novaTroca.titulo || !novaTroca.categoria}
                >
                  Publicar Anúncio
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {trocas.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            Nenhum item para troca ainda. Seja a primeira!
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {trocas.map((troca) => (
              <div key={troca.id} className="border rounded-lg p-3 hover:border-primary transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm line-clamp-1">{troca.titulo}</h4>
                  <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">
                    {troca.categoria}
                  </Badge>
                </div>
                {troca.descricao && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {troca.descricao}
                  </p>
                )}
                {troca.aceita_troca_por && troca.aceita_troca_por.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="text-xs text-muted-foreground">Aceita:</span>
                    {troca.aceita_troca_por.slice(0, 3).map((item, i) => (
                      <Badge key={i} variant="secondary" className="text-xs py-0">
                        {item}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {troca.localizacao && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {troca.localizacao}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {troca.visualizacoes || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

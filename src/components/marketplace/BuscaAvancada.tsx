import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FiltrosAvancados {
  termo: string;
  categoria: string;
  precoMin: number;
  precoMax: number;
  condicao: string;
  localizacao: string;
  ordenar: string;
}

interface BuscaAvancadaProps {
  onBuscar: (filtros: FiltrosAvancados) => void;
  categorias?: string[];
}

const condicoes = [
  { value: "todos", label: "Todas" },
  { value: "novo", label: "Novo" },
  { value: "seminovo", label: "Seminovo" },
  { value: "usado", label: "Usado" }
];

const ordenacoes = [
  { value: "recentes", label: "Mais recentes" },
  { value: "preco_asc", label: "Menor preço" },
  { value: "preco_desc", label: "Maior preço" },
  { value: "populares", label: "Mais populares" }
];

export const BuscaAvancada = ({ onBuscar, categorias = [] }: BuscaAvancadaProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosAvancados>({
    termo: "",
    categoria: "",
    precoMin: 0,
    precoMax: 1000,
    condicao: "todos",
    localizacao: "",
    ordenar: "recentes"
  });
  const [filtrosAtivos, setFiltrosAtivos] = useState<string[]>([]);

  const aplicarFiltros = () => {
    const ativos: string[] = [];
    if (filtros.termo) ativos.push(`"${filtros.termo}"`);
    if (filtros.categoria) ativos.push(filtros.categoria);
    if (filtros.precoMin > 0 || filtros.precoMax < 1000) {
      ativos.push(`R$${filtros.precoMin}-${filtros.precoMax}`);
    }
    if (filtros.condicao !== "todos") ativos.push(filtros.condicao);
    if (filtros.localizacao) ativos.push(filtros.localizacao);
    
    setFiltrosAtivos(ativos);
    onBuscar(filtros);
    setDialogOpen(false);
  };

  const limparFiltros = () => {
    const filtrosLimpos = {
      termo: "",
      categoria: "",
      precoMin: 0,
      precoMax: 1000,
      condicao: "todos",
      localizacao: "",
      ordenar: "recentes"
    };
    setFiltros(filtrosLimpos);
    setFiltrosAtivos([]);
    onBuscar(filtrosLimpos);
  };

  const removerFiltro = (filtro: string) => {
    const novosFiltrosAtivos = filtrosAtivos.filter(f => f !== filtro);
    setFiltrosAtivos(novosFiltrosAtivos);
    
    // Reset do filtro específico
    if (filtro.startsWith('"')) {
      setFiltros(prev => ({ ...prev, termo: "" }));
    } else if (filtro.startsWith("R$")) {
      setFiltros(prev => ({ ...prev, precoMin: 0, precoMax: 1000 }));
    } else if (condicoes.some(c => c.value === filtro)) {
      setFiltros(prev => ({ ...prev, condicao: "todos" }));
    } else if (categorias.includes(filtro)) {
      setFiltros(prev => ({ ...prev, categoria: "" }));
    } else {
      setFiltros(prev => ({ ...prev, localizacao: "" }));
    }
  };

  return (
    <div className="space-y-3">
      {/* Barra de busca principal */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos, serviços..."
            value={filtros.termo}
            onChange={(e) => setFiltros(prev => ({ ...prev, termo: e.target.value }))}
            className="pl-10"
            onKeyDown={(e) => e.key === "Enter" && aplicarFiltros()}
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Filtros Avançados</DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              {/* Categoria */}
              {categorias.length > 0 && (
                <div>
                  <Label>Categoria</Label>
                  <Select 
                    value={filtros.categoria} 
                    onValueChange={(v) => setFiltros(prev => ({ ...prev, categoria: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      {categorias.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Faixa de preço */}
              <div>
                <Label>Faixa de Preço: R$ {filtros.precoMin} - R$ {filtros.precoMax}</Label>
                <div className="pt-4 px-2">
                  <Slider
                    value={[filtros.precoMin, filtros.precoMax]}
                    min={0}
                    max={5000}
                    step={50}
                    onValueChange={([min, max]) => setFiltros(prev => ({ ...prev, precoMin: min, precoMax: max }))}
                  />
                </div>
              </div>

              {/* Condição */}
              <div>
                <Label>Condição</Label>
                <Select 
                  value={filtros.condicao} 
                  onValueChange={(v) => setFiltros(prev => ({ ...prev, condicao: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {condicoes.map(cond => (
                      <SelectItem key={cond.value} value={cond.value}>{cond.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Localização */}
              <div>
                <Label>Localização</Label>
                <Input
                  value={filtros.localizacao}
                  onChange={(e) => setFiltros(prev => ({ ...prev, localizacao: e.target.value }))}
                  placeholder="Ex: São Paulo, SP"
                />
              </div>

              {/* Ordenação */}
              <div>
                <Label>Ordenar por</Label>
                <Select 
                  value={filtros.ordenar} 
                  onValueChange={(v) => setFiltros(prev => ({ ...prev, ordenar: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ordenacoes.map(ord => (
                      <SelectItem key={ord.value} value={ord.value}>{ord.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={limparFiltros}>
                  Limpar
                </Button>
                <Button className="flex-1" onClick={aplicarFiltros}>
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Button onClick={aplicarFiltros}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Filtros ativos */}
      {filtrosAtivos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filtrosAtivos.map((filtro, i) => (
            <Badge key={i} variant="secondary" className="flex items-center gap-1">
              {filtro}
              <button onClick={() => removerFiltro(filtro)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={limparFiltros} className="h-6 text-xs">
            Limpar todos
          </Button>
        </div>
      )}
    </div>
  );
};

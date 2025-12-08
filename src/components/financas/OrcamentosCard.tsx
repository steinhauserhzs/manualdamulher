import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, PiggyBank, AlertTriangle, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Orcamento {
  id: string;
  categoria: string;
  valor_limite: number;
  mes: number;
  ano: number;
  alerta_percentual: number;
  gasto_atual?: number;
}

const categorias = [
  "Alimentação", "Transporte", "Moradia", "Saúde", "Educação", 
  "Lazer", "Vestuário", "Beleza", "Pets", "Assinaturas", "Outros"
];

const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export const OrcamentosCard = () => {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [novoOrcamento, setNovoOrcamento] = useState({
    categoria: "",
    valor_limite: "",
    alerta_percentual: "80"
  });

  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  useEffect(() => {
    carregarOrcamentos();
  }, []);

  const carregarOrcamentos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar orçamentos do mês atual
      const { data: orcamentosData, error } = await supabase
        .from("orcamentos")
        .select("*")
        .eq("user_id", user.id)
        .eq("mes", mesAtual)
        .eq("ano", anoAtual);

      if (error) throw error;

      // Buscar gastos por categoria do mês atual
      const inicioMes = new Date(anoAtual, mesAtual - 1, 1).toISOString().split('T')[0];
      const fimMes = new Date(anoAtual, mesAtual, 0).toISOString().split('T')[0];

      const { data: transacoes } = await supabase
        .from("transacoes_financeiras")
        .select("categoria, valor")
        .eq("user_id", user.id)
        .eq("tipo", "despesa")
        .gte("data", inicioMes)
        .lte("data", fimMes);

      // Calcular gastos por categoria
      const gastosPorCategoria: Record<string, number> = {};
      transacoes?.forEach(t => {
        gastosPorCategoria[t.categoria] = (gastosPorCategoria[t.categoria] || 0) + Number(t.valor);
      });

      // Combinar orçamentos com gastos
      const orcamentosComGastos = orcamentosData?.map(o => ({
        ...o,
        gasto_atual: gastosPorCategoria[o.categoria] || 0
      })) || [];

      setOrcamentos(orcamentosComGastos);
    } catch (error) {
      console.error("Erro ao carregar orçamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const adicionarOrcamento = async () => {
    if (!novoOrcamento.categoria || !novoOrcamento.valor_limite) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("orcamentos").insert({
        user_id: user.id,
        categoria: novoOrcamento.categoria,
        valor_limite: parseFloat(novoOrcamento.valor_limite),
        mes: mesAtual,
        ano: anoAtual,
        alerta_percentual: parseInt(novoOrcamento.alerta_percentual)
      });

      if (error) throw error;

      toast({ title: "Orçamento criado!" });
      setDialogOpen(false);
      setNovoOrcamento({ categoria: "", valor_limite: "", alerta_percentual: "80" });
      carregarOrcamentos();
    } catch (error: any) {
      toast({ title: "Erro ao criar orçamento", description: error.message, variant: "destructive" });
    }
  };

  const getProgressColor = (percentual: number, alerta: number) => {
    if (percentual >= 100) return "bg-red-500";
    if (percentual >= alerta) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <PiggyBank className="h-5 w-5 text-primary" />
          Orçamentos - {meses[mesAtual - 1]}
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" /> Novo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Orçamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Categoria</Label>
                <Select 
                  value={novoOrcamento.categoria} 
                  onValueChange={(v) => setNovoOrcamento(prev => ({ ...prev, categoria: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor Limite (R$)</Label>
                <Input
                  type="number"
                  value={novoOrcamento.valor_limite}
                  onChange={(e) => setNovoOrcamento(prev => ({ ...prev, valor_limite: e.target.value }))}
                  placeholder="0,00"
                />
              </div>
              <div>
                <Label>Alerta quando atingir (%)</Label>
                <Input
                  type="number"
                  value={novoOrcamento.alerta_percentual}
                  onChange={(e) => setNovoOrcamento(prev => ({ ...prev, alerta_percentual: e.target.value }))}
                  min="50"
                  max="100"
                />
              </div>
              <Button onClick={adicionarOrcamento} className="w-full">Criar Orçamento</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center text-muted-foreground py-4">Carregando...</div>
        ) : orcamentos.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            <TrendingDown className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum orçamento definido</p>
            <p className="text-sm">Crie orçamentos para controlar seus gastos</p>
          </div>
        ) : (
          orcamentos.map((orc) => {
            const percentual = orc.valor_limite > 0 
              ? Math.min((orc.gasto_atual || 0) / orc.valor_limite * 100, 100) 
              : 0;
            const excedeu = percentual >= 100;
            const alerta = percentual >= orc.alerta_percentual && percentual < 100;

            return (
              <div key={orc.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{orc.categoria}</span>
                    {(excedeu || alerta) && (
                      <AlertTriangle className={`h-4 w-4 ${excedeu ? 'text-red-500' : 'text-amber-500'}`} />
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    R$ {(orc.gasto_atual || 0).toFixed(2)} / R$ {orc.valor_limite.toFixed(2)}
                  </span>
                </div>
                <Progress 
                  value={percentual} 
                  className={`h-2 ${getProgressColor(percentual, orc.alerta_percentual)}`}
                />
                {excedeu && (
                  <p className="text-xs text-red-500">
                    Orçamento excedido em R$ {((orc.gasto_atual || 0) - orc.valor_limite).toFixed(2)}
                  </p>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

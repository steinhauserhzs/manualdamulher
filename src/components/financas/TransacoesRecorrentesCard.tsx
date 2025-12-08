import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Repeat, ArrowUpCircle, ArrowDownCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface TransacaoRecorrente {
  id: string;
  tipo: string;
  categoria: string;
  descricao: string | null;
  valor: number;
  frequencia: string;
  dia_vencimento: number | null;
  ativo: boolean;
}

const categorias = [
  "Alimentação", "Transporte", "Moradia", "Saúde", "Educação", 
  "Lazer", "Vestuário", "Salário", "Freelance", "Investimentos", "Outros"
];

const frequencias = [
  { value: "semanal", label: "Semanal" },
  { value: "quinzenal", label: "Quinzenal" },
  { value: "mensal", label: "Mensal" },
  { value: "bimestral", label: "Bimestral" },
  { value: "trimestral", label: "Trimestral" },
  { value: "semestral", label: "Semestral" },
  { value: "anual", label: "Anual" },
];

export const TransacoesRecorrentesCard = () => {
  const [transacoes, setTransacoes] = useState<TransacaoRecorrente[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [novaTransacao, setNovaTransacao] = useState({
    tipo: "despesa" as "receita" | "despesa",
    categoria: "",
    descricao: "",
    valor: "",
    frequencia: "mensal",
    dia_vencimento: "1"
  });

  useEffect(() => {
    carregarTransacoes();
  }, []);

  const carregarTransacoes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("transacoes_recorrentes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransacoes(data || []);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
    } finally {
      setLoading(false);
    }
  };

  const adicionarTransacao = async () => {
    if (!novaTransacao.categoria || !novaTransacao.valor) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("transacoes_recorrentes").insert({
        user_id: user.id,
        tipo: novaTransacao.tipo,
        categoria: novaTransacao.categoria,
        descricao: novaTransacao.descricao || null,
        valor: parseFloat(novaTransacao.valor),
        frequencia: novaTransacao.frequencia,
        dia_vencimento: parseInt(novaTransacao.dia_vencimento)
      });

      if (error) throw error;

      toast({ title: "Transação recorrente criada!" });
      setDialogOpen(false);
      setNovaTransacao({
        tipo: "despesa",
        categoria: "",
        descricao: "",
        valor: "",
        frequencia: "mensal",
        dia_vencimento: "1"
      });
      carregarTransacoes();
    } catch (error: any) {
      toast({ title: "Erro ao criar transação", description: error.message, variant: "destructive" });
    }
  };

  const toggleAtivo = async (id: string, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from("transacoes_recorrentes")
        .update({ ativo: !ativo })
        .eq("id", id);

      if (error) throw error;
      carregarTransacoes();
    } catch (error) {
      console.error("Erro ao atualizar:", error);
    }
  };

  const excluirTransacao = async (id: string) => {
    try {
      const { error } = await supabase
        .from("transacoes_recorrentes")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Transação excluída" });
      carregarTransacoes();
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Repeat className="h-5 w-5 text-primary" />
          Transações Recorrentes
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" /> Nova
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Transação Recorrente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={novaTransacao.tipo === "receita" ? "default" : "outline"}
                  onClick={() => setNovaTransacao(prev => ({ ...prev, tipo: "receita" }))}
                  className="flex-1"
                >
                  <ArrowUpCircle className="h-4 w-4 mr-1" /> Receita
                </Button>
                <Button
                  type="button"
                  variant={novaTransacao.tipo === "despesa" ? "default" : "outline"}
                  onClick={() => setNovaTransacao(prev => ({ ...prev, tipo: "despesa" }))}
                  className="flex-1"
                >
                  <ArrowDownCircle className="h-4 w-4 mr-1" /> Despesa
                </Button>
              </div>
              <div>
                <Label>Descrição</Label>
                <Input
                  value={novaTransacao.descricao}
                  onChange={(e) => setNovaTransacao(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Ex: Aluguel, Internet, Salário..."
                />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select 
                  value={novaTransacao.categoria} 
                  onValueChange={(v) => setNovaTransacao(prev => ({ ...prev, categoria: v }))}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    value={novaTransacao.valor}
                    onChange={(e) => setNovaTransacao(prev => ({ ...prev, valor: e.target.value }))}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <Label>Dia do Mês</Label>
                  <Input
                    type="number"
                    value={novaTransacao.dia_vencimento}
                    onChange={(e) => setNovaTransacao(prev => ({ ...prev, dia_vencimento: e.target.value }))}
                    min="1"
                    max="31"
                  />
                </div>
              </div>
              <div>
                <Label>Frequência</Label>
                <Select 
                  value={novaTransacao.frequencia} 
                  onValueChange={(v) => setNovaTransacao(prev => ({ ...prev, frequencia: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencias.map(f => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={adicionarTransacao} className="w-full">Criar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-center text-muted-foreground py-4">Carregando...</div>
        ) : transacoes.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            <Repeat className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma transação recorrente</p>
            <p className="text-sm">Cadastre contas fixas e recebimentos</p>
          </div>
        ) : (
          transacoes.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                {t.tipo === "receita" ? (
                  <ArrowUpCircle className="h-5 w-5 text-emerald-500" />
                ) : (
                  <ArrowDownCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium">{t.descricao || t.categoria}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Dia {t.dia_vencimento}</span>
                    <span>•</span>
                    <span className="capitalize">{t.frequencia}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-semibold ${t.tipo === "receita" ? "text-emerald-500" : "text-red-500"}`}>
                  {t.tipo === "receita" ? "+" : "-"} R$ {t.valor.toFixed(2)}
                </span>
                <Switch checked={t.ativo} onCheckedChange={() => toggleAtivo(t.id, t.ativo)} />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => excluirTransacao(t.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

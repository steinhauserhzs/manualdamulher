import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CreditCard, DollarSign, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Divida {
  id: string;
  nome: string;
  descricao: string | null;
  valor_total: number;
  valor_pago: number;
  total_parcelas: number | null;
  parcelas_pagas: number;
  data_vencimento: string | null;
  credor: string | null;
  categoria: string;
  status: string;
}

const categorias = [
  "Cartão de Crédito", "Empréstimo", "Financiamento", "Parcelamento", 
  "Cheque Especial", "Consignado", "Estudantil", "Outros"
];

export const DividasCard = () => {
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pagamentoDialogOpen, setPagamentoDialogOpen] = useState(false);
  const [dividaSelecionada, setDividaSelecionada] = useState<Divida | null>(null);
  const [valorPagamento, setValorPagamento] = useState("");
  const [loading, setLoading] = useState(true);
  const [novaDivida, setNovaDivida] = useState({
    nome: "",
    descricao: "",
    valor_total: "",
    total_parcelas: "",
    data_vencimento: "",
    credor: "",
    categoria: "Parcelamento"
  });

  useEffect(() => {
    carregarDividas();
  }, []);

  const carregarDividas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("dividas")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDividas(data || []);
    } catch (error) {
      console.error("Erro ao carregar dívidas:", error);
    } finally {
      setLoading(false);
    }
  };

  const adicionarDivida = async () => {
    if (!novaDivida.nome || !novaDivida.valor_total) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("dividas").insert({
        user_id: user.id,
        nome: novaDivida.nome,
        descricao: novaDivida.descricao || null,
        valor_total: parseFloat(novaDivida.valor_total),
        total_parcelas: novaDivida.total_parcelas ? parseInt(novaDivida.total_parcelas) : null,
        data_vencimento: novaDivida.data_vencimento || null,
        credor: novaDivida.credor || null,
        categoria: novaDivida.categoria
      });

      if (error) throw error;

      toast({ title: "Dívida cadastrada!" });
      setDialogOpen(false);
      setNovaDivida({
        nome: "",
        descricao: "",
        valor_total: "",
        total_parcelas: "",
        data_vencimento: "",
        credor: "",
        categoria: "Parcelamento"
      });
      carregarDividas();
    } catch (error: any) {
      toast({ title: "Erro ao cadastrar dívida", description: error.message, variant: "destructive" });
    }
  };

  const registrarPagamento = async () => {
    if (!dividaSelecionada || !valorPagamento) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const valor = parseFloat(valorPagamento);
      const novoValorPago = dividaSelecionada.valor_pago + valor;
      const novasParcelas = dividaSelecionada.parcelas_pagas + 1;
      const quitada = novoValorPago >= dividaSelecionada.valor_total;

      // Registrar pagamento
      await supabase.from("dividas_pagamentos").insert({
        divida_id: dividaSelecionada.id,
        user_id: user.id,
        valor,
        numero_parcela: novasParcelas
      });

      // Atualizar dívida
      await supabase.from("dividas").update({
        valor_pago: novoValorPago,
        parcelas_pagas: novasParcelas,
        status: quitada ? "quitada" : "ativa"
      }).eq("id", dividaSelecionada.id);

      toast({ title: quitada ? "Dívida quitada! 🎉" : "Pagamento registrado!" });
      setPagamentoDialogOpen(false);
      setValorPagamento("");
      setDividaSelecionada(null);
      carregarDividas();
    } catch (error: any) {
      toast({ title: "Erro ao registrar pagamento", description: error.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "quitada":
        return <Badge className="bg-emerald-500">Quitada</Badge>;
      case "atrasada":
        return <Badge variant="destructive">Atrasada</Badge>;
      case "renegociada":
        return <Badge className="bg-amber-500">Renegociada</Badge>;
      default:
        return <Badge variant="secondary">Ativa</Badge>;
    }
  };

  const totalDividas = dividas.filter(d => d.status !== "quitada").reduce((acc, d) => acc + (d.valor_total - d.valor_pago), 0);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-primary" />
              Dívidas e Parcelamentos
            </CardTitle>
            {totalDividas > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Total pendente: <span className="text-red-500 font-semibold">R$ {totalDividas.toFixed(2)}</span>
              </p>
            )}
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" /> Nova
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Dívida</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <Label>Nome *</Label>
                  <Input
                    value={novaDivida.nome}
                    onChange={(e) => setNovaDivida(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Parcelamento TV, Empréstimo..."
                  />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select 
                    value={novaDivida.categoria} 
                    onValueChange={(v) => setNovaDivida(prev => ({ ...prev, categoria: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                    <Label>Valor Total *</Label>
                    <Input
                      type="number"
                      value={novaDivida.valor_total}
                      onChange={(e) => setNovaDivida(prev => ({ ...prev, valor_total: e.target.value }))}
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label>Nº Parcelas</Label>
                    <Input
                      type="number"
                      value={novaDivida.total_parcelas}
                      onChange={(e) => setNovaDivida(prev => ({ ...prev, total_parcelas: e.target.value }))}
                      placeholder="12"
                    />
                  </div>
                </div>
                <div>
                  <Label>Credor/Empresa</Label>
                  <Input
                    value={novaDivida.credor}
                    onChange={(e) => setNovaDivida(prev => ({ ...prev, credor: e.target.value }))}
                    placeholder="Ex: Banco, Loja..."
                  />
                </div>
                <div>
                  <Label>Data de Vencimento</Label>
                  <Input
                    type="date"
                    value={novaDivida.data_vencimento}
                    onChange={(e) => setNovaDivida(prev => ({ ...prev, data_vencimento: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Input
                    value={novaDivida.descricao}
                    onChange={(e) => setNovaDivida(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Observações..."
                  />
                </div>
                <Button onClick={adicionarDivida} className="w-full">Cadastrar Dívida</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center text-muted-foreground py-4">Carregando...</div>
          ) : dividas.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
              <p>Nenhuma dívida cadastrada</p>
              <p className="text-sm">Continue assim! 💪</p>
            </div>
          ) : (
            dividas.map((d) => {
              const percentualPago = d.valor_total > 0 ? (d.valor_pago / d.valor_total) * 100 : 0;
              const valorRestante = d.valor_total - d.valor_pago;

              return (
                <div key={d.id} className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{d.nome}</h4>
                        {getStatusBadge(d.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{d.categoria}</p>
                      {d.credor && <p className="text-xs text-muted-foreground">{d.credor}</p>}
                    </div>
                    {d.status !== "quitada" && (
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setDividaSelecionada(d);
                          setPagamentoDialogOpen(true);
                        }}
                      >
                        <DollarSign className="h-4 w-4 mr-1" /> Pagar
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>
                        R$ {d.valor_pago.toFixed(2)} / R$ {d.valor_total.toFixed(2)}
                      </span>
                    </div>
                    <Progress value={percentualPago} className="h-2" />
                    {d.total_parcelas && (
                      <p className="text-xs text-muted-foreground">
                        {d.parcelas_pagas} de {d.total_parcelas} parcelas pagas
                      </p>
                    )}
                  </div>

                  {d.status !== "quitada" && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Restante:</span>
                      <span className="font-semibold text-red-500">R$ {valorRestante.toFixed(2)}</span>
                    </div>
                  )}

                  {d.data_vencimento && d.status !== "quitada" && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Vencimento: {format(new Date(d.data_vencimento), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Dialog de Pagamento */}
      <Dialog open={pagamentoDialogOpen} onOpenChange={setPagamentoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
          </DialogHeader>
          {dividaSelecionada && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{dividaSelecionada.nome}</p>
                <p className="text-sm text-muted-foreground">
                  Restante: R$ {(dividaSelecionada.valor_total - dividaSelecionada.valor_pago).toFixed(2)}
                </p>
                {dividaSelecionada.total_parcelas && (
                  <p className="text-sm text-muted-foreground">
                    Parcela {dividaSelecionada.parcelas_pagas + 1} de {dividaSelecionada.total_parcelas}
                  </p>
                )}
              </div>
              <div>
                <Label>Valor do Pagamento (R$)</Label>
                <Input
                  type="number"
                  value={valorPagamento}
                  onChange={(e) => setValorPagamento(e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <Button onClick={registrarPagamento} className="w-full">
                Confirmar Pagamento
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

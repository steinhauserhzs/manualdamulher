import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Users, Trash2, Check, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Participante {
  id: string;
  nome: string;
  email: string | null;
  valor_devido: number;
  valor_pago: number;
  status: string;
}

interface DespesaCompartilhada {
  id: string;
  titulo: string;
  valor_total: number;
  categoria: string;
  data: string;
  status: string;
  participantes?: Participante[];
}

export const DespesasCompartilhadasCard = () => {
  const [despesas, setDespesas] = useState<DespesaCompartilhada[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [novaDespesa, setNovaDespesa] = useState({
    titulo: "",
    valor_total: "",
    participantes: [{ nome: "", email: "" }]
  });

  useEffect(() => {
    carregarDespesas();
  }, []);

  const carregarDespesas = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("despesas_compartilhadas")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar despesas", variant: "destructive" });
      return;
    }

    // Carregar participantes para cada despesa
    const despesasComParticipantes = await Promise.all(
      (data || []).map(async (despesa) => {
        const { data: participantes } = await supabase
          .from("despesas_participantes")
          .select("*")
          .eq("despesa_id", despesa.id);
        return { ...despesa, participantes: participantes || [] };
      })
    );

    setDespesas(despesasComParticipantes);
    setLoading(false);
  };

  const adicionarParticipante = () => {
    setNovaDespesa(prev => ({
      ...prev,
      participantes: [...prev.participantes, { nome: "", email: "" }]
    }));
  };

  const removerParticipante = (index: number) => {
    setNovaDespesa(prev => ({
      ...prev,
      participantes: prev.participantes.filter((_, i) => i !== index)
    }));
  };

  const atualizarParticipante = (index: number, field: string, value: string) => {
    setNovaDespesa(prev => ({
      ...prev,
      participantes: prev.participantes.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      )
    }));
  };

  const criarDespesa = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const valorTotal = parseFloat(novaDespesa.valor_total);
    const numParticipantes = novaDespesa.participantes.filter(p => p.nome).length + 1; // +1 para incluir o criador
    const valorPorPessoa = valorTotal / numParticipantes;

    const { data: despesaCriada, error: despesaError } = await supabase
      .from("despesas_compartilhadas")
      .insert({
        user_id: user.id,
        titulo: novaDespesa.titulo,
        valor_total: valorTotal
      })
      .select()
      .single();

    if (despesaError) {
      toast({ title: "Erro ao criar despesa", variant: "destructive" });
      return;
    }

    // Criar participantes
    const participantesValidos = novaDespesa.participantes.filter(p => p.nome);
    if (participantesValidos.length > 0) {
      await supabase.from("despesas_participantes").insert(
        participantesValidos.map(p => ({
          despesa_id: despesaCriada.id,
          nome: p.nome,
          email: p.email || null,
          valor_devido: valorPorPessoa
        }))
      );
    }

    toast({ title: "Despesa criada!", description: `Valor dividido: R$ ${valorPorPessoa.toFixed(2)} por pessoa` });
    setDialogOpen(false);
    setNovaDespesa({ titulo: "", valor_total: "", participantes: [{ nome: "", email: "" }] });
    carregarDespesas();
  };

  const marcarPago = async (participanteId: string, valorDevido: number) => {
    await supabase
      .from("despesas_participantes")
      .update({ valor_pago: valorDevido, status: "pago" })
      .eq("id", participanteId);
    
    toast({ title: "Pagamento registrado!" });
    carregarDespesas();
  };

  if (loading) {
    return (
      <Card className="gradient-card shadow-card">
        <CardContent className="p-6">
          <div className="h-32 flex items-center justify-center">
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
            <Users className="h-5 w-5 text-accent" />
            Divisão de Despesas
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Nova Divisão
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Dividir Despesa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Descrição</Label>
                  <Input 
                    value={novaDespesa.titulo}
                    onChange={(e) => setNovaDespesa(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Ex: Jantar de aniversário"
                  />
                </div>
                <div>
                  <Label>Valor Total (R$)</Label>
                  <Input 
                    type="number"
                    value={novaDespesa.valor_total}
                    onChange={(e) => setNovaDespesa(prev => ({ ...prev, valor_total: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Participantes</Label>
                    <Button type="button" variant="outline" size="sm" onClick={adicionarParticipante}>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  {novaDespesa.participantes.map((p, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Input 
                          placeholder="Nome"
                          value={p.nome}
                          onChange={(e) => atualizarParticipante(index, "nome", e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <Input 
                          type="email"
                          placeholder="Email (opcional)"
                          value={p.email}
                          onChange={(e) => atualizarParticipante(index, "email", e.target.value)}
                        />
                      </div>
                      {novaDespesa.participantes.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removerParticipante(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {novaDespesa.valor_total && novaDespesa.participantes.some(p => p.nome) && (
                    <p className="text-sm text-muted-foreground">
                      Valor por pessoa: R$ {(parseFloat(novaDespesa.valor_total) / (novaDespesa.participantes.filter(p => p.nome).length + 1)).toFixed(2)}
                    </p>
                  )}
                </div>

                <Button onClick={criarDespesa} className="w-full" disabled={!novaDespesa.titulo || !novaDespesa.valor_total}>
                  Criar Divisão
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {despesas.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            Nenhuma despesa compartilhada ainda
          </p>
        ) : (
          <div className="space-y-4">
            {despesas.map((despesa) => {
              const totalPago = despesa.participantes?.reduce((acc, p) => acc + Number(p.valor_pago), 0) || 0;
              const progresso = (totalPago / despesa.valor_total) * 100;
              
              return (
                <div key={despesa.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{despesa.titulo}</h4>
                      <p className="text-sm text-muted-foreground">
                        Total: R$ {Number(despesa.valor_total).toFixed(2)}
                      </p>
                    </div>
                    <Badge variant={progresso >= 100 ? "default" : "secondary"}>
                      {progresso >= 100 ? "Quitado" : "Pendente"}
                    </Badge>
                  </div>
                  
                  <Progress value={progresso} className="h-2" />
                  
                  <div className="space-y-2">
                    {despesa.participantes?.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-sm bg-muted/50 rounded p-2">
                        <span>{p.nome}</span>
                        <div className="flex items-center gap-2">
                          <span className={p.status === "pago" ? "text-green-600" : "text-muted-foreground"}>
                            R$ {Number(p.valor_devido).toFixed(2)}
                          </span>
                          {p.status !== "pago" && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => marcarPago(p.id, p.valor_devido)}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          {p.status === "pago" && (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

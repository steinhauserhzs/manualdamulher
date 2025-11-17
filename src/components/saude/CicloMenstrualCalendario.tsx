import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Ciclo {
  id: string;
  data_inicio: string;
  data_fim: string | null;
  sintomas: string | null;
  intensidade: string | null;
}

export const CicloMenstrualCalendario = ({ userId }: { userId: string }) => {
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [sintomas, setSintomas] = useState("");
  const [intensidade, setIntensidade] = useState("");
  const [saving, setSaving] = useState(false);
  const [previsaoProximo, setPrevisaoProximo] = useState<Date | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    carregarCiclos();
  }, [userId]);

  const carregarCiclos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ciclo_menstrual')
      .select('*')
      .eq('user_id', userId)
      .order('data_inicio', { ascending: false })
      .limit(6);

    if (error) {
      toast({
        title: "Erro ao carregar ciclos",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setCiclos(data || []);
      calcularPrevisao(data || []);
    }
    setLoading(false);
  };

  const calcularPrevisao = (ciclosData: Ciclo[]) => {
    if (ciclosData.length < 2) return;

    const ciclosCompletos = ciclosData.filter(c => c.data_fim);
    if (ciclosCompletos.length < 2) return;

    let somaIntervalos = 0;
    for (let i = 0; i < ciclosCompletos.length - 1; i++) {
      const inicio1 = new Date(ciclosCompletos[i].data_inicio);
      const inicio2 = new Date(ciclosCompletos[i + 1].data_inicio);
      const diferenca = Math.abs(inicio1.getTime() - inicio2.getTime());
      const dias = Math.ceil(diferenca / (1000 * 60 * 60 * 24));
      somaIntervalos += dias;
    }

    const mediaIntervalo = Math.round(somaIntervalos / (ciclosCompletos.length - 1));
    const ultimoCiclo = new Date(ciclosData[0].data_inicio);
    const previsao = new Date(ultimoCiclo);
    previsao.setDate(previsao.getDate() + mediaIntervalo);
    
    setPrevisaoProximo(previsao);
  };

  const handleSalvar = async () => {
    if (!dataInicio) {
      toast({
        title: "Data obrigatória",
        description: "Por favor, informe a data de início do período.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from('ciclo_menstrual')
      .insert({
        user_id: userId,
        data_inicio: dataInicio,
        data_fim: dataFim || null,
        sintomas,
        intensidade,
      });

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Ciclo registrado! 📅",
        description: "Seu ciclo foi salvo com sucesso.",
      });
      setDialogOpen(false);
      setDataInicio("");
      setDataFim("");
      setSintomas("");
      setIntensidade("");
      carregarCiclos();
    }

    setSaving(false);
  };

  const getMarkedDates = () => {
    const marked: Date[] = [];
    ciclos.forEach(ciclo => {
      const inicio = new Date(ciclo.data_inicio);
      marked.push(inicio);
      
      if (ciclo.data_fim) {
        const fim = new Date(ciclo.data_fim);
        const current = new Date(inicio);
        
        while (current <= fim) {
          marked.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
      }
    });
    return marked;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Ciclo Menstrual 🌸</CardTitle>
            <CardDescription>Acompanhe seu ciclo e previsões</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" /> Registrar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Período</DialogTitle>
                <DialogDescription>
                  Informe as datas e detalhes do seu período
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dataInicio">Data de Início *</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dataFim">Data de Término</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="intensidade">Intensidade</Label>
                  <select
                    id="intensidade"
                    value={intensidade}
                    onChange={(e) => setIntensidade(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Selecione</option>
                    <option value="leve">Leve</option>
                    <option value="moderado">Moderado</option>
                    <option value="intenso">Intenso</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="sintomas">Sintomas</Label>
                  <Textarea
                    id="sintomas"
                    value={sintomas}
                    onChange={(e) => setSintomas(e.target.value)}
                    placeholder="Cólicas, TPM, dor de cabeça..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSalvar} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {previsaoProximo && (
          <div className="mb-4 p-3 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium">
              Previsão do próximo período: {previsaoProximo.toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Últimos Ciclos:</h4>
          {ciclos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum ciclo registrado ainda. Comece registrando seu primeiro período!
            </p>
          ) : (
            <div className="space-y-2">
              {ciclos.map((ciclo) => (
                <div key={ciclo.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {new Date(ciclo.data_inicio).toLocaleDateString('pt-BR')}
                      {ciclo.data_fim && ` - ${new Date(ciclo.data_fim).toLocaleDateString('pt-BR')}`}
                    </p>
                    {ciclo.intensidade && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {ciclo.intensidade}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

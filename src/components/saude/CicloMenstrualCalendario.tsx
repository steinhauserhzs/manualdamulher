import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarHeart, Plus, Droplets, Heart, Info } from "lucide-react";
import { format, addDays, differenceInDays, isSameDay, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RegistroDiarioDialog } from "./RegistroDiarioDialog";
import { Badge } from "@/components/ui/badge";

interface CicloMenstrualCalendarioProps {
  userId: string;
}

interface Ciclo {
  id: string;
  data_inicio: string;
  data_fim: string | null;
  intensidade: string | null;
  sintomas: string | null;
}

interface RegistroDiario {
  id: string;
  data: string;
  teve_relacao: boolean;
  usou_protecao: boolean | null;
  fluxo: string | null;
  humor: string | null;
}

export const CicloMenstrualCalendario = ({ userId }: CicloMenstrualCalendarioProps) => {
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [registrosDiarios, setRegistrosDiarios] = useState<RegistroDiario[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [intensidade, setIntensidade] = useState("");
  const [sintomas, setSintomas] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      carregarDados();
    }
  }, [userId]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Carregar ciclos
      const { data: ciclosData, error: ciclosError } = await supabase
        .from("ciclo_menstrual")
        .select("*")
        .eq("user_id", userId)
        .order("data_inicio", { ascending: false })
        .limit(12);

      if (ciclosError) throw ciclosError;
      setCiclos(ciclosData || []);

      // Carregar registros diários
      const { data: registrosData } = await supabase
        .from("registro_ciclo_diario")
        .select("*")
        .eq("user_id", userId)
        .order("data", { ascending: false })
        .limit(60);

      setRegistrosDiarios(registrosData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({ title: "Erro", description: "Não foi possível carregar os dados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Calcular previsão do próximo ciclo
  const calcularPrevisao = () => {
    if (ciclos.length < 2) return null;
    
    const ciclosCompletos = ciclos.filter(c => c.data_fim);
    if (ciclosCompletos.length < 2) return null;

    let somaIntervalos = 0;
    for (let i = 0; i < ciclosCompletos.length - 1; i++) {
      const inicio1 = new Date(ciclosCompletos[i].data_inicio);
      const inicio2 = new Date(ciclosCompletos[i + 1].data_inicio);
      somaIntervalos += Math.abs(differenceInDays(inicio1, inicio2));
    }
    
    const mediaIntervalo = Math.round(somaIntervalos / (ciclosCompletos.length - 1));
    const ultimoCiclo = new Date(ciclos[0].data_inicio);
    const proximaPrevisao = addDays(ultimoCiclo, mediaIntervalo);
    const periodoFertilInicio = addDays(proximaPrevisao, -14 - 5);
    const periodoFertilFim = addDays(proximaPrevisao, -14 + 1);
    const ovulacao = addDays(proximaPrevisao, -14);

    return {
      proximaMenstruacao: proximaPrevisao,
      periodoFertilInicio,
      periodoFertilFim,
      ovulacao,
      mediaIntervalo
    };
  };

  const previsao = calcularPrevisao();

  // Determinar tipo de dia para colorir o calendário
  const getDayType = (date: Date): string | null => {
    // Verificar se está em período de menstruação
    for (const ciclo of ciclos) {
      const inicio = new Date(ciclo.data_inicio);
      const fim = ciclo.data_fim ? new Date(ciclo.data_fim) : addDays(inicio, 5);
      if (isWithinInterval(date, { start: inicio, end: fim })) {
        return "menstruacao";
      }
    }

    // Verificar registros diários com fluxo
    const registro = registrosDiarios.find(r => isSameDay(new Date(r.data), date));
    if (registro?.fluxo) return "menstruacao";

    // Verificar previsões
    if (previsao) {
      if (isSameDay(date, previsao.ovulacao)) return "ovulacao";
      if (isWithinInterval(date, { start: previsao.periodoFertilInicio, end: previsao.periodoFertilFim })) {
        return "fertil";
      }
    }

    // Verificar se teve relação
    if (registro?.teve_relacao) return "relacao";

    return null;
  };

  const handleSalvar = async () => {
    if (!dataInicio) {
      toast({ title: "Atenção", description: "Informe a data de início.", variant: "destructive" });
      return;
    }

    setSalvando(true);
    try {
      const { error } = await supabase.from("ciclo_menstrual").insert({
        user_id: userId,
        data_inicio: dataInicio,
        data_fim: dataFim || null,
        intensidade: intensidade || null,
        sintomas: sintomas || null,
      });

      if (error) throw error;

      toast({ title: "Ciclo registrado!", description: "Seu ciclo foi salvo com sucesso." });
      setDialogOpen(false);
      setDataInicio("");
      setDataFim("");
      setIntensidade("");
      setSintomas("");
      carregarDados();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({ title: "Erro", description: "Não foi possível salvar o ciclo.", variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-rose-500/10 to-pink-500/10 pb-2 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <CalendarHeart className="h-5 w-5 text-rose-500" />
              Ciclo Menstrual
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Acompanhe seu ciclo e registre informações diárias</CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <RegistroDiarioDialog 
              userId={userId} 
              selectedDate={selectedDate}
              onRegistroAdded={carregarDados}
              existingRegistro={registrosDiarios.find(r => isSameDay(new Date(r.data), selectedDate)) as any}
            />
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Novo Ciclo</span>
                  <span className="sm:hidden">Ciclo</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Novo Ciclo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataInicio">Data de início *</Label>
                    <Input
                      id="dataInicio"
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataFim">Data de término</Label>
                    <Input
                      id="dataFim"
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Intensidade</Label>
                    <Select value={intensidade} onValueChange={setIntensidade}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="leve">Leve</SelectItem>
                        <SelectItem value="moderado">Moderado</SelectItem>
                        <SelectItem value="intenso">Intenso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sintomas">Sintomas</Label>
                    <Textarea
                      id="sintomas"
                      value={sintomas}
                      onChange={(e) => setSintomas(e.target.value)}
                      placeholder="Cólicas, dor de cabeça..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSalvar} disabled={salvando}>
                    {salvando ? "Salvando..." : "Salvar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Legenda */}
        <div className="flex flex-wrap gap-2 sm:gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <span>Menstruação</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Período fértil</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Ovulação</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
            <span>Relação</span>
          </div>
        </div>

        {/* Calendário */}
        <div className="flex justify-center overflow-x-auto">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={ptBR}
            className="rounded-md border"
            modifiers={{
              menstruacao: (date) => getDayType(date) === "menstruacao",
              fertil: (date) => getDayType(date) === "fertil",
              ovulacao: (date) => getDayType(date) === "ovulacao",
              relacao: (date) => getDayType(date) === "relacao",
            }}
            modifiersStyles={{
              menstruacao: { backgroundColor: "hsl(346 77% 50% / 0.3)", borderRadius: "50%" },
              fertil: { backgroundColor: "hsl(142 76% 36% / 0.3)", borderRadius: "50%" },
              ovulacao: { backgroundColor: "hsl(217 91% 60% / 0.5)", borderRadius: "50%", fontWeight: "bold" },
              relacao: { border: "2px solid hsl(330 81% 60%)", borderRadius: "50%" },
            }}
          />
        </div>

        {/* Previsões */}
        {previsao && (
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            <h4 className="font-semibold flex items-center gap-2 text-sm">
              <Info className="h-4 w-4" />
              Previsões (baseado nos últimos ciclos)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-rose-500" />
                <span>Próxima menstruação: </span>
                <strong>{format(previsao.proximaMenstruacao, "dd/MM", { locale: ptBR })}</strong>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500/50"></div>
                <span>Período fértil: </span>
                <strong>
                  {format(previsao.periodoFertilInicio, "dd/MM")} - {format(previsao.periodoFertilFim, "dd/MM")}
                </strong>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Média do seu ciclo: {previsao.mediaIntervalo} dias
            </p>
          </div>
        )}

        {/* Últimos ciclos */}
        {ciclos.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Últimos ciclos</h4>
            <div className="space-y-1">
              {ciclos.slice(0, 3).map((ciclo) => (
                <div key={ciclo.id} className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded">
                  <span>
                    {format(new Date(ciclo.data_inicio), "dd/MM/yyyy")}
                    {ciclo.data_fim && ` - ${format(new Date(ciclo.data_fim), "dd/MM")}`}
                  </span>
                  {ciclo.intensidade && (
                    <Badge variant="secondary" className="text-xs">
                      {ciclo.intensidade}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {ciclos.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum ciclo registrado ainda. Clique em "Novo Ciclo" para começar.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

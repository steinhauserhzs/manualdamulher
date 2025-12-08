import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { ProfissionalCard } from "@/components/saude/ProfissionalCard";
import { AgendarConsultaDialog } from "@/components/saude/AgendarConsultaDialog";
import { AvaliarConsultaDialog } from "@/components/saude/AvaliarConsultaDialog";
import { toast } from "sonner";
import { format, formatDistanceToNow, isBefore, addMinutes, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ArrowLeft, Video, Search, Filter, Calendar, Clock, 
  CheckCircle, XCircle, Star, Stethoscope, Brain,
  FileText, MessageCircle
} from "lucide-react";

interface Especialidade {
  id: string;
  nome: string;
  descricao: string | null;
  icone: string | null;
  tipo: string;
}

interface Profissional {
  id: string;
  nome: string;
  registro_profissional: string;
  foto_url: string | null;
  bio: string | null;
  anos_experiencia: number;
  valor_consulta: number;
  duracao_consulta: number;
  avaliacao_media: number;
  total_consultas: number;
  especialidade?: {
    nome: string;
    icone: string;
    tipo: string;
  } | null;
}

interface Agendamento {
  id: string;
  data_hora: string;
  duracao_minutos: number;
  tipo: string;
  status: string;
  motivo_consulta: string | null;
  valor: number;
  avaliacao_paciente: number | null;
  profissional: {
    id: string;
    nome: string;
    registro_profissional: string;
    foto_url: string | null;
    especialidade: {
      nome: string;
      icone: string;
    } | null;
  } | null;
}

const Telemedicina = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [historico, setHistorico] = useState<Agendamento[]>([]);

  const [filtroEspecialidade, setFiltroEspecialidade] = useState<string>("todas");
  const [filtroTipo, setFiltroTipo] = useState<string>(searchParams.get("tipo") || "todos");
  const [busca, setBusca] = useState("");

  const [profissionalSelecionado, setProfissionalSelecionado] = useState<Profissional | null>(null);
  const [showAgendarDialog, setShowAgendarDialog] = useState(false);
  const [agendamentoParaAvaliar, setAgendamentoParaAvaliar] = useState<Agendamento | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    await Promise.all([
      carregarEspecialidades(),
      carregarProfissionais(),
      carregarAgendamentos(session.user.id)
    ]);
    setLoading(false);
  };

  const carregarEspecialidades = async () => {
    const { data, error } = await supabase
      .from("telemedicina_especialidades")
      .select("*")
      .eq("ativo", true)
      .order("nome");

    if (!error && data) {
      setEspecialidades(data);
    }
  };

  const carregarProfissionais = async () => {
    const { data, error } = await supabase
      .from("telemedicina_profissionais")
      .select(`
        *,
        especialidade:telemedicina_especialidades(nome, icone, tipo)
      `)
      .eq("disponivel", true)
      .order("avaliacao_media", { ascending: false });

    if (!error && data) {
      setProfissionais(data as unknown as Profissional[]);
    }
  };

  const carregarAgendamentos = async (userId: string) => {
    const agora = new Date().toISOString();

    // Próximos agendamentos
    const { data: proximos, error: errProximos } = await supabase
      .from("telemedicina_agendamentos")
      .select(`
        *,
        profissional:telemedicina_profissionais(
          id, nome, registro_profissional, foto_url,
          especialidade:telemedicina_especialidades(nome, icone)
        )
      `)
      .eq("user_id", userId)
      .in("status", ["agendado", "confirmado"])
      .gte("data_hora", agora)
      .order("data_hora", { ascending: true });

    if (!errProximos && proximos) {
      setAgendamentos(proximos as unknown as Agendamento[]);
    }

    // Histórico
    const { data: hist, error: errHist } = await supabase
      .from("telemedicina_agendamentos")
      .select(`
        *,
        profissional:telemedicina_profissionais(
          id, nome, registro_profissional, foto_url,
          especialidade:telemedicina_especialidades(nome, icone)
        )
      `)
      .eq("user_id", userId)
      .or(`status.eq.concluido,data_hora.lt.${agora}`)
      .order("data_hora", { ascending: false })
      .limit(20);

    if (!errHist && hist) {
      setHistorico(hist as unknown as Agendamento[]);
    }
  };

  const cancelarAgendamento = async (agendamentoId: string) => {
    const { error } = await supabase
      .from("telemedicina_agendamentos")
      .update({ status: "cancelado" })
      .eq("id", agendamentoId);

    if (error) {
      toast.error("Erro ao cancelar agendamento");
      return;
    }

    toast.success("Agendamento cancelado");
    carregarAgendamentos(user.id);
  };

  const handleAgendar = (profissional: Profissional) => {
    setProfissionalSelecionado(profissional);
    setShowAgendarDialog(true);
  };

  // Filtrar profissionais
  const profissionaisFiltrados = profissionais.filter(p => {
    if (filtroTipo !== "todos" && p.especialidade?.tipo !== filtroTipo) return false;
    if (filtroEspecialidade !== "todas" && p.especialidade?.nome !== filtroEspecialidade) return false;
    if (busca && !p.nome.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="mb-6">
        <div className="container mx-auto px-3 sm:px-4 pt-4 pb-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/saude">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        </div>
        <ModuleHeader 
          icon={Video}
          title="Telemedicina"
          subtitle="Consulte profissionais de saúde online"
          gradient="saude"
        />
      </div>

      <main className="container mx-auto px-3 sm:px-4 py-6 animate-fade-in">
        <Tabs defaultValue="agendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="agendar">
              <Calendar className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Agendar</span>
            </TabsTrigger>
            <TabsTrigger value="consultas">
              <Clock className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Minhas Consultas</span>
              {agendamentos.length > 0 && (
                <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
                  {agendamentos.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="historico">
              <FileText className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Agendar */}
          <TabsContent value="agendar" className="space-y-4">
            {/* Filtros */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Busca */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar profissional..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Tipo */}
                  <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="medicina">🩺 Medicina</SelectItem>
                      <SelectItem value="psicologia">🧠 Psicologia</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Especialidade */}
                  <Select value={filtroEspecialidade} onValueChange={setFiltroEspecialidade}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Especialidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas especialidades</SelectItem>
                      {especialidades.map(esp => (
                        <SelectItem key={esp.id} value={esp.nome}>
                          {esp.icone} {esp.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de profissionais */}
            <div className="space-y-4">
              {profissionaisFiltrados.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Nenhum profissional encontrado com os filtros selecionados.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                profissionaisFiltrados.map(prof => (
                  <ProfissionalCard
                    key={prof.id}
                    profissional={prof}
                    onAgendar={handleAgendar}
                  />
                ))
              )}
            </div>
          </TabsContent>

          {/* Tab Minhas Consultas */}
          <TabsContent value="consultas" className="space-y-4">
            {agendamentos.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Você não tem consultas agendadas.
                  </p>
                  <Button onClick={() => document.querySelector('[value="agendar"]')?.dispatchEvent(new Event('click'))}>
                    Agendar primeira consulta
                  </Button>
                </CardContent>
              </Card>
            ) : (
              agendamentos.map(agend => {
                const dataHora = new Date(agend.data_hora);
                const podeEntrar = isBefore(addMinutes(dataHora, -5), new Date()) && 
                                   isBefore(new Date(), addMinutes(dataHora, agend.duracao_minutos));

                return (
                  <Card key={agend.id} className={podeEntrar ? "border-primary" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={agend.tipo === "telepsicologia" ? "secondary" : "default"}>
                              {agend.tipo === "telepsicologia" ? "🧠 Psicologia" : "🩺 Medicina"}
                            </Badge>
                            <Badge variant="outline">
                              {agend.status === "confirmado" ? "Confirmado" : "Agendado"}
                            </Badge>
                          </div>
                          
                          <h3 className="font-semibold">{agend.profissional?.nome}</h3>
                          <p className="text-sm text-muted-foreground">
                            {agend.profissional?.especialidade?.icone} {agend.profissional?.especialidade?.nome}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {agend.profissional?.registro_profissional}
                          </p>

                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(dataHora, "dd/MM/yyyy", { locale: ptBR })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {format(dataHora, "HH:mm")}
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(dataHora, { addSuffix: true, locale: ptBR })}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2">
                          {podeEntrar ? (
                            <Button asChild size="sm">
                              <Link to={`/telemedicina/consulta/${agend.id}`}>
                                <Video className="h-4 w-4 mr-1" />
                                Entrar
                              </Link>
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" disabled>
                              <Clock className="h-4 w-4 mr-1" />
                              Aguarde
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => cancelarAgendamento(agend.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Tab Histórico */}
          <TabsContent value="historico" className="space-y-4">
            {historico.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Seu histórico de consultas aparecerá aqui.
                  </p>
                </CardContent>
              </Card>
            ) : (
              historico.map(agend => {
                const dataHora = new Date(agend.data_hora);
                const foiConcluida = agend.status === "concluido" || isPast(dataHora);
                const podeAvaliar = foiConcluida && !agend.avaliacao_paciente;

                return (
                  <Card key={agend.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={agend.status === "cancelado" ? "destructive" : "default"}>
                              {agend.status === "cancelado" ? "Cancelada" : "Concluída"}
                            </Badge>
                            {agend.avaliacao_paciente && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs">{agend.avaliacao_paciente}</span>
                              </div>
                            )}
                          </div>

                          <h3 className="font-semibold">{agend.profissional?.nome}</h3>
                          <p className="text-sm text-muted-foreground">
                            {agend.profissional?.especialidade?.icone} {agend.profissional?.especialidade?.nome}
                          </p>

                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(dataHora, "dd/MM/yyyy", { locale: ptBR })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {format(dataHora, "HH:mm")}
                            </div>
                          </div>

                          {agend.motivo_consulta && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              <strong>Motivo:</strong> {agend.motivo_consulta}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          {podeAvaliar && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setAgendamentoParaAvaliar(agend)}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Avaliar
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/telemedicina?agendar=${agend.profissional?.id}`}>
                              Remarcar
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <AgendarConsultaDialog
        open={showAgendarDialog}
        onOpenChange={setShowAgendarDialog}
        profissional={profissionalSelecionado}
        userId={user?.id}
        onAgendamentoCriado={() => {
          carregarAgendamentos(user.id);
          setShowAgendarDialog(false);
        }}
      />

      {agendamentoParaAvaliar && (
        <AvaliarConsultaDialog
          open={!!agendamentoParaAvaliar}
          onOpenChange={() => setAgendamentoParaAvaliar(null)}
          agendamentoId={agendamentoParaAvaliar.id}
          profissionalNome={agendamentoParaAvaliar.profissional?.nome || ""}
          onAvaliacaoEnviada={() => {
            carregarAgendamentos(user.id);
            setAgendamentoParaAvaliar(null);
          }}
        />
      )}
    </div>
  );
};

export default Telemedicina;

import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format, differenceInMinutes, differenceInSeconds } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Video, VideoOff, Mic, MicOff, Phone, MessageCircle,
  Send, Clock, User, AlertTriangle, Maximize2, Minimize2
} from "lucide-react";

interface Agendamento {
  id: string;
  data_hora: string;
  duracao_minutos: number;
  tipo: string;
  status: string;
  profissional: {
    nome: string;
    registro_profissional: string;
    foto_url: string | null;
    especialidade: {
      nome: string;
      icone: string;
    } | null;
  } | null;
}

const SalaConsulta = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);

  // Estados da videochamada (simulados - em produção virá da API do parceiro)
  const [videoAtivo, setVideoAtivo] = useState(true);
  const [micAtivo, setMicAtivo] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [chatAberto, setChatAberto] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [mensagens, setMensagens] = useState<{ remetente: string; texto: string; hora: string }[]>([]);
  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  const [aguardandoProfissional, setAguardandoProfissional] = useState(true);

  useEffect(() => {
    carregarAgendamento();
  }, [id]);

  useEffect(() => {
    // Timer para simular tempo de consulta
    const interval = setInterval(() => {
      setTempoDecorrido(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Simular profissional entrando após 3 segundos
  useEffect(() => {
    const timeout = setTimeout(() => {
      setAguardandoProfissional(false);
      toast.success("O profissional entrou na consulta");
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  const carregarAgendamento = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("telemedicina_agendamentos")
      .select(`
        id,
        data_hora,
        duracao_minutos,
        tipo,
        status,
        profissional:telemedicina_profissionais(
          nome, registro_profissional, foto_url,
          especialidade:telemedicina_especialidades(nome, icone)
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      toast.error("Consulta não encontrada");
      navigate("/telemedicina");
      return;
    }

    setAgendamento(data as unknown as Agendamento);
    setLoading(false);
  };

  const formatarTempo = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min.toString().padStart(2, "0")}:${seg.toString().padStart(2, "0")}`;
  };

  const enviarMensagem = () => {
    if (!mensagem.trim()) return;

    setMensagens(prev => [...prev, {
      remetente: "Você",
      texto: mensagem,
      hora: format(new Date(), "HH:mm")
    }]);
    setMensagem("");

    // Simular resposta do profissional
    setTimeout(() => {
      setMensagens(prev => [...prev, {
        remetente: agendamento?.profissional?.nome || "Profissional",
        texto: "Recebi sua mensagem. Podemos discutir isso durante a consulta.",
        hora: format(new Date(), "HH:mm")
      }]);
    }, 2000);
  };

  const encerrarConsulta = async () => {
    if (!id) return;

    await supabase
      .from("telemedicina_agendamentos")
      .update({ status: "concluido" })
      .eq("id", id);

    toast.success("Consulta encerrada. Obrigada por usar nosso serviço!");
    navigate("/telemedicina");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!agendamento) return null;

  const iniciais = agendamento.profissional?.nome
    .split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "DR";

  return (
    <div className={`min-h-screen bg-black text-white ${fullscreen ? "fixed inset-0 z-50" : ""}`}>
      {/* Área de vídeo principal */}
      <div className="relative h-[calc(100vh-120px)] bg-gradient-to-b from-gray-900 to-black">
        {aguardandoProfissional ? (
          // Aguardando profissional
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-primary/50">
                <AvatarImage src={agendamento.profissional?.foto_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-white text-3xl">
                  {iniciais}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center animate-pulse">
                <Clock className="h-4 w-4 text-black" />
              </div>
            </div>
            <h2 className="text-xl font-semibold mt-6">{agendamento.profissional?.nome}</h2>
            <p className="text-sm text-gray-400">
              {agendamento.profissional?.especialidade?.icone} {agendamento.profissional?.especialidade?.nome}
            </p>
            <p className="text-sm text-gray-500 mt-2">{agendamento.profissional?.registro_profissional}</p>
            <div className="flex items-center gap-2 mt-6 text-yellow-400">
              <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-sm">Aguardando o profissional entrar...</span>
            </div>
          </div>
        ) : (
          // Consulta em andamento
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Vídeo do profissional (simulado) */}
            <div className="relative w-full max-w-3xl aspect-video bg-gray-800 rounded-xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Avatar className="h-40 w-40 border-4 border-white/20">
                  <AvatarImage src={agendamento.profissional?.foto_url || undefined} />
                  <AvatarFallback className="bg-gray-700 text-white text-4xl">
                    {iniciais}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              {/* Nome do profissional */}
              <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg">
                <p className="text-sm font-medium">{agendamento.profissional?.nome}</p>
                <p className="text-xs text-gray-400">{agendamento.profissional?.registro_profissional}</p>
              </div>

              {/* Timer */}
              <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-lg flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-mono">{formatarTempo(tempoDecorrido)}</span>
              </div>
            </div>

            {/* Vídeo próprio (miniatura) */}
            <div className="absolute bottom-24 right-4 w-32 sm:w-48 aspect-video bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
              {videoAtivo ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                  <User className="h-12 w-12 text-gray-500" />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <VideoOff className="h-8 w-8 text-gray-600" />
                </div>
              )}
              <div className="absolute bottom-1 right-1">
                {!micAtivo && <MicOff className="h-4 w-4 text-red-500" />}
              </div>
            </div>
          </div>
        )}

        {/* Botão fullscreen */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 text-white hover:bg-white/10"
          onClick={() => setFullscreen(!fullscreen)}
        >
          {fullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </Button>
      </div>

      {/* Controles */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-white/10 p-4">
        <div className="flex items-center justify-center gap-4">
          {/* Toggle Vídeo */}
          <Button
            variant={videoAtivo ? "secondary" : "destructive"}
            size="lg"
            className="rounded-full h-14 w-14"
            onClick={() => setVideoAtivo(!videoAtivo)}
          >
            {videoAtivo ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </Button>

          {/* Toggle Microfone */}
          <Button
            variant={micAtivo ? "secondary" : "destructive"}
            size="lg"
            className="rounded-full h-14 w-14"
            onClick={() => setMicAtivo(!micAtivo)}
          >
            {micAtivo ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </Button>

          {/* Encerrar */}
          <Button
            variant="destructive"
            size="lg"
            className="rounded-full h-14 w-14"
            onClick={encerrarConsulta}
          >
            <Phone className="h-6 w-6 rotate-[135deg]" />
          </Button>

          {/* Chat */}
          <Button
            variant={chatAberto ? "default" : "secondary"}
            size="lg"
            className="rounded-full h-14 w-14"
            onClick={() => setChatAberto(!chatAberto)}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Painel de chat */}
      {chatAberto && (
        <div className="fixed right-0 top-0 bottom-[120px] w-full sm:w-80 bg-gray-900 border-l border-white/10 flex flex-col z-40">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-medium">Chat</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {mensagens.length === 0 ? (
              <p className="text-center text-gray-500 text-sm">
                Envie uma mensagem se precisar...
              </p>
            ) : (
              mensagens.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg ${
                    msg.remetente === "Você"
                      ? "bg-primary text-primary-foreground ml-8"
                      : "bg-gray-800 mr-8"
                  }`}
                >
                  <p className="text-xs font-medium mb-1">{msg.remetente}</p>
                  <p className="text-sm">{msg.texto}</p>
                  <p className="text-[10px] opacity-60 mt-1">{msg.hora}</p>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <Textarea
                placeholder="Digite sua mensagem..."
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                className="min-h-[40px] max-h-[100px] bg-gray-800 border-0 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    enviarMensagem();
                  }
                }}
              />
              <Button size="icon" onClick={enviarMensagem}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaConsulta;

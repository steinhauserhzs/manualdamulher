import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, ArrowLeft, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { criarNotificacao, getNomeUsuario } from "@/lib/notificacoes";

interface Conversa {
  id: string;
  nome: string;
  avatar_url: string | null;
  ultima_mensagem: string;
  data: string;
  nao_lidas: number;
}

interface Mensagem {
  id: string;
  conteudo: string;
  remetente_id: string;
  created_at: string;
  lida: boolean;
}

interface MensagensDirectasProps {
  destinatarioId?: string;
  onClose?: () => void;
}

export const MensagensDirectas = ({ destinatarioId, onClose }: MensagensDirectasProps) => {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [conversaAtiva, setConversaAtiva] = useState<string | null>(destinatarioId || null);
  const [perfilAtivo, setPerfilAtivo] = useState<{ nome: string; avatar_url: string | null } | null>(null);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [busca, setBusca] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    carregarUsuario();
  }, []);

  useEffect(() => {
    if (conversaAtiva) {
      carregarMensagens();
      carregarPerfilAtivo();
    }
  }, [conversaAtiva]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens]);

  const carregarUsuario = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      carregarConversas(user.id);
    }
  };

  const carregarConversas = async (uid: string) => {
    try {
      const { data: mensagensData } = await supabase
        .from("mensagens_diretas")
        .select("*")
        .or(`remetente_id.eq.${uid},destinatario_id.eq.${uid}`)
        .order("created_at", { ascending: false });

      if (!mensagensData) return;

      const contatosMap = new Map<string, { ultima: any; nao_lidas: number }>();
      
      mensagensData.forEach(msg => {
        const contatoId = msg.remetente_id === uid ? msg.destinatario_id : msg.remetente_id;
        if (!contatosMap.has(contatoId)) {
          contatosMap.set(contatoId, {
            ultima: msg,
            nao_lidas: msg.destinatario_id === uid && !msg.lida ? 1 : 0
          });
        } else {
          const atual = contatosMap.get(contatoId)!;
          if (msg.destinatario_id === uid && !msg.lida) {
            atual.nao_lidas++;
          }
        }
      });

      const contatoIds = Array.from(contatosMap.keys());
      if (contatoIds.length === 0) {
        setConversas([]);
        return;
      }

      const { data: perfis } = await supabase
        .from("perfis")
        .select("user_id, nome, avatar_url")
        .in("user_id", contatoIds);

      const conversasFormatadas: Conversa[] = contatoIds.map(id => {
        const info = contatosMap.get(id)!;
        const perfil = perfis?.find(p => p.user_id === id);
        return {
          id,
          nome: perfil?.nome || "Usuária",
          avatar_url: perfil?.avatar_url || null,
          ultima_mensagem: info.ultima.conteudo,
          data: info.ultima.created_at,
          nao_lidas: info.nao_lidas
        };
      });

      setConversas(conversasFormatadas);
    } catch (error) {
      console.error("Erro ao carregar conversas:", error);
    }
  };

  const carregarMensagens = async () => {
    if (!conversaAtiva || !userId) return;

    try {
      const { data } = await supabase
        .from("mensagens_diretas")
        .select("*")
        .or(`and(remetente_id.eq.${userId},destinatario_id.eq.${conversaAtiva}),and(remetente_id.eq.${conversaAtiva},destinatario_id.eq.${userId})`)
        .order("created_at", { ascending: true });

      setMensagens(data || []);

      await supabase
        .from("mensagens_diretas")
        .update({ lida: true })
        .eq("remetente_id", conversaAtiva)
        .eq("destinatario_id", userId);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    }
  };

  const carregarPerfilAtivo = async () => {
    if (!conversaAtiva) return;

    const { data } = await supabase
      .from("perfis")
      .select("nome, avatar_url")
      .eq("user_id", conversaAtiva)
      .single();

    setPerfilAtivo(data);
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !conversaAtiva || !userId) return;

    try {
      const { error } = await supabase.from("mensagens_diretas").insert({
        remetente_id: userId,
        destinatario_id: conversaAtiva,
        conteudo: novaMensagem.trim()
      });

      if (error) throw error;

      // Notify recipient
      const nomeUsuario = await getNomeUsuario(userId);
      const mensagemPreview = novaMensagem.trim().substring(0, 50);
      await criarNotificacao({
        userId: conversaAtiva,
        tipo: 'mensagem',
        titulo: 'Nova mensagem! ✉️',
        mensagem: `${nomeUsuario}: ${mensagemPreview}${novaMensagem.length > 50 ? '...' : ''}`,
        referenciaId: null,
        referenciaTipo: 'mensagem_direta'
      });

      setNovaMensagem("");
      carregarMensagens();
      carregarConversas(userId);
    } catch (error: any) {
      toast({ title: "Erro ao enviar mensagem", description: error.message, variant: "destructive" });
    }
  };

  const conversasFiltradas = conversas.filter(c => 
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  if (conversaAtiva) {
    return (
      <Card className="h-[500px] flex flex-col">
        <CardHeader className="border-b py-3">
          <div className="flex items-center gap-3">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => {
                setConversaAtiva(null);
                onClose?.();
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={perfilAtivo?.avatar_url || undefined} />
              <AvatarFallback>{perfilAtivo?.nome?.charAt(0) || "?"}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{perfilAtivo?.nome || "Carregando..."}</span>
          </div>
        </CardHeader>
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-3">
            {mensagens.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.remetente_id === userId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    msg.remetente_id === userId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{msg.conteudo}</p>
                  <p className={`text-xs mt-1 ${
                    msg.remetente_id === userId ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}>
                    {format(new Date(msg.created_at), "HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-3 border-t flex gap-2">
          <Input
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            placeholder="Digite sua mensagem..."
            onKeyPress={(e) => e.key === "Enter" && enviarMensagem()}
          />
          <Button onClick={enviarMensagem} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="border-b py-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-primary" />
          Mensagens
        </CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar conversas..."
            className="pl-9"
          />
        </div>
      </CardHeader>
      <ScrollArea className="flex-1">
        {conversasFiltradas.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma conversa ainda</p>
            <p className="text-sm">Visite o perfil de alguém para iniciar uma conversa</p>
          </div>
        ) : (
          conversasFiltradas.map((conversa) => (
            <div
              key={conversa.id}
              onClick={() => setConversaAtiva(conversa.id)}
              className="flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer border-b"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={conversa.avatar_url || undefined} />
                <AvatarFallback>{conversa.nome.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{conversa.nome}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(conversa.data), "dd/MM", { locale: ptBR })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {conversa.ultima_mensagem}
                </p>
              </div>
              {conversa.nao_lidas > 0 && (
                <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {conversa.nao_lidas}
                </div>
              )}
            </div>
          ))
        )}
      </ScrollArea>
    </Card>
  );
};

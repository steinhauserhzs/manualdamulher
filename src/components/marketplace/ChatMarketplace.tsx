import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, ArrowLeft, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { criarNotificacao, getNomeUsuario } from "@/lib/notificacoes";

interface Conversa {
  id: string;
  anuncio_id: string | null;
  servico_id: string | null;
  comprador_id: string;
  vendedor_id: string;
  status: string;
  anuncio_titulo?: string;
  outro_nome?: string;
  outro_avatar?: string | null;
  ultima_mensagem?: string;
  data?: string;
}

interface Mensagem {
  id: string;
  conteudo: string;
  remetente_id: string;
  created_at: string;
  lida: boolean;
}

interface ChatMarketplaceProps {
  anuncioId?: string;
  vendedorId?: string;
  anuncioTitulo?: string;
  onClose?: () => void;
}

export const ChatMarketplace = ({ anuncioId, vendedorId, anuncioTitulo, onClose }: ChatMarketplaceProps) => {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [conversaAtiva, setConversaAtiva] = useState<string | null>(null);
  const [infoConversa, setInfoConversa] = useState<Conversa | null>(null);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inicializar();
  }, []);

  useEffect(() => {
    if (conversaAtiva) {
      carregarMensagens();
    }
  }, [conversaAtiva]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens]);

  const inicializar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    if (anuncioId && vendedorId) {
      await iniciarOuBuscarConversa(user.id, anuncioId, vendedorId);
    } else {
      await carregarConversas(user.id);
    }
    setLoading(false);
  };

  const iniciarOuBuscarConversa = async (uid: string, anuncio: string, vendedor: string) => {
    const { data: conversaExistente } = await supabase
      .from("marketplace_conversas")
      .select("*")
      .eq("anuncio_id", anuncio)
      .eq("comprador_id", uid)
      .single();

    if (conversaExistente) {
      setConversaAtiva(conversaExistente.id);
      setInfoConversa({
        ...conversaExistente,
        anuncio_titulo: anuncioTitulo,
        outro_nome: "Vendedora"
      });
    } else {
      const { data: novaConversa, error } = await supabase
        .from("marketplace_conversas")
        .insert({
          anuncio_id: anuncio,
          comprador_id: uid,
          vendedor_id: vendedor
        })
        .select()
        .single();

      if (error) {
        toast({ title: "Erro ao iniciar conversa", variant: "destructive" });
        return;
      }

      setConversaAtiva(novaConversa.id);
      setInfoConversa({
        ...novaConversa,
        anuncio_titulo: anuncioTitulo,
        outro_nome: "Vendedora"
      });
    }
  };

  const carregarConversas = async (uid: string) => {
    try {
      const { data } = await supabase
        .from("marketplace_conversas")
        .select(`
          *,
          marketplace_anuncios(titulo)
        `)
        .or(`comprador_id.eq.${uid},vendedor_id.eq.${uid}`)
        .order("updated_at", { ascending: false });

      if (!data) return;

      const outrosIds = data.map(c => c.comprador_id === uid ? c.vendedor_id : c.comprador_id);
      const { data: perfis } = await supabase
        .from("perfis")
        .select("user_id, nome, avatar_url")
        .in("user_id", outrosIds);

      const conversasFormatadas = data.map(c => {
        const outroId = c.comprador_id === uid ? c.vendedor_id : c.comprador_id;
        const outroPerfil = perfis?.find(p => p.user_id === outroId);
        return {
          ...c,
          anuncio_titulo: c.marketplace_anuncios?.titulo || "Anúncio",
          outro_nome: outroPerfil?.nome || "Usuária",
          outro_avatar: outroPerfil?.avatar_url
        };
      });

      setConversas(conversasFormatadas);
    } catch (error) {
      console.error("Erro ao carregar conversas:", error);
    }
  };

  const carregarMensagens = async () => {
    if (!conversaAtiva) return;

    try {
      const { data } = await supabase
        .from("marketplace_mensagens")
        .select("*")
        .eq("conversa_id", conversaAtiva)
        .order("created_at", { ascending: true });

      setMensagens(data || []);

      if (userId) {
        await supabase
          .from("marketplace_mensagens")
          .update({ lida: true })
          .eq("conversa_id", conversaAtiva)
          .neq("remetente_id", userId);
      }
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    }
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !conversaAtiva || !userId) return;

    try {
      const { error } = await supabase.from("marketplace_mensagens").insert({
        conversa_id: conversaAtiva,
        remetente_id: userId,
        conteudo: novaMensagem.trim()
      });

      if (error) throw error;

      await supabase
        .from("marketplace_conversas")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversaAtiva);

      // Notify the other person
      if (infoConversa) {
        const outroId = infoConversa.comprador_id === userId 
          ? infoConversa.vendedor_id 
          : infoConversa.comprador_id;
        
        const nomeUsuario = await getNomeUsuario(userId);
        const titulo = infoConversa.anuncio_titulo || "um anúncio";
        
        await criarNotificacao({
          userId: outroId,
          tipo: 'marketplace',
          titulo: 'Nova mensagem no Marketplace! 🛒',
          mensagem: `${nomeUsuario} enviou mensagem sobre "${titulo}"`,
          referenciaId: infoConversa.anuncio_id,
          referenciaTipo: 'anuncio'
        });
      }

      setNovaMensagem("");
      carregarMensagens();
    } catch (error: any) {
      toast({ title: "Erro ao enviar mensagem", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <Card className="h-[500px] flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </Card>
    );
  }

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
                setInfoConversa(null);
                if (userId) carregarConversas(userId);
                onClose?.();
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <span className="font-medium">{infoConversa?.outro_nome}</span>
              {infoConversa?.anuncio_titulo && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Package className="h-3 w-3" />
                  {infoConversa.anuncio_titulo}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-3">
            {mensagens.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <p>Inicie a conversa!</p>
              </div>
            )}
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
          <MessageSquare className="h-5 w-5 text-primary" />
          Negociações
        </CardTitle>
      </CardHeader>
      <ScrollArea className="flex-1">
        {conversas.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma negociação</p>
            <p className="text-sm">Clique em "Negociar" em um anúncio para começar</p>
          </div>
        ) : (
          conversas.map((conversa) => (
            <div
              key={conversa.id}
              onClick={() => {
                setConversaAtiva(conversa.id);
                setInfoConversa(conversa);
              }}
              className="flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer border-b"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={conversa.outro_avatar || undefined} />
                <AvatarFallback>{conversa.outro_nome?.charAt(0) || "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{conversa.outro_nome}</span>
                  <Badge variant="outline" className="text-xs">
                    {conversa.status === "ativa" ? "Em aberto" : conversa.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Package className="h-3 w-3" />
                  <span className="truncate">{conversa.anuncio_titulo}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </ScrollArea>
    </Card>
  );
};

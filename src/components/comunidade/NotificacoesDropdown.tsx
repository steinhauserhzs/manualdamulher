import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, Heart, MessageCircle, UserPlus, Star, Check, Reply, Mail, ShoppingBag, AtSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Notificacao {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string | null;
  lida: boolean;
  created_at: string;
  referencia_tipo: string | null;
  referencia_id: string | null;
}

export const NotificacoesDropdown = () => {
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarNotificacoes();

    // Realtime subscription
    const channel = supabase
      .channel('notificacoes-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notificacoes' },
        () => carregarNotificacoes()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const carregarNotificacoes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("notificacoes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    setNotificacoes(data || []);
    setLoading(false);
  };

  const marcarComoLida = async (id: string) => {
    await supabase
      .from("notificacoes")
      .update({ lida: true })
      .eq("id", id);
    
    carregarNotificacoes();
  };

  const marcarTodasComoLidas = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("notificacoes")
      .update({ lida: true })
      .eq("user_id", user.id)
      .eq("lida", false);
    
    carregarNotificacoes();
  };

  const handleClickNotificacao = (notificacao: Notificacao) => {
    marcarComoLida(notificacao.id);
    
    // Navigate based on reference type
    switch (notificacao.referencia_tipo) {
      case 'post':
        if (notificacao.referencia_id) {
          navigate(`/comunidade/${notificacao.referencia_id}`);
        }
        break;
      case 'comentario':
        // Navigate to the post containing the comment
        if (notificacao.referencia_id) {
          navigate(`/comunidade/${notificacao.referencia_id}`);
        }
        break;
      case 'perfil':
        if (notificacao.referencia_id) {
          navigate(`/perfil/${notificacao.referencia_id}`);
        }
        break;
      case 'mensagem_direta':
        navigate('/comunidade?tab=mensagens');
        break;
      case 'anuncio':
        navigate('/marketplace');
        break;
      default:
        // Stay on current page
        break;
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "like":
        return <Heart className="h-4 w-4 text-rose-500" />;
      case "comentario":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "resposta":
        return <Reply className="h-4 w-4 text-cyan-500" />;
      case "seguidor":
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case "mensagem":
        return <Mail className="h-4 w-4 text-purple-500" />;
      case "marketplace":
        return <ShoppingBag className="h-4 w-4 text-orange-500" />;
      case "mencao":
        return <AtSign className="h-4 w-4 text-pink-500" />;
      case "badge":
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {naoLidas > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {naoLidas > 9 ? "9+" : naoLidas}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-2 border-b">
          <span className="font-semibold text-sm">Notificações</span>
          {naoLidas > 0 && (
            <Button variant="ghost" size="sm" onClick={marcarTodasComoLidas} className="text-xs">
              <Check className="h-3 w-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>
        
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">
            Carregando...
          </div>
        ) : notificacoes.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            Nenhuma notificação
          </div>
        ) : (
          notificacoes.map((notificacao) => (
            <DropdownMenuItem
              key={notificacao.id}
              onClick={() => handleClickNotificacao(notificacao)}
              className={`flex items-start gap-3 p-3 cursor-pointer ${!notificacao.lida ? 'bg-primary/5' : ''}`}
            >
              <div className="mt-0.5">{getIcon(notificacao.tipo)}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!notificacao.lida ? 'font-medium' : ''}`}>
                  {notificacao.titulo}
                </p>
                {notificacao.mensagem && (
                  <p className="text-xs text-muted-foreground truncate">
                    {notificacao.mensagem}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(notificacao.created_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </p>
              </div>
              {!notificacao.lida && (
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

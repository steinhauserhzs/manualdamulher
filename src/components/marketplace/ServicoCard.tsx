import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Trash2, Instagram } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ServicoCardProps {
  servico: {
    id: string;
    user_id: string;
    titulo: string;
    descricao: string | null;
    categoria: string;
    preco_minimo: number | null;
    preco_maximo: number | null;
    tipo_preco: string;
    imagens: string[];
    contato_whatsapp: string | null;
    contato_instagram: string | null;
    created_at: string;
    status?: string;
    perfil?: {
      nome: string;
      avatar_url: string | null;
    };
  };
  currentUserId: string | null;
  onUpdate: () => void;
  isOwner?: boolean;
}

const categoriaLabel: Record<string, string> = {
  beleza: "Beleza e Estética",
  saude: "Saúde e Bem-estar",
  educacao: "Educação e Aulas",
  tecnologia: "Tecnologia",
  casa: "Serviços Domésticos",
  moda: "Moda e Costura",
  alimentacao: "Alimentação",
  eventos: "Eventos e Festas",
  consultoria: "Consultoria",
  outros: "Outros"
};

export const ServicoCard = ({ servico, currentUserId, onUpdate, isOwner }: ServicoCardProps) => {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("marketplace_servicos")
        .delete()
        .eq("id", servico.id);

      if (error) throw error;

      toast({ title: "Serviço excluído com sucesso!" });
      onUpdate();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o serviço.",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatPrice = () => {
    if (servico.tipo_preco === "negociavel") return "A combinar";
    if (servico.preco_minimo && servico.preco_maximo) {
      return `R$ ${servico.preco_minimo.toLocaleString("pt-BR")} - R$ ${servico.preco_maximo.toLocaleString("pt-BR")}`;
    }
    if (servico.preco_minimo) {
      return `A partir de R$ ${servico.preco_minimo.toLocaleString("pt-BR")}`;
    }
    return "A combinar";
  };

  const isUserOwner = isOwner || currentUserId === servico.user_id;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="aspect-video bg-muted relative">
        {servico.imagens && servico.imagens.length > 0 ? (
          <img
            src={servico.imagens[0]}
            alt={servico.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            💼
          </div>
        )}
        <Badge className="absolute top-2 right-2" variant="secondary">
          {categoriaLabel[servico.categoria] || servico.categoria}
        </Badge>
        {servico.status === "inativo" && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="outline">Inativo</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground line-clamp-2">{servico.titulo}</h3>
        <p className="text-lg font-bold text-primary">{formatPrice()}</p>
        {servico.descricao && (
          <p className="text-sm text-muted-foreground line-clamp-2">{servico.descricao}</p>
        )}
        
        {/* User info */}
        {servico.perfil && (
          <Link to={`/perfil/${servico.user_id}`} className="flex items-center gap-2 mt-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={servico.perfil.avatar_url || undefined} />
              <AvatarFallback>{servico.perfil.nome.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground hover:text-primary">
              {servico.perfil.nome}
            </span>
          </Link>
        )}

        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(servico.created_at), { addSuffix: true, locale: ptBR })}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        {isUserOwner ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </Button>
        ) : (
          <>
            {servico.contato_whatsapp && (
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <a 
                  href={`https://wa.me/${servico.contato_whatsapp.replace(/\D/g, "")}?text=Olá! Vi seu serviço "${servico.titulo}" no Manual da Mulher Independente!`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  WhatsApp
                </a>
              </Button>
            )}
            {servico.contato_instagram && (
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <a 
                  href={`https://instagram.com/${servico.contato_instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="h-4 w-4 mr-1" />
                  Instagram
                </a>
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};

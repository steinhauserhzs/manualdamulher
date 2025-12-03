import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Trash2, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AnuncioCardProps {
  anuncio: {
    id: string;
    user_id: string;
    titulo: string;
    descricao: string | null;
    preco: number;
    categoria: string;
    condicao: string;
    imagens: string[];
    visualizacoes?: number;
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

const condicaoLabel: Record<string, string> = {
  novo: "Novo",
  usado_otimo: "Usado - Ótimo",
  usado_bom: "Usado - Bom",
  usado_regular: "Usado - Regular"
};

export const AnuncioCard = ({ anuncio, currentUserId, onUpdate, isOwner }: AnuncioCardProps) => {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este anúncio?")) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("marketplace_anuncios")
        .delete()
        .eq("id", anuncio.id);

      if (error) throw error;

      toast({ title: "Anúncio excluído com sucesso!" });
      onUpdate();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o anúncio.",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  const isUserOwner = isOwner || currentUserId === anuncio.user_id;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="aspect-square bg-muted relative">
        {anuncio.imagens && anuncio.imagens.length > 0 ? (
          <img
            src={anuncio.imagens[0]}
            alt={anuncio.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            👗
          </div>
        )}
        <Badge className="absolute top-2 right-2" variant="secondary">
          {condicaoLabel[anuncio.condicao] || anuncio.condicao}
        </Badge>
        {anuncio.status === "inativo" && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="outline">Inativo</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground line-clamp-2">{anuncio.titulo}</h3>
        <p className="text-xl font-bold text-primary">
          R$ {anuncio.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
        {anuncio.descricao && (
          <p className="text-sm text-muted-foreground line-clamp-2">{anuncio.descricao}</p>
        )}
        
        {/* User info */}
        {anuncio.perfil && (
          <Link to={`/perfil/${anuncio.user_id}`} className="flex items-center gap-2 mt-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={anuncio.perfil.avatar_url || undefined} />
              <AvatarFallback>{anuncio.perfil.nome.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground hover:text-primary">
              {anuncio.perfil.nome}
            </span>
          </Link>
        )}

        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(anuncio.created_at), { addSuffix: true, locale: ptBR })}
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
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a 
              href={`https://wa.me/?text=Olá! Vi seu anúncio "${anuncio.titulo}" no Manual da Mulher Independente e tenho interesse!`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Contato
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

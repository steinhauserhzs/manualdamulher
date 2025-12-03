import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Trash2, Instagram, Globe, MapPin, CheckCircle } from "lucide-react";

interface ParceiroCardProps {
  parceiro: {
    id: string;
    user_id: string;
    nome_estabelecimento: string;
    descricao: string | null;
    categoria: string;
    endereco: string | null;
    cidade: string | null;
    estado: string | null;
    telefone: string | null;
    whatsapp: string | null;
    instagram: string | null;
    website: string | null;
    logo_url: string | null;
    verificado: boolean;
    status?: string;
  };
  currentUserId: string | null;
  onUpdate: () => void;
  isOwner?: boolean;
}

const categoriaLabel: Record<string, string> = {
  alimentacao: "Alimentação",
  beleza: "Beleza e Estética",
  moda: "Moda e Acessórios",
  saude: "Saúde e Bem-estar",
  educacao: "Educação",
  servicos: "Serviços Gerais",
  pets: "Pets",
  casa: "Casa e Decoração",
  outros: "Outros"
};

export const ParceiroCard = ({ parceiro, currentUserId, onUpdate, isOwner }: ParceiroCardProps) => {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este parceiro?")) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("marketplace_parceiros")
        .delete()
        .eq("id", parceiro.id);

      if (error) throw error;

      toast({ title: "Parceiro excluído com sucesso!" });
      onUpdate();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o parceiro.",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  const isUserOwner = isOwner || currentUserId === parceiro.user_id;
  const location = [parceiro.cidade, parceiro.estado].filter(Boolean).join(", ");

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Logo */}
      <div className="aspect-video bg-gradient-to-br from-emerald-100 to-teal-100 relative flex items-center justify-center">
        {parceiro.logo_url ? (
          <img
            src={parceiro.logo_url}
            alt={parceiro.nome_estabelecimento}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-5xl">🏪</div>
        )}
        {parceiro.verificado && (
          <Badge className="absolute top-2 right-2 bg-emerald-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verificado
          </Badge>
        )}
        {parceiro.status === "inativo" && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="outline">Inativo</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-foreground line-clamp-2">{parceiro.nome_estabelecimento}</h3>
        </div>
        
        <Badge variant="secondary" className="text-xs">
          {categoriaLabel[parceiro.categoria] || parceiro.categoria}
        </Badge>

        {parceiro.descricao && (
          <p className="text-sm text-muted-foreground line-clamp-2">{parceiro.descricao}</p>
        )}
        
        {location && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {location}
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
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
            {parceiro.whatsapp && (
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <a 
                  href={`https://wa.me/${parceiro.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              </Button>
            )}
            {parceiro.instagram && (
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <a 
                  href={`https://instagram.com/${parceiro.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
            )}
            {parceiro.website && (
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <a 
                  href={parceiro.website.startsWith("http") ? parceiro.website : `https://${parceiro.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="h-4 w-4" />
                </a>
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};

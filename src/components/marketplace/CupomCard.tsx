import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Trash2, Calendar, Tag, Store } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CupomCardProps {
  cupom: {
    id: string;
    user_id: string;
    parceiro_id: string | null;
    codigo: string;
    titulo: string;
    descricao: string | null;
    tipo_desconto: string;
    valor_desconto: number;
    valor_minimo: number | null;
    data_inicio: string;
    data_fim: string | null;
    limite_uso: number | null;
    usos_atuais: number;
    status?: string;
    parceiro?: {
      nome_estabelecimento: string;
      logo_url: string | null;
    };
  };
  currentUserId: string | null;
  onUpdate: () => void;
  isOwner?: boolean;
}

export const CupomCard = ({ cupom, currentUserId, onUpdate, isOwner }: CupomCardProps) => {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este cupom?")) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("marketplace_cupons")
        .delete()
        .eq("id", cupom.id);

      if (error) throw error;

      toast({ title: "Cupom excluído com sucesso!" });
      onUpdate();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cupom.",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(cupom.codigo);
    toast({ title: "Código copiado!", description: cupom.codigo });
  };

  const formatDiscount = () => {
    if (cupom.tipo_desconto === "percentual") {
      return `${cupom.valor_desconto}% OFF`;
    }
    return `R$ ${cupom.valor_desconto.toLocaleString("pt-BR")} OFF`;
  };

  const isUserOwner = isOwner || currentUserId === cupom.user_id;
  const isExpired = cupom.data_fim && new Date(cupom.data_fim) < new Date();
  const isLimitReached = cupom.limite_uso && cupom.usos_atuais >= cupom.limite_uso;

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${isExpired || isLimitReached ? "opacity-60" : ""}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <Tag className="h-6 w-6" />
          <span className="text-2xl font-bold">{formatDiscount()}</span>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-foreground">{cupom.titulo}</h3>
        
        {cupom.parceiro && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Store className="h-4 w-4" />
            {cupom.parceiro.nome_estabelecimento}
          </div>
        )}

        {cupom.descricao && (
          <p className="text-sm text-muted-foreground line-clamp-2">{cupom.descricao}</p>
        )}

        {/* Code */}
        <div className="bg-muted p-3 rounded-lg flex items-center justify-between">
          <code className="font-mono font-bold text-primary">{cupom.codigo}</code>
          <Button variant="ghost" size="sm" onClick={copyCode}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        {/* Info */}
        <div className="space-y-1 text-xs text-muted-foreground">
          {cupom.valor_minimo && (
            <p>Compra mínima: R$ {cupom.valor_minimo.toLocaleString("pt-BR")}</p>
          )}
          {cupom.data_fim && (
            <p className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Válido até {format(new Date(cupom.data_fim), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          )}
          {cupom.limite_uso && (
            <p>{cupom.usos_atuais}/{cupom.limite_uso} usos</p>
          )}
        </div>

        {/* Status badges */}
        <div className="flex gap-2">
          {isExpired && <Badge variant="destructive">Expirado</Badge>}
          {isLimitReached && <Badge variant="secondary">Esgotado</Badge>}
        </div>
      </CardContent>

      {isUserOwner && (
        <CardFooter className="p-4 pt-0">
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
        </CardFooter>
      )}
    </Card>
  );
};

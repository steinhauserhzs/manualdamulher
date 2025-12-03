import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface CriarCupomDialogProps {
  parceiros: Array<{ id: string; nome_estabelecimento: string }>;
  onClose: () => void;
  onSuccess: () => void;
}

export const CriarCupomDialog = ({ parceiros, onClose, onSuccess }: CriarCupomDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    parceiro_id: "",
    codigo: "",
    titulo: "",
    descricao: "",
    tipo_desconto: "percentual",
    valor_desconto: "",
    valor_minimo: "",
    data_fim: "",
    limite_uso: ""
  });

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, codigo: code }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.parceiro_id || !formData.codigo || !formData.titulo || !formData.valor_desconto) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha parceiro, código, título e valor do desconto.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("marketplace_cupons").insert({
        user_id: user.id,
        parceiro_id: formData.parceiro_id,
        codigo: formData.codigo.toUpperCase().trim(),
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim() || null,
        tipo_desconto: formData.tipo_desconto,
        valor_desconto: parseFloat(formData.valor_desconto.replace(",", ".")),
        valor_minimo: formData.valor_minimo ? parseFloat(formData.valor_minimo.replace(",", ".")) : null,
        data_fim: formData.data_fim || null,
        limite_uso: formData.limite_uso ? parseInt(formData.limite_uso) : null
      });

      if (error) throw error;

      toast({ title: "Cupom criado com sucesso!" });
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao criar cupom:", error);
      toast({
        title: "Erro",
        description: error.message?.includes("unique") 
          ? "Este código já está em uso. Tente outro." 
          : "Não foi possível criar o cupom.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Criar Cupom de Desconto</DialogTitle>
        <DialogDescription>
          Crie um cupom exclusivo para a comunidade.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Estabelecimento *</Label>
          <Select
            value={formData.parceiro_id}
            onValueChange={(value) => setFormData(prev => ({ ...prev, parceiro_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione seu estabelecimento" />
            </SelectTrigger>
            <SelectContent>
              {parceiros.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.nome_estabelecimento}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Código do Cupom *</Label>
          <div className="flex gap-2">
            <Input
              value={formData.codigo}
              onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value.toUpperCase() }))}
              placeholder="DESCONTO10"
              maxLength={20}
              className="uppercase"
            />
            <Button type="button" variant="outline" onClick={generateCode}>
              Gerar
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Título do Cupom *</Label>
          <Input
            value={formData.titulo}
            onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
            placeholder="Ex: 10% de desconto em todos os serviços"
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label>Descrição</Label>
          <Textarea
            value={formData.descricao}
            onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
            placeholder="Detalhes sobre o cupom, regras de uso..."
            rows={2}
            maxLength={300}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipo de Desconto</Label>
            <Select
              value={formData.tipo_desconto}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_desconto: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentual">Percentual (%)</SelectItem>
                <SelectItem value="fixo">Valor Fixo (R$)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Valor do Desconto *</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={formData.valor_desconto}
              onChange={(e) => setFormData(prev => ({ ...prev, valor_desconto: e.target.value }))}
              placeholder={formData.tipo_desconto === "percentual" ? "10" : "50,00"}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Compra Mínima (R$)</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={formData.valor_minimo}
              onChange={(e) => setFormData(prev => ({ ...prev, valor_minimo: e.target.value }))}
              placeholder="Opcional"
            />
          </div>

          <div className="space-y-2">
            <Label>Limite de Usos</Label>
            <Input
              type="number"
              value={formData.limite_uso}
              onChange={(e) => setFormData(prev => ({ ...prev, limite_uso: e.target.value }))}
              placeholder="Opcional"
              min="1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Data de Expiração</Label>
          <Input
            type="date"
            value={formData.data_fim}
            onChange={(e) => setFormData(prev => ({ ...prev, data_fim: e.target.value }))}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Criar Cupom
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

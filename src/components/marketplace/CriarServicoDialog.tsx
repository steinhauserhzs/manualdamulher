import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X } from "lucide-react";

interface CriarServicoDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

const categorias = [
  { value: "beleza", label: "Beleza e Estética" },
  { value: "saude", label: "Saúde e Bem-estar" },
  { value: "educacao", label: "Educação e Aulas" },
  { value: "tecnologia", label: "Tecnologia" },
  { value: "casa", label: "Serviços Domésticos" },
  { value: "moda", label: "Moda e Costura" },
  { value: "alimentacao", label: "Alimentação" },
  { value: "eventos", label: "Eventos e Festas" },
  { value: "consultoria", label: "Consultoria" },
  { value: "outros", label: "Outros" }
];

export const CriarServicoDialog = ({ onClose, onSuccess }: CriarServicoDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    categoria: "",
    preco_minimo: "",
    preco_maximo: "",
    tipo_preco: "negociavel",
    contato_whatsapp: "",
    contato_instagram: "",
    imagens: [] as string[]
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const newImages: string[] = [];

      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("marketplace-imagens")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("marketplace-imagens")
          .getPublicUrl(fileName);

        newImages.push(publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        imagens: [...prev.imagens, ...newImages].slice(0, 5)
      }));
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar as imagens.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imagens: prev.imagens.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.categoria) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título e categoria.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("marketplace_servicos").insert({
        user_id: user.id,
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim() || null,
        categoria: formData.categoria,
        preco_minimo: formData.preco_minimo ? parseFloat(formData.preco_minimo.replace(",", ".")) : null,
        preco_maximo: formData.preco_maximo ? parseFloat(formData.preco_maximo.replace(",", ".")) : null,
        tipo_preco: formData.tipo_preco,
        contato_whatsapp: formData.contato_whatsapp.trim() || null,
        contato_instagram: formData.contato_instagram.trim() || null,
        imagens: formData.imagens
      });

      if (error) throw error;

      toast({ title: "Serviço cadastrado com sucesso!" });
      onSuccess();
    } catch (error) {
      console.error("Erro ao criar serviço:", error);
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o serviço.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Oferecer Serviço</DialogTitle>
        <DialogDescription>
          Cadastre seus serviços para a comunidade encontrar.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="titulo">Título do Serviço *</Label>
          <Input
            id="titulo"
            value={formData.titulo}
            onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
            placeholder="Ex: Design de unhas artísticas"
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            value={formData.descricao}
            onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
            placeholder="Descreva o que você oferece, sua experiência..."
            rows={3}
            maxLength={500}
          />
        </div>

        <div className="space-y-2">
          <Label>Categoria *</Label>
          <Select
            value={formData.categoria}
            onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tipo de Preço</Label>
          <Select
            value={formData.tipo_preco}
            onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_preco: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="negociavel">A combinar</SelectItem>
              <SelectItem value="fixo">Preço fixo</SelectItem>
              <SelectItem value="faixa">Faixa de preço</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.tipo_preco !== "negociavel" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preço Mínimo (R$)</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={formData.preco_minimo}
                onChange={(e) => setFormData(prev => ({ ...prev, preco_minimo: e.target.value }))}
                placeholder="0,00"
              />
            </div>
            {formData.tipo_preco === "faixa" && (
              <div className="space-y-2">
                <Label>Preço Máximo (R$)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={formData.preco_maximo}
                  onChange={(e) => setFormData(prev => ({ ...prev, preco_maximo: e.target.value }))}
                  placeholder="0,00"
                />
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>WhatsApp</Label>
            <Input
              value={formData.contato_whatsapp}
              onChange={(e) => setFormData(prev => ({ ...prev, contato_whatsapp: e.target.value }))}
              placeholder="11999999999"
            />
          </div>
          <div className="space-y-2">
            <Label>Instagram</Label>
            <Input
              value={formData.contato_instagram}
              onChange={(e) => setFormData(prev => ({ ...prev, contato_instagram: e.target.value }))}
              placeholder="@seuperfil"
            />
          </div>
        </div>

        {/* Images */}
        <div className="space-y-2">
          <Label>Fotos do trabalho (máx. 5)</Label>
          <div className="flex flex-wrap gap-2">
            {formData.imagens.map((img, index) => (
              <div key={index} className="relative w-20 h-20">
                <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {formData.imagens.length < 5 && (
              <label className="w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Upload className="h-5 w-5 text-muted-foreground" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={loading || uploading} className="flex-1">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Cadastrar Serviço
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

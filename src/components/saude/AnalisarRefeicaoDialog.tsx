import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Upload, Loader2, Utensils, Sparkles } from "lucide-react";

interface AnalisarRefeicaoDialogProps {
  userId: string;
  onRefeicaoAdded: () => void;
}

interface AnaliseResultado {
  alimentos: { nome: string; porcao: string; calorias: number }[];
  totais: {
    calorias: number;
    proteinas: number;
    carboidratos: number;
    gorduras: number;
    fibras: number;
  };
  observacoes: string;
}

export function AnalisarRefeicaoDialog({ userId, onRefeicaoAdded }: AnalisarRefeicaoDialogProps) {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState("almoco");
  const [descricao, setDescricao] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analisando, setAnalisando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [resultado, setResultado] = useState<AnaliseResultado | null>(null);
  const [modoManual, setModoManual] = useState(false);
  const [caloriasManual, setCaloriasManual] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "Arquivo muito grande", description: "Máximo 10MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResultado(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalisar = async () => {
    if (!imagePreview && !descricao) {
      toast({ title: "Atenção", description: "Adicione uma foto ou descrição da refeição", variant: "destructive" });
      return;
    }

    setAnalisando(true);
    try {
      const { data, error } = await supabase.functions.invoke("analisar-refeicao", {
        body: { 
          imageBase64: imagePreview,
          descricao 
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setResultado(data.analise);
      toast({ title: "Análise concluída!", description: "Revise os valores e salve a refeição." });
    } catch (error) {
      console.error("Erro ao analisar:", error);
      toast({ 
        title: "Erro na análise", 
        description: error instanceof Error ? error.message : "Tente novamente", 
        variant: "destructive" 
      });
    } finally {
      setAnalisando(false);
    }
  };

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      const refeicaoData: any = {
        user_id: userId,
        tipo,
        descricao: descricao || resultado?.alimentos.map(a => a.nome).join(", ") || "Refeição",
        data_hora: new Date().toISOString(),
      };

      if (resultado) {
        refeicaoData.calorias = resultado.totais.calorias;
        refeicaoData.proteinas = resultado.totais.proteinas;
        refeicaoData.carboidratos = resultado.totais.carboidratos;
        refeicaoData.gorduras = resultado.totais.gorduras;
        refeicaoData.fibras = resultado.totais.fibras;
        refeicaoData.alimentos_identificados = resultado.alimentos;
      } else if (modoManual && caloriasManual) {
        refeicaoData.calorias = parseInt(caloriasManual);
      }

      const { error } = await supabase.from("refeicoes").insert(refeicaoData);
      if (error) throw error;

      toast({ title: "Refeição salva!", description: "Sua refeição foi registrada com sucesso." });
      resetForm();
      setOpen(false);
      onRefeicaoAdded();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({ title: "Erro", description: "Não foi possível salvar a refeição.", variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  };

  const resetForm = () => {
    setTipo("almoco");
    setDescricao("");
    setImagePreview(null);
    setResultado(null);
    setModoManual(false);
    setCaloriasManual("");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Utensils className="h-4 w-4" />
          Registrar Refeição
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-orange-500" />
            Nova Refeição
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tipo de refeição */}
          <div className="space-y-2">
            <Label>Tipo de refeição</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cafe">☕ Café da manhã</SelectItem>
                <SelectItem value="lanche_manha">🍎 Lanche da manhã</SelectItem>
                <SelectItem value="almoco">🍽️ Almoço</SelectItem>
                <SelectItem value="lanche_tarde">🥪 Lanche da tarde</SelectItem>
                <SelectItem value="jantar">🌙 Jantar</SelectItem>
                <SelectItem value="ceia">🍵 Ceia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Upload de foto */}
          <div className="space-y-2">
            <Label>Foto da refeição (opcional)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setImagePreview(null)}
                >
                  Remover
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                  Tirar Foto
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Enviar
                </Button>
              </div>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição da refeição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Arroz, feijão, frango grelhado e salada..."
              rows={3}
            />
          </div>

          {/* Botão Analisar com IA */}
          {!resultado && !modoManual && (
            <Button 
              onClick={handleAnalisar} 
              disabled={analisando || (!imagePreview && !descricao)}
              className="w-full gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
            >
              {analisando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analisando com IA...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analisar com IA
                </>
              )}
            </Button>
          )}

          {/* Modo manual */}
          {!resultado && (
            <div className="text-center">
              <Button 
                variant="link" 
                onClick={() => setModoManual(!modoManual)}
                className="text-sm text-muted-foreground"
              >
                {modoManual ? "Usar análise com IA" : "Prefiro inserir manualmente"}
              </Button>
            </div>
          )}

          {modoManual && !resultado && (
            <div className="space-y-2">
              <Label htmlFor="calorias">Calorias (estimativa)</Label>
              <Input
                id="calorias"
                type="number"
                value={caloriasManual}
                onChange={(e) => setCaloriasManual(e.target.value)}
                placeholder="Ex: 500"
              />
            </div>
          )}

          {/* Resultado da análise */}
          {resultado && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500" />
                Análise Nutricional
              </h4>
              
              {/* Alimentos identificados */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Alimentos identificados:</p>
                <ul className="text-sm space-y-1">
                  {resultado.alimentos.map((alimento, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{alimento.nome} ({alimento.porcao})</span>
                      <span className="text-muted-foreground">{alimento.calorias} kcal</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Totais */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                <div className="text-center p-2 bg-background rounded">
                  <p className="text-2xl font-bold text-orange-500">{resultado.totais.calorias}</p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </div>
                <div className="text-center p-2 bg-background rounded">
                  <p className="text-lg font-semibold">{resultado.totais.proteinas}g</p>
                  <p className="text-xs text-muted-foreground">proteínas</p>
                </div>
                <div className="text-center p-2 bg-background rounded">
                  <p className="text-lg font-semibold">{resultado.totais.carboidratos}g</p>
                  <p className="text-xs text-muted-foreground">carboidratos</p>
                </div>
                <div className="text-center p-2 bg-background rounded">
                  <p className="text-lg font-semibold">{resultado.totais.gorduras}g</p>
                  <p className="text-xs text-muted-foreground">gorduras</p>
                </div>
              </div>

              {resultado.observacoes && (
                <p className="text-sm text-muted-foreground italic">
                  💡 {resultado.observacoes}
                </p>
              )}

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setResultado(null)}
                className="w-full"
              >
                Analisar novamente
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSalvar} 
            disabled={salvando || (!resultado && !modoManual) || (modoManual && !caloriasManual && !descricao)}
          >
            {salvando ? "Salvando..." : "Salvar Refeição"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

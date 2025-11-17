import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Smile } from "lucide-react";

interface HumorDialogProps {
  userId: string;
  onHumorSalvo: () => void;
}

export const HumorDialog = ({ userId, onHumorSalvo }: HumorDialogProps) => {
  const [open, setOpen] = useState(false);
  const [humor, setHumor] = useState("ok");
  const [energia, setEnergia] = useState([5]);
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      carregarResumoHoje();
    }
  }, [open]);

  const carregarResumoHoje = async () => {
    const hoje = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("saude_resumo_diario")
      .select("*")
      .eq("user_id", userId)
      .eq("data", hoje)
      .maybeSingle();

    if (data) {
      setHumor(data.humor || "ok");
      setEnergia([data.energia || 5]);
      setNotas(data.notas || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const hoje = new Date().toISOString().split("T")[0];

      const { error } = await supabase
        .from("saude_resumo_diario")
        .upsert({
          user_id: userId,
          data: hoje,
          humor,
          energia: energia[0],
          notas: notas || null,
        }, {
          onConflict: "user_id,data"
        });

      if (error) throw error;

      toast.success("Resumo do dia salvo!");
      setOpen(false);
      onHumorSalvo();
    } catch (error) {
      toast.error("Erro ao salvar resumo");
    } finally {
      setLoading(false);
    }
  };

  const humores = [
    { value: "ótimo", emoji: "😄", label: "Ótimo" },
    { value: "bom", emoji: "😊", label: "Bom" },
    { value: "ok", emoji: "😐", label: "Ok" },
    { value: "cansada", emoji: "😔", label: "Cansada" },
    { value: "sobrecarregada", emoji: "😰", label: "Sobrecarregada" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Smile className="mr-2 h-4 w-4" />
          Como está seu dia?
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resumo do Dia</DialogTitle>
          <DialogDescription>Como você está se sentindo hoje?</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Humor</Label>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {humores.map((h) => (
                <button
                  key={h.value}
                  type="button"
                  onClick={() => setHumor(h.value)}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 transition-all ${
                    humor === h.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-2xl">{h.emoji}</span>
                  <span className="text-xs">{h.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Nível de Energia</Label>
              <span className="text-sm font-semibold text-primary">{energia[0]}/10</span>
            </div>
            <Slider
              value={energia}
              onValueChange={setEnergia}
              min={0}
              max={10}
              step={1}
              className="cursor-pointer"
            />
          </div>

          <div>
            <Label htmlFor="notas">Notas do Dia (opcional)</Label>
            <Textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Como foi seu dia? Algo especial aconteceu?"
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

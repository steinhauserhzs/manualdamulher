import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Star } from "lucide-react";

interface AvaliarConsultaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendamentoId: string;
  profissionalNome: string;
  onAvaliacaoEnviada: () => void;
}

export const AvaliarConsultaDialog = ({
  open,
  onOpenChange,
  agendamentoId,
  profissionalNome,
  onAvaliacaoEnviada
}: AvaliarConsultaDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [nota, setNota] = useState(0);
  const [hoverNota, setHoverNota] = useState(0);
  const [comentario, setComentario] = useState("");

  const handleSubmit = async () => {
    if (nota === 0) {
      toast.error("Por favor, selecione uma nota");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("telemedicina_agendamentos")
      .update({
        avaliacao_paciente: nota,
        comentario_avaliacao: comentario || null
      })
      .eq("id", agendamentoId);

    setLoading(false);

    if (error) {
      toast.error("Erro ao enviar avaliação");
      console.error(error);
      return;
    }

    toast.success("Obrigada pela sua avaliação! 💜");
    setNota(0);
    setComentario("");
    onAvaliacaoEnviada();
    onOpenChange(false);
  };

  const descricaoNota = [
    "",
    "Muito insatisfeita",
    "Insatisfeita",
    "Regular",
    "Satisfeita",
    "Muito satisfeita"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Avaliar Consulta
          </DialogTitle>
          <DialogDescription>
            Como foi sua experiência com {profissionalNome}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Estrelas */}
          <div className="space-y-2 text-center">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((estrela) => (
                <button
                  key={estrela}
                  type="button"
                  className="p-1 transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverNota(estrela)}
                  onMouseLeave={() => setHoverNota(0)}
                  onClick={() => setNota(estrela)}
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      (hoverNota || nota) >= estrela
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground h-5">
              {descricaoNota[hoverNota || nota]}
            </p>
          </div>

          {/* Comentário */}
          <div className="space-y-2">
            <Label htmlFor="comentario">Deixe um comentário (opcional)</Label>
            <Textarea
              id="comentario"
              placeholder="Conte como foi sua experiência..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Pular
          </Button>
          <Button onClick={handleSubmit} disabled={loading || nota === 0}>
            {loading ? "Enviando..." : "Enviar Avaliação"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

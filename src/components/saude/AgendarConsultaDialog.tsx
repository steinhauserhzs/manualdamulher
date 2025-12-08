import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { format, addDays, setHours, setMinutes, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Clock, Check, ArrowLeft, ArrowRight, Star } from "lucide-react";

interface Profissional {
  id: string;
  nome: string;
  registro_profissional: string;
  foto_url: string | null;
  valor_consulta: number;
  duracao_consulta: number;
  avaliacao_media: number;
  especialidade?: {
    nome: string;
    icone: string;
    tipo: string;
  } | null;
}

interface AgendarConsultaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profissional: Profissional | null;
  userId: string;
  onAgendamentoCriado: () => void;
}

// Horários disponíveis simulados (em produção virá da API do parceiro)
const horariosDisponiveis = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"
];

export const AgendarConsultaDialog = ({
  open,
  onOpenChange,
  profissional,
  userId,
  onAgendamentoCriado
}: AgendarConsultaDialogProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    motivo: "",
    primeiraConsulta: true,
    data: undefined as Date | undefined,
    horario: "",
    aceitaTermos: false
  });

  const resetForm = () => {
    setStep(1);
    setForm({
      motivo: "",
      primeiraConsulta: true,
      data: undefined,
      horario: "",
      aceitaTermos: false
    });
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!profissional || !form.data || !form.horario) return;

    setLoading(true);

    // Criar data/hora completa
    const [hora, minuto] = form.horario.split(":").map(Number);
    const dataHora = setMinutes(setHours(form.data, hora), minuto);

    const { error } = await supabase
      .from("telemedicina_agendamentos")
      .insert({
        user_id: userId,
        profissional_id: profissional.id,
        data_hora: dataHora.toISOString(),
        duracao_minutos: profissional.duracao_consulta,
        tipo: profissional.especialidade?.tipo === "psicologia" ? "telepsicologia" : "telemedicina",
        status: "agendado",
        motivo_consulta: form.motivo || null,
        valor: profissional.valor_consulta
      });

    setLoading(false);

    if (error) {
      toast.error("Erro ao agendar consulta");
      console.error(error);
      return;
    }

    toast.success("Consulta agendada com sucesso! 🎉");
    onAgendamentoCriado();
    handleClose();
  };

  if (!profissional) return null;

  const iniciais = profissional.nome
    .split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Agendar Consulta
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Conte-nos sobre o motivo da consulta"}
            {step === 2 && "Escolha a data e horário"}
            {step === 3 && "Confirme seu agendamento"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-2 w-12 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Profissional resumo */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profissional.foto_url || undefined} />
            <AvatarFallback>{iniciais}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm line-clamp-1">{profissional.nome}</p>
            <p className="text-xs text-muted-foreground">
              {profissional.especialidade?.icone} {profissional.especialidade?.nome}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs">{Number(profissional.avaliacao_media).toFixed(1)}</span>
          </div>
        </div>

        <div className="py-4">
          {/* Step 1: Motivo */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="motivo">Qual o motivo da consulta? (opcional)</Label>
                <Textarea
                  id="motivo"
                  placeholder="Descreva brevemente seus sintomas ou o que gostaria de discutir..."
                  value={form.motivo}
                  onChange={(e) => setForm(prev => ({ ...prev, motivo: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="primeira"
                  checked={form.primeiraConsulta}
                  onCheckedChange={(checked) => 
                    setForm(prev => ({ ...prev, primeiraConsulta: checked as boolean }))
                  }
                />
                <Label htmlFor="primeira" className="text-sm">
                  Esta é minha primeira consulta com este profissional
                </Label>
              </div>
            </div>
          )}

          {/* Step 2: Data e Horário */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Escolha a data</Label>
                <Calendar
                  mode="single"
                  selected={form.data}
                  onSelect={(date) => setForm(prev => ({ ...prev, data: date, horario: "" }))}
                  disabled={(date) => 
                    isBefore(date, new Date()) || 
                    isBefore(addDays(new Date(), 30), date)
                  }
                  locale={ptBR}
                  className="rounded-md border mx-auto"
                />
              </div>

              {form.data && (
                <div className="space-y-2">
                  <Label>Horários disponíveis para {format(form.data, "dd/MM", { locale: ptBR })}</Label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {horariosDisponiveis.map(horario => (
                      <Button
                        key={horario}
                        variant={form.horario === horario ? "default" : "outline"}
                        size="sm"
                        onClick={() => setForm(prev => ({ ...prev, horario }))}
                        className="text-xs"
                      >
                        {horario}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirmação */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-sm">Resumo do Agendamento</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profissional:</span>
                    <span className="font-medium">{profissional.nome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Especialidade:</span>
                    <span>{profissional.especialidade?.nome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data:</span>
                    <span>{form.data && format(form.data, "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Horário:</span>
                    <span>{form.horario}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duração:</span>
                    <span>{profissional.duracao_consulta} minutos</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium">Valor:</span>
                    <span className="font-bold text-primary text-lg">
                      R$ {Number(profissional.valor_consulta).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="termos"
                  checked={form.aceitaTermos}
                  onCheckedChange={(checked) => 
                    setForm(prev => ({ ...prev, aceitaTermos: checked as boolean }))
                  }
                />
                <Label htmlFor="termos" className="text-xs text-muted-foreground leading-relaxed">
                  Li e concordo com os termos de uso do serviço de telemedicina. 
                  Entendo que o pagamento será processado pelo parceiro comercial.
                </Label>
              </div>
            </div>
          )}
        </div>

        {/* Navegação */}
        <div className="flex justify-between gap-2 pt-4 border-t">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(s => s - 1)}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          ) : (
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          )}

          {step < 3 ? (
            <Button 
              onClick={() => setStep(s => s + 1)}
              disabled={step === 2 && (!form.data || !form.horario)}
            >
              Próximo
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !form.aceitaTermos}
            >
              {loading ? "Agendando..." : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Confirmar Agendamento
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface EnqueteDisplayProps {
  enquete: {
    id: string;
    opcoes: any;
    multipla_escolha: boolean;
    data_fim: string | null;
  };
  postId: string;
  onUpdate?: () => void;
}

export const EnqueteDisplay = ({ enquete, postId, onUpdate }: EnqueteDisplayProps) => {
  const [opcoes, setOpcoes] = useState<Array<{ texto: string; votos: number }>>(
    []
  );
  const [selectedOpcao, setSelectedOpcao] = useState<number | null>(null);
  const [jaVotou, setJaVotou] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    carregarEnquete();
  }, [enquete.id]);

  const carregarEnquete = async () => {
    try {
      // Carregar opções atualizadas
      const { data: enqueteData, error: enqueteError } = await supabase
        .from("comunidade_enquetes")
        .select("opcoes")
        .eq("id", enquete.id)
        .single();

      if (enqueteError) throw enqueteError;

      setOpcoes((enqueteData.opcoes as Array<{ texto: string; votos: number }>) || []);

      // Verificar se usuário já votou
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: votoData } = await supabase
          .from("comunidade_votos")
          .select("opcao_index")
          .eq("enquete_id", enquete.id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (votoData) {
          setJaVotou(true);
          setSelectedOpcao(votoData.opcao_index);
        }
      }
    } catch (error: any) {
      console.error("Erro ao carregar enquete:", error.message);
    }
  };

  const handleVotar = async () => {
    if (selectedOpcao === null) {
      toast({
        title: "Selecione uma opção",
        description: "Por favor, escolha uma opção para votar",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Registrar voto
      const { error: votoError } = await supabase
        .from("comunidade_votos")
        .insert({
          enquete_id: enquete.id,
          user_id: user.id,
          opcao_index: selectedOpcao,
        });

      if (votoError) throw votoError;

      // Atualizar contagem de votos na enquete
      const novasOpcoes = [...opcoes];
      novasOpcoes[selectedOpcao].votos += 1;

      const { error: updateError } = await supabase
        .from("comunidade_enquetes")
        .update({ opcoes: novasOpcoes })
        .eq("id", enquete.id);

      if (updateError) throw updateError;

      setJaVotou(true);
      setOpcoes(novasOpcoes);

      toast({
        title: "Voto registrado!",
        description: "Obrigada por participar da enquete",
      });

      if (onUpdate) onUpdate();
    } catch (error: any) {
      toast({
        title: "Erro ao votar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalVotos = opcoes.reduce((sum, op) => sum + op.votos, 0);

  return (
    <div className="bg-muted/50 rounded-lg p-4 mb-4">
      <h4 className="font-semibold text-foreground mb-3">📊 Enquete</h4>

      {!jaVotou ? (
        <>
          <RadioGroup
            value={selectedOpcao?.toString()}
            onValueChange={(value) => setSelectedOpcao(parseInt(value))}
          >
            {opcoes.map((opcao, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={index.toString()} id={`opcao-${index}`} />
                <Label
                  htmlFor={`opcao-${index}`}
                  className="cursor-pointer flex-1"
                >
                  {opcao.texto}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <Button
            onClick={handleVotar}
            disabled={loading || selectedOpcao === null}
            className="w-full mt-4"
            size="sm"
          >
            {loading ? "Votando..." : "Votar"}
          </Button>
        </>
      ) : (
        <div className="space-y-3">
          {opcoes.map((opcao, index) => {
            const porcentagem =
              totalVotos > 0 ? (opcao.votos / totalVotos) * 100 : 0;
            const isSelected = index === selectedOpcao;

            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className={isSelected ? "font-semibold" : ""}>
                    {isSelected && "✓ "}
                    {opcao.texto}
                  </span>
                  <span className="text-muted-foreground">
                    {porcentagem.toFixed(0)}%
                  </span>
                </div>
                <Progress value={porcentagem} className="h-2" />
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground mt-2">
            {totalVotos} {totalVotos === 1 ? "voto" : "votos"}
          </p>
        </div>
      )}
    </div>
  );
};

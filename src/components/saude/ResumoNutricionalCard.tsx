import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Apple, Beef, Wheat, Droplet } from "lucide-react";
import { format } from "date-fns";

interface ResumoNutricionalCardProps {
  userId: string;
  refetchTrigger?: number;
}

interface Refeicao {
  id: string;
  tipo: string;
  descricao: string | null;
  calorias: number | null;
  proteinas: number | null;
  carboidratos: number | null;
  gorduras: number | null;
  data_hora: string;
}

interface MetasNutricionais {
  calorias_diarias: number;
  proteinas_diarias: number;
  carboidratos_diarios: number;
  gorduras_diarias: number;
}

const TIPO_LABELS: Record<string, string> = {
  cafe: "☕ Café da manhã",
  lanche_manha: "🍎 Lanche manhã",
  almoco: "🍽️ Almoço",
  lanche_tarde: "🥪 Lanche tarde",
  jantar: "🌙 Jantar",
  ceia: "🍵 Ceia",
};

export function ResumoNutricionalCard({ userId, refetchTrigger }: ResumoNutricionalCardProps) {
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
  const [metas, setMetas] = useState<MetasNutricionais>({
    calorias_diarias: 1800,
    proteinas_diarias: 50,
    carboidratos_diarios: 250,
    gorduras_diarias: 65,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      carregarDados();
    }
  }, [userId, refetchTrigger]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const hoje = format(new Date(), "yyyy-MM-dd");
      
      // Carregar refeições de hoje
      const { data: refeicoesData } = await supabase
        .from("refeicoes")
        .select("*")
        .eq("user_id", userId)
        .gte("data_hora", `${hoje}T00:00:00`)
        .lte("data_hora", `${hoje}T23:59:59`)
        .order("data_hora", { ascending: true });

      if (refeicoesData) {
        setRefeicoes(refeicoesData);
      }

      // Carregar metas do usuário
      const { data: metasData } = await supabase
        .from("metas_nutricionais")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (metasData) {
        setMetas(metasData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados nutricionais:", error);
    } finally {
      setLoading(false);
    }
  };

  const totais = refeicoes.reduce(
    (acc, ref) => ({
      calorias: acc.calorias + (ref.calorias || 0),
      proteinas: acc.proteinas + (ref.proteinas || 0),
      carboidratos: acc.carboidratos + (ref.carboidratos || 0),
      gorduras: acc.gorduras + (ref.gorduras || 0),
    }),
    { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
  );

  const progressoCalorias = Math.min((totais.calorias / metas.calorias_diarias) * 100, 100);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Apple className="h-5 w-5 text-orange-500" />
          Alimentação de Hoje
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Progresso de calorias */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Calorias</span>
            <span className="font-semibold">
              {totais.calorias} / {metas.calorias_diarias} kcal
            </span>
          </div>
          <Progress value={progressoCalorias} className="h-3" />
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Beef className="h-4 w-4 mx-auto text-red-500 mb-1" />
            <p className="text-lg font-bold">{totais.proteinas.toFixed(0)}g</p>
            <p className="text-xs text-muted-foreground">Proteínas</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Wheat className="h-4 w-4 mx-auto text-amber-500 mb-1" />
            <p className="text-lg font-bold">{totais.carboidratos.toFixed(0)}g</p>
            <p className="text-xs text-muted-foreground">Carbos</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Droplet className="h-4 w-4 mx-auto text-yellow-500 mb-1" />
            <p className="text-lg font-bold">{totais.gorduras.toFixed(0)}g</p>
            <p className="text-xs text-muted-foreground">Gorduras</p>
          </div>
        </div>

        {/* Lista de refeições */}
        {refeicoes.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Refeições registradas</p>
            <div className="space-y-1">
              {refeicoes.map((ref) => (
                <div key={ref.id} className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded">
                  <div>
                    <span className="font-medium">{TIPO_LABELS[ref.tipo] || ref.tipo}</span>
                    {ref.descricao && (
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {ref.descricao}
                      </p>
                    )}
                  </div>
                  {ref.calorias && (
                    <span className="text-orange-500 font-semibold">{ref.calorias} kcal</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma refeição registrada hoje
          </p>
        )}
      </CardContent>
    </Card>
  );
}

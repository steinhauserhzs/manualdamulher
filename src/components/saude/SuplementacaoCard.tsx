import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Dumbbell, AlertTriangle, Check, Clock, Settings } from "lucide-react";
import { AddSuplementoDialog } from "./AddSuplementoDialog";
import { RegistrarSuplementacaoDialog } from "./RegistrarSuplementacaoDialog";

const TIPOS_EMOJI: Record<string, string> = {
  whey: "🥛",
  creatina: "💎",
  bcaa: "🔗",
  glutamina: "🧬",
  pre_treino: "⚡",
  cafeina: "☕",
  multivitaminico: "💊",
  omega3: "🐟",
  colageno: "✨",
  melatonina: "😴",
  termogenico: "🔥",
  albumina: "🥚",
  caseina: "🌙",
  zma: "💤",
  beta_alanina: "⚡",
  outro: "📦",
};

interface Suplemento {
  id: string;
  nome: string;
  tipo: string;
  marca: string | null;
  dosagem_recomendada: string | null;
  horario_ideal: string | null;
  quantidade_total: number | null;
  quantidade_restante: number | null;
  unidade: string | null;
  data_validade: string | null;
}

interface SuplementacaoCardProps {
  userId: string;
}

export function SuplementacaoCard({ userId }: SuplementacaoCardProps) {
  const [suplementos, setSuplementos] = useState<Suplemento[]>([]);
  const [registrosHoje, setRegistrosHoje] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGerenciar, setShowGerenciar] = useState(false);

  const carregarDados = async () => {
    setLoading(true);
    const hoje = new Date().toISOString().split("T")[0];

    // Carregar suplementos ativos
    const { data: supData } = await supabase
      .from("suplementos_cadastrados")
      .select("*")
      .eq("user_id", userId)
      .eq("ativo", true)
      .order("created_at", { ascending: false });

    // Carregar registros de hoje
    const { data: regData } = await supabase
      .from("registro_suplementacao")
      .select("suplemento_id")
      .eq("user_id", userId)
      .eq("data", hoje)
      .eq("tomou", true);

    setSuplementos(supData || []);
    setRegistrosHoje(regData?.map((r) => r.suplemento_id).filter(Boolean) as string[] || []);
    setLoading(false);
  };

  useEffect(() => {
    carregarDados();
  }, [userId]);

  const handleDesativar = async (id: string) => {
    await supabase
      .from("suplementos_cadastrados")
      .update({ ativo: false })
      .eq("id", id);
    carregarDados();
  };

  // Calcular alertas
  const alertasEstoque = suplementos.filter((s) => {
    if (!s.quantidade_total || !s.quantidade_restante) return false;
    const percentual = (s.quantidade_restante / s.quantidade_total) * 100;
    return percentual <= 20;
  });

  const alertasValidade = suplementos.filter((s) => {
    if (!s.data_validade) return false;
    const validade = new Date(s.data_validade);
    const hoje = new Date();
    const diffDays = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  });

  const progresso = suplementos.length > 0 
    ? (registrosHoje.length / suplementos.length) * 100 
    : 0;

  if (loading) {
    return (
      <Card className="gradient-card shadow-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card shadow-card">
      <CardHeader className="px-4 sm:px-6 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Suplementação
          </CardTitle>
          <div className="flex gap-2">
            {suplementos.length > 0 && (
              <RegistrarSuplementacaoDialog
                userId={userId}
                suplementos={suplementos}
                registrosHoje={registrosHoje}
                onRegistroAdded={carregarDados}
              />
            )}
            <AddSuplementoDialog userId={userId} onSuplementoAdded={carregarDados} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 sm:px-6 space-y-4">
        {suplementos.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Dumbbell className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum suplemento cadastrado</p>
            <p className="text-xs mt-1">Adicione seus suplementos para acompanhar o consumo</p>
          </div>
        ) : (
          <>
            {/* Progresso do dia */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Hoje: {registrosHoje.length}/{suplementos.length} ✓
                </span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(progresso)}%
                </span>
              </div>
              <Progress value={progresso} className="h-2" />
            </div>

            {/* Lista de suplementos */}
            <div className="space-y-2">
              {suplementos.slice(0, showGerenciar ? undefined : 4).map((sup) => {
                const tomouHoje = registrosHoje.includes(sup.id);
                return (
                  <div
                    key={sup.id}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      tomouHoje ? "bg-primary/10" : "bg-muted/30"
                    }`}
                  >
                    <span className="text-lg">{TIPOS_EMOJI[sup.tipo] || "📦"}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${tomouHoje ? "line-through opacity-60" : ""}`}>
                        {sup.nome}
                      </p>
                      {sup.dosagem_recomendada && (
                        <p className="text-xs text-muted-foreground">{sup.dosagem_recomendada}</p>
                      )}
                    </div>
                    {tomouHoje ? (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    {showGerenciar && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-destructive"
                        onClick={() => handleDesativar(sup.id)}
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Alertas */}
            {(alertasEstoque.length > 0 || alertasValidade.length > 0) && (
              <div className="space-y-2 pt-2 border-t">
                {alertasEstoque.map((sup) => (
                  <div key={`estoque-${sup.id}`} className="flex items-center gap-2 text-xs text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{sup.nome} acabando ({sup.quantidade_restante}{sup.unidade} restantes)</span>
                  </div>
                ))}
                {alertasValidade.map((sup) => (
                  <div key={`validade-${sup.id}`} className="flex items-center gap-2 text-xs text-orange-600">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{sup.nome} vence em breve</span>
                  </div>
                ))}
              </div>
            )}

            {/* Botão gerenciar */}
            {suplementos.length > 4 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setShowGerenciar(!showGerenciar)}
              >
                <Settings className="h-3 w-3 mr-1" />
                {showGerenciar ? "Mostrar menos" : `Ver todos (${suplementos.length})`}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

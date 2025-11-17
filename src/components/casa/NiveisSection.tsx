import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap, Crown } from "lucide-react";

interface NiveisSectionProps {
  xpTotal: number;
}

export const NiveisSection = ({ xpTotal }: NiveisSectionProps) => {
  // Sistema de níveis: cada nível requer 100 XP
  const xpPorNivel = 100;
  const nivel = Math.floor(xpTotal / xpPorNivel);
  const xpAtual = xpTotal % xpPorNivel;
  const progressoNivel = (xpAtual / xpPorNivel) * 100;

  const getNomNivel = (nivel: number): string => {
    if (nivel === 0) return "Iniciante";
    if (nivel < 3) return "Aprendiz da Casa";
    if (nivel < 5) return "Guardiã do Lar";
    if (nivel < 10) return "Mestre da Rotina";
    if (nivel < 15) return "Rainha da Organização";
    if (nivel < 20) return "Imperatriz do Lar";
    return "Lendária da Casa";
  };

  const getIconNivel = (nivel: number): string => {
    if (nivel === 0) return "🌱";
    if (nivel < 3) return "✨";
    if (nivel < 5) return "⭐";
    if (nivel < 10) return "💫";
    if (nivel < 15) return "👑";
    if (nivel < 20) return "💎";
    return "🔮";
  };

  return (
    <Card className="gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          Seu Nível
        </CardTitle>
        <CardDescription>Continue completando tarefas para subir de nível!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Nível Atual */}
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-4xl">
            {getIconNivel(nivel)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-foreground">Nível {nivel}</h3>
              {nivel >= 20 && <Crown className="h-5 w-5 text-accent" />}
            </div>
            <p className="text-sm text-muted-foreground">{getNomNivel(nivel)}</p>
          </div>
        </div>

        {/* Progresso para Próximo Nível */}
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-semibold text-primary">
              {xpAtual} / {xpPorNivel} XP
            </span>
          </div>
          <Progress value={progressoNivel} className="h-3" />
          <p className="mt-2 text-xs text-muted-foreground text-center">
            {xpPorNivel - xpAtual} XP para o próximo nível
          </p>
        </div>

        {/* Total de XP */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
          <p className="text-sm text-muted-foreground">XP Total Acumulado</p>
          <p className="text-3xl font-bold text-primary">{xpTotal} XP</p>
        </div>
      </CardContent>
    </Card>
  );
};

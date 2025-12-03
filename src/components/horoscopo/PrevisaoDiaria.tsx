import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Briefcase, Sparkles, Palette } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PrevisaoDiariaProps {
  previsao: {
    previsao_geral: string;
    amor?: string;
    trabalho?: string;
    saude?: string;
    numero_sorte?: number;
    cor_do_dia?: string;
  } | null;
  isLoading?: boolean;
  signo?: string;
}

export const PrevisaoDiaria = ({ previsao, isLoading, signo }: PrevisaoDiariaProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!previsao) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Previsão do dia ainda não disponível.</p>
          <p className="text-sm mt-2">As previsões são atualizadas diariamente pela manhã.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Previsão de Hoje {signo && `para ${signo}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-foreground leading-relaxed">{previsao.previsao_geral}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {previsao.amor && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30">
              <Heart className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm text-rose-700 dark:text-rose-300">Amor</p>
                <p className="text-sm text-muted-foreground">{previsao.amor}</p>
              </div>
            </div>
          )}

          {previsao.trabalho && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <Briefcase className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm text-blue-700 dark:text-blue-300">Trabalho</p>
                <p className="text-sm text-muted-foreground">{previsao.trabalho}</p>
              </div>
            </div>
          )}

          {previsao.saude && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
              <Sparkles className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm text-green-700 dark:text-green-300">Bem-estar</p>
                <p className="text-sm text-muted-foreground">{previsao.saude}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30">
            <Palette className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm text-purple-700 dark:text-purple-300">Dicas do Dia</p>
              <p className="text-sm text-muted-foreground">
                🎰 Número: <strong>{previsao.numero_sorte || '7'}</strong>
                {previsao.cor_do_dia && (
                  <> • 🎨 Cor: <strong>{previsao.cor_do_dia}</strong></>
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

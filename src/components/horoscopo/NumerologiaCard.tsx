import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hash } from "lucide-react";
import { SIGNIFICADOS_NUMEROS, SIGNIFICADOS_ANO_PESSOAL } from "@/lib/astrologia";

interface NumerologiaCardProps {
  numeroPessoal: number;
  anoPessoal: number;
  compact?: boolean;
}

export const NumerologiaCard = ({ numeroPessoal, anoPessoal, compact }: NumerologiaCardProps) => {
  const significadoNumero = SIGNIFICADOS_NUMEROS[numeroPessoal] || SIGNIFICADOS_NUMEROS[9];
  const significadoAno = SIGNIFICADOS_ANO_PESSOAL[anoPessoal] || SIGNIFICADOS_ANO_PESSOAL[1];

  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{numeroPessoal}</span>
            </div>
            <div>
              <p className="font-semibold">{significadoNumero.titulo}</p>
              <p className="text-xs text-muted-foreground">Número Pessoal</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Seu Número Pessoal: {numeroPessoal}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0">
              <span className="text-3xl font-bold text-white">{numeroPessoal}</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-primary mb-2">{significadoNumero.titulo}</h3>
              <p className="text-muted-foreground">{significadoNumero.descricao}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            Seu Ano Pessoal: {anoPessoal}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center shrink-0">
              <span className="text-3xl font-bold text-white">{anoPessoal}</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-secondary mb-2">{significadoAno.titulo}</h3>
              <p className="text-muted-foreground">{significadoAno.tema}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

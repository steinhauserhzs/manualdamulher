import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ELEMENTOS } from "@/lib/astrologia";

interface SignoCardProps {
  nome: string;
  simbolo: string;
  emoji: string;
  elemento: string;
  isUserSign?: boolean;
}

export const SignoCard = ({ nome, simbolo, emoji, elemento, isUserSign }: SignoCardProps) => {
  const elementoInfo = ELEMENTOS[elemento as keyof typeof ELEMENTOS];

  return (
    <Link to={`/horoscopo/signos/${nome.toLowerCase()}`}>
      <Card className={`hover:shadow-lg transition-all cursor-pointer ${isUserSign ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-4 text-center">
          <div className="text-4xl mb-2">{emoji}</div>
          <h3 className="font-semibold text-lg">{nome}</h3>
          <p className="text-2xl text-muted-foreground">{simbolo}</p>
          <div className={`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-xs ${elementoInfo?.bg} ${elementoInfo?.cor}`}>
            <span>{elementoInfo?.emoji}</span>
            <span>{elemento}</span>
          </div>
          {isUserSign && (
            <p className="text-xs text-primary mt-2 font-medium">Seu signo ✨</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

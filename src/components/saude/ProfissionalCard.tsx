import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Clock, Award, MessageCircle } from "lucide-react";

interface Profissional {
  id: string;
  nome: string;
  registro_profissional: string;
  foto_url: string | null;
  bio: string | null;
  anos_experiencia: number;
  valor_consulta: number;
  duracao_consulta: number;
  avaliacao_media: number;
  total_consultas: number;
  especialidade?: {
    nome: string;
    icone: string;
    tipo: string;
  } | null;
}

interface ProfissionalCardProps {
  profissional: Profissional;
  onAgendar: (profissional: Profissional) => void;
}

export const ProfissionalCard = ({ profissional, onAgendar }: ProfissionalCardProps) => {
  const iniciais = profissional.nome
    .split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Card className="gradient-card shadow-card hover-lift transition-all">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Avatar */}
          <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-primary/20">
            <AvatarImage src={profissional.foto_url || undefined} alt={profissional.nome} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {iniciais}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-sm sm:text-base line-clamp-1">
                  {profissional.nome}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {profissional.registro_profissional}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs shrink-0">
                {profissional.especialidade?.icone} {profissional.especialidade?.nome}
              </Badge>
            </div>

            {/* Avaliação e stats */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{Number(profissional.avaliacao_media).toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">
                  ({profissional.total_consultas})
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Award className="h-3 w-3" />
                <span>{profissional.anos_experiencia} anos</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{profissional.duracao_consulta} min</span>
              </div>
            </div>

            {/* Bio */}
            {profissional.bio && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {profissional.bio}
              </p>
            )}
          </div>
        </div>

        {/* Footer com preço e botão */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
          <div>
            <p className="text-lg sm:text-xl font-bold text-primary">
              R$ {Number(profissional.valor_consulta).toFixed(2).replace(".", ",")}
            </p>
            <p className="text-[10px] text-muted-foreground">por consulta</p>
          </div>
          <Button onClick={() => onAgendar(profissional)} size="sm">
            <MessageCircle className="h-4 w-4 mr-1" />
            Agendar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

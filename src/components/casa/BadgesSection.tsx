import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BadgeData {
  id: string;
  nome: string;
  descricao: string;
  criterio: string;
  icone: string | null;
  conquistada?: boolean;
  data_conquista?: string;
}

interface BadgesSectionProps {
  userId: string;
}

export const BadgesSection = ({ userId }: BadgesSectionProps) => {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarBadges();
  }, [userId]);

  const carregarBadges = async () => {
    // Buscar todas as badges disponíveis
    const { data: todasBadges } = await supabase
      .from("badges_casa")
      .select("*")
      .order("nome");

    // Buscar badges conquistadas pela usuária
    const { data: badgesConquistadas } = await supabase
      .from("badges_usuario")
      .select("badge_id, data_conquista")
      .eq("user_id", userId);

    if (todasBadges) {
      const badgesComStatus = todasBadges.map((badge) => {
        const conquistada = badgesConquistadas?.find((b) => b.badge_id === badge.id);
        return {
          ...badge,
          conquistada: !!conquistada,
          data_conquista: conquistada?.data_conquista,
        };
      });
      setBadges(badgesComStatus);
    }

    setLoading(false);
  };

  if (loading) {
    return <div>Carregando badges...</div>;
  }

  const conquistadas = badges.filter((b) => b.conquistada);
  const bloqueadas = badges.filter((b) => !b.conquistada);

  return (
    <Card className="gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-accent" />
          Conquistas
        </CardTitle>
        <CardDescription>
          {conquistadas.length} de {badges.length} badges conquistadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Badges Conquistadas */}
          {conquistadas.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Conquistadas 🎉</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {conquistadas.map((badge) => (
                  <div
                    key={badge.id}
                    className="rounded-lg border border-primary/20 bg-primary/5 p-4 transition-all hover:border-primary/40"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
                        {badge.icone || "🏆"}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{badge.nome}</h4>
                        <p className="text-xs text-muted-foreground">{badge.descricao}</p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          Conquistada
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges Bloqueadas */}
          {bloqueadas.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">A Conquistar</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {bloqueadas.map((badge) => (
                  <div
                    key={badge.id}
                    className="rounded-lg border border-border bg-muted/30 p-4 opacity-60"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-2xl grayscale">
                        {badge.icone || <Lock className="h-6 w-6" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{badge.nome}</h4>
                        <p className="text-xs text-muted-foreground">{badge.descricao}</p>
                        <p className="mt-1 text-xs italic text-muted-foreground">
                          {badge.criterio}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

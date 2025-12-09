import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Award } from "lucide-react";

interface ComunidadeBadge {
  id: string;
  nome: string;
  descricao: string;
  icone: string | null;
  cor: string | null;
  data_conquista: string;
}

interface UserBadgesProps {
  userId: string;
  showAll?: boolean;
  maxDisplay?: number;
}

export const UserBadges = ({ userId, showAll = false, maxDisplay = 3 }: UserBadgesProps) => {
  const [badges, setBadges] = useState<ComunidadeBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      const { data, error } = await supabase
        .from("comunidade_badges_usuario")
        .select(`
          data_conquista,
          comunidade_badges (
            id,
            nome,
            descricao,
            icone,
            cor
          )
        `)
        .eq("user_id", userId)
        .order("data_conquista", { ascending: false });

      if (!error && data) {
        const formattedBadges = data.map((item: any) => ({
          ...item.comunidade_badges,
          data_conquista: item.data_conquista
        }));
        setBadges(formattedBadges);
      }
      setLoading(false);
    };

    fetchBadges();
  }, [userId]);

  if (loading || badges.length === 0) return null;

  const displayBadges = showAll ? badges : badges.slice(0, maxDisplay);
  const remainingCount = badges.length - displayBadges.length;

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1">
        {displayBadges.map((badge) => (
          <Tooltip key={badge.id}>
            <TooltipTrigger>
              <Badge
                variant="outline"
                className="text-xs flex items-center gap-1"
                style={{ 
                  borderColor: badge.cor || undefined,
                  color: badge.cor || undefined
                }}
              >
                {badge.icone ? (
                  <span>{badge.icone}</span>
                ) : (
                  <Award className="h-3 w-3" />
                )}
                {badge.nome}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{badge.nome}</p>
              <p className="text-xs text-muted-foreground">{badge.descricao}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        {remainingCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            +{remainingCount}
          </Badge>
        )}
      </div>
    </TooltipProvider>
  );
};

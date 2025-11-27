import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";
import { toast } from "sonner";

interface FollowButtonProps {
  userId: string;
  onFollowChange?: () => void;
}

export function FollowButton({ userId, onFollowChange }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        checkIfFollowing(user.id);
      }
    };
    getCurrentUser();
  }, [userId]);

  const checkIfFollowing = async (currentId: string) => {
    const { data } = await supabase
      .from("comunidade_seguidores")
      .select("id")
      .eq("seguidor_id", currentId)
      .eq("seguindo_id", userId)
      .maybeSingle();

    setIsFollowing(!!data);
  };

  const toggleFollow = async () => {
    if (!currentUserId) {
      toast.error("Você precisa estar logada para seguir usuárias");
      return;
    }

    if (currentUserId === userId) {
      toast.error("Você não pode seguir a si mesma");
      return;
    }

    setIsLoading(true);

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("comunidade_seguidores")
          .delete()
          .eq("seguidor_id", currentUserId)
          .eq("seguindo_id", userId);

        if (error) throw error;
        setIsFollowing(false);
        toast.success("Você deixou de seguir esta usuária");
      } else {
        const { error } = await supabase
          .from("comunidade_seguidores")
          .insert({
            seguidor_id: currentUserId,
            seguindo_id: userId,
          });

        if (error) throw error;
        setIsFollowing(true);
        toast.success("Você começou a seguir esta usuária!");
      }

      onFollowChange?.();
    } catch (error) {
      console.error("Erro ao seguir/deixar de seguir:", error);
      toast.error("Erro ao processar ação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (currentUserId === userId) {
    return null;
  }

  return (
    <Button
      onClick={toggleFollow}
      disabled={isLoading}
      variant={isFollowing ? "outline" : "default"}
      className="gap-2"
    >
      {isFollowing ? (
        <>
          <UserMinus className="h-4 w-4" />
          Seguindo
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Seguir
        </>
      )}
    </Button>
  );
}

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Users, Circle } from "lucide-react";

interface OnlineUser {
  id: string;
  nome: string;
  avatar_url: string | null;
}

export const UsuariosOnline = () => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setupPresence();
  }, []);

  const setupPresence = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setCurrentUserId(user.id);

    // Get current user's profile
    const { data: perfil } = await supabase
      .from("perfis")
      .select("nome, avatar_url")
      .eq("user_id", user.id)
      .single();

    // Set up presence channel
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const users: OnlineUser[] = [];
        
        Object.entries(newState).forEach(([userId, presences]) => {
          if (presences && presences.length > 0) {
            const presence = presences[0] as any;
            users.push({
              id: userId,
              nome: presence.nome || 'Usuária',
              avatar_url: presence.avatar_url || null,
            });
          }
        });
        
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;
        
        // Track user presence with their profile info
        await channel.track({
          online_at: new Date().toISOString(),
          nome: perfil?.nome || 'Usuária',
          avatar_url: perfil?.avatar_url || null,
        });
      });

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (onlineUsers.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Circle className="h-3 w-3 fill-green-500 text-green-500" />
          {onlineUsers.length} {onlineUsers.length === 1 ? 'usuária online' : 'usuárias online'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {onlineUsers.slice(0, 12).map((user) => (
            <div
              key={user.id}
              className="relative cursor-pointer group"
              onClick={() => navigate(`/perfil/${user.id}`)}
              title={user.nome}
            >
              <Avatar className="h-10 w-10 ring-2 ring-green-500/50 group-hover:ring-green-500 transition-all">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="text-xs">{user.nome.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
            </div>
          ))}
          {onlineUsers.length > 12 && (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-xs font-medium">
              +{onlineUsers.length - 12}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Search, Users, Shield, User } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  user_id: string;
  nome: string;
  avatar_url: string | null;
  created_at: string;
  tipo_usuario: string;
  cidade: string | null;
  estado: string | null;
}

interface UserRole {
  user_id: string;
  role: string;
}

const AdminUsuarios = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const { data: perfis, error } = await supabase
        .from('perfis')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(perfis || []);

      // Fetch roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      setRoles(rolesData || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuárias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getUserRoles = (userId: string) => {
    return roles.filter(r => r.user_id === userId).map(r => r.role);
  };

  const toggleAdminRole = async (userId: string, hasAdmin: boolean) => {
    try {
      if (hasAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
        
        if (error) throw error;
        toast.success('Role de admin removida');
      } else {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
        
        if (error) throw error;
        toast.success('Role de admin adicionada');
      }
      fetchUsers();
    } catch (error) {
      console.error('Error toggling admin:', error);
      toast.error('Erro ao alterar role');
    }
  };

  const filteredUsers = users.filter(user => 
    user.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gerenciar Usuárias</h1>
        <p className="text-muted-foreground">Visualize e gerencie as contas de usuárias</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <Badge variant="outline" className="py-2 px-4">
          <Users className="h-4 w-4 mr-2" />
          {users.length} usuárias
        </Badge>
        <Badge variant="outline" className="py-2 px-4">
          <Shield className="h-4 w-4 mr-2" />
          {roles.filter(r => r.role === 'admin').length} admins
        </Badge>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuárias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const userRoles = getUserRoles(user.user_id);
              const isAdmin = userRoles.includes('admin');

              return (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.cidade && user.estado 
                          ? `${user.cidade}, ${user.estado}` 
                          : 'Localização não informada'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Cadastro: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {userRoles.map((role) => (
                        <Badge 
                          key={role} 
                          variant={role === 'admin' ? 'default' : 'secondary'}
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant={isAdmin ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => toggleAdminRole(user.user_id, isAdmin)}
                    >
                      {isAdmin ? "Remover Admin" : "Tornar Admin"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsuarios;

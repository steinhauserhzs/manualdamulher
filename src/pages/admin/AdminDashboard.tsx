import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, MessageSquare, ShoppingBag, FolderOpen, AlertTriangle, TrendingUp } from "lucide-react";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

interface Stats {
  totalUsers: number;
  totalBlogPosts: number;
  totalCommunityPosts: number;
  totalAnuncios: number;
  totalRecursos: number;
  pendingDenuncias: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          { count: usersCount },
          { count: blogCount },
          { count: communityCount },
          { count: anunciosCount },
          { count: recursosCount },
          { count: denunciasCount }
        ] = await Promise.all([
          supabase.from('perfis').select('*', { count: 'exact', head: true }),
          supabase.from('posts_blog').select('*', { count: 'exact', head: true }),
          supabase.from('comunidade_posts').select('*', { count: 'exact', head: true }),
          supabase.from('marketplace_anuncios').select('*', { count: 'exact', head: true }),
          supabase.from('recursos_digitais').select('*', { count: 'exact', head: true }),
          supabase.from('comunidade_denuncias').select('*', { count: 'exact', head: true }).eq('status', 'pendente')
        ]);

        setStats({
          totalUsers: usersCount || 0,
          totalBlogPosts: blogCount || 0,
          totalCommunityPosts: communityCount || 0,
          totalAnuncios: anunciosCount || 0,
          totalRecursos: recursosCount || 0,
          pendingDenuncias: denunciasCount || 0
        });

        // Fetch recent activity
        const { data: recentUsers } = await supabase
          .from('perfis')
          .select('nome, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentActivity(recentUsers || []);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">Visão geral do sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AdminStatCard
          title="Total de Usuárias"
          value={stats?.totalUsers || 0}
          icon={Users}
        />
        <AdminStatCard
          title="Posts do Blog"
          value={stats?.totalBlogPosts || 0}
          icon={FileText}
        />
        <AdminStatCard
          title="Posts da Comunidade"
          value={stats?.totalCommunityPosts || 0}
          icon={MessageSquare}
        />
        <AdminStatCard
          title="Anúncios Marketplace"
          value={stats?.totalAnuncios || 0}
          icon={ShoppingBag}
        />
        <AdminStatCard
          title="Recursos Digitais"
          value={stats?.totalRecursos || 0}
          icon={FolderOpen}
        />
        <AdminStatCard
          title="Denúncias Pendentes"
          value={stats?.pendingDenuncias || 0}
          icon={AlertTriangle}
          className={stats?.pendingDenuncias ? "border-destructive" : ""}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Usuárias Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <ul className="space-y-3">
                {recentActivity.map((user, index) => (
                  <li key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="font-medium">{user.nome}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Nenhuma atividade recente</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Ações Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center justify-between py-2 border-b">
                <span>Denúncias para revisar</span>
                <span className="font-bold text-destructive">{stats?.pendingDenuncias || 0}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

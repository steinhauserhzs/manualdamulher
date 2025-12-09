import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TransacaoAgrupada {
  categoria: string;
  valor: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const RelatoriosCard = () => {
  const [despesasPorCategoria, setDespesasPorCategoria] = useState<TransacaoAgrupada[]>([]);
  const [receitasPorCategoria, setReceitasPorCategoria] = useState<TransacaoAgrupada[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split("T")[0];
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split("T")[0];

    const { data } = await supabase
      .from("transacoes_financeiras")
      .select("tipo, categoria, valor")
      .eq("user_id", user.id)
      .gte("data", primeiroDia)
      .lte("data", ultimoDia);

    if (data) {
      const despesas = data.filter(t => t.tipo === "despesa");
      const receitas = data.filter(t => t.tipo === "receita");

      const agruparPorCategoria = (items: typeof data) => {
        const grouped = items.reduce((acc, item) => {
          acc[item.categoria] = (acc[item.categoria] || 0) + Number(item.valor);
          return acc;
        }, {} as Record<string, number>);
        
        return Object.entries(grouped).map(([categoria, valor]) => ({
          categoria,
          valor: Number(valor)
        }));
      };

      setDespesasPorCategoria(agruparPorCategoria(despesas));
      setReceitasPorCategoria(agruparPorCategoria(receitas));
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="gradient-card shadow-card">
        <CardContent className="p-6">
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Relatórios do Mês
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="despesas" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="despesas" className="text-xs sm:text-sm">Despesas</TabsTrigger>
            <TabsTrigger value="receitas" className="text-xs sm:text-sm">Receitas</TabsTrigger>
          </TabsList>

          <TabsContent value="despesas">
            {despesasPorCategoria.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma despesa registrada este mês</p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={despesasPorCategoria}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="categoria" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip 
                        formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      />
                      <Bar dataKey="valor" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={despesasPorCategoria}
                        dataKey="valor"
                        nameKey="categoria"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ categoria, percent }) => `${categoria} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {despesasPorCategoria.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="receitas">
            {receitasPorCategoria.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma receita registrada este mês</p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={receitasPorCategoria}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="categoria" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip 
                        formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      />
                      <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={receitasPorCategoria}
                        dataKey="valor"
                        nameKey="categoria"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ categoria, percent }) => `${categoria} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {receitasPorCategoria.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AguaChartProps {
  data: { date: string; ml: number }[];
}

export const AguaChart = ({ data }: AguaChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Consumo de Água 💧</CardTitle>
        <CardDescription>Últimos 7 dias (meta: 2000ml)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <ReferenceLine y={2000} stroke="hsl(var(--primary))" strokeDasharray="3 3" />
            <Bar 
              dataKey="ml" 
              fill="hsl(var(--primary))"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

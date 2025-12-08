import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  Bell, Plus, Trash2, Droplets, Pill, Home, DollarSign, 
  Smile, Clock, BellRing, BellOff
} from 'lucide-react';
import { ModuleHeader } from '@/components/ui/ModuleHeader';

interface Lembrete {
  id: string;
  titulo: string;
  mensagem: string | null;
  tipo: string;
  modulo: string | null;
  horario: string;
  dias_semana: string[];
  ativo: boolean;
}

const tiposLembrete = [
  { value: 'agua', label: 'Beber Água', icon: Droplets, color: 'text-blue-500' },
  { value: 'medicamento', label: 'Medicamento', icon: Pill, color: 'text-red-500' },
  { value: 'tarefa', label: 'Tarefa Casa', icon: Home, color: 'text-purple-500' },
  { value: 'meta', label: 'Meta Financeira', icon: DollarSign, color: 'text-green-500' },
  { value: 'habito', label: 'Hábito', icon: Smile, color: 'text-amber-500' },
  { value: 'personalizado', label: 'Personalizado', icon: Bell, color: 'text-gray-500' },
];

const diasSemana = [
  { value: 'dom', label: 'D' },
  { value: 'seg', label: 'S' },
  { value: 'ter', label: 'T' },
  { value: 'qua', label: 'Q' },
  { value: 'qui', label: 'Q' },
  { value: 'sex', label: 'S' },
  { value: 'sab', label: 'S' },
];

export default function Lembretes() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [novoLembrete, setNovoLembrete] = useState({
    titulo: '',
    mensagem: '',
    tipo: 'personalizado',
    horario: '08:00',
    dias_semana: ['seg', 'ter', 'qua', 'qui', 'sex'],
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      carregarLembretes();
    }
  }, [user]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUser(user);
    setLoading(false);
  };

  const carregarLembretes = async () => {
    const { data, error } = await supabase
      .from('lembretes')
      .select('*')
      .eq('user_id', user.id)
      .order('horario', { ascending: true });

    if (!error && data) {
      setLembretes(data);
    }
  };

  const adicionarLembrete = async () => {
    if (!novoLembrete.titulo.trim()) {
      toast.error('Digite um título para o lembrete');
      return;
    }

    if (novoLembrete.dias_semana.length === 0) {
      toast.error('Selecione pelo menos um dia da semana');
      return;
    }

    const { error } = await supabase.from('lembretes').insert({
      user_id: user.id,
      titulo: novoLembrete.titulo,
      mensagem: novoLembrete.mensagem || null,
      tipo: novoLembrete.tipo,
      horario: novoLembrete.horario,
      dias_semana: novoLembrete.dias_semana,
    });

    if (error) {
      toast.error('Erro ao adicionar lembrete');
      return;
    }

    toast.success('Lembrete criado!');
    setDialogOpen(false);
    setNovoLembrete({
      titulo: '',
      mensagem: '',
      tipo: 'personalizado',
      horario: '08:00',
      dias_semana: ['seg', 'ter', 'qua', 'qui', 'sex'],
    });
    carregarLembretes();
  };

  const toggleAtivo = async (lembrete: Lembrete) => {
    const { error } = await supabase
      .from('lembretes')
      .update({ ativo: !lembrete.ativo })
      .eq('id', lembrete.id);

    if (!error) {
      setLembretes(lembretes.map(l => 
        l.id === lembrete.id ? { ...l, ativo: !l.ativo } : l
      ));
      toast.success(lembrete.ativo ? 'Lembrete desativado' : 'Lembrete ativado');
    }
  };

  const excluirLembrete = async (id: string) => {
    const { error } = await supabase
      .from('lembretes')
      .delete()
      .eq('id', id);

    if (!error) {
      setLembretes(lembretes.filter(l => l.id !== id));
      toast.success('Lembrete removido');
    }
  };

  const toggleDia = (dia: string) => {
    if (novoLembrete.dias_semana.includes(dia)) {
      setNovoLembrete({
        ...novoLembrete,
        dias_semana: novoLembrete.dias_semana.filter(d => d !== dia)
      });
    } else {
      setNovoLembrete({
        ...novoLembrete,
        dias_semana: [...novoLembrete.dias_semana, dia]
      });
    }
  };

  const lembretesAtivos = lembretes.filter(l => l.ativo);
  const lembretesInativos = lembretes.filter(l => !l.ativo);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:ml-64">
      <ModuleHeader 
        title="Lembretes" 
        subtitle="Nunca esqueça de cuidar de você"
        icon={Bell}
        gradient="lembretes"
      />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Resumo */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 text-center">
            <BellRing className="h-8 w-8 mx-auto text-success mb-2" />
            <div className="text-2xl font-bold">{lembretesAtivos.length}</div>
            <div className="text-sm text-muted-foreground">Ativos</div>
          </Card>
          <Card className="p-4 text-center">
            <BellOff className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <div className="text-2xl font-bold">{lembretesInativos.length}</div>
            <div className="text-sm text-muted-foreground">Pausados</div>
          </Card>
        </div>

        {/* Adicionar lembrete */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mb-6">
              <Plus className="h-4 w-4 mr-2" /> Novo Lembrete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Lembrete</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tipo</Label>
                <Select
                  value={novoLembrete.tipo}
                  onValueChange={(v) => {
                    const tipo = tiposLembrete.find(t => t.value === v);
                    setNovoLembrete({ 
                      ...novoLembrete, 
                      tipo: v,
                      titulo: tipo?.label || ''
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposLembrete.map(tipo => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        <div className="flex items-center gap-2">
                          <tipo.icon className={`h-4 w-4 ${tipo.color}`} />
                          {tipo.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Título</Label>
                <Input
                  value={novoLembrete.titulo}
                  onChange={(e) => setNovoLembrete({ ...novoLembrete, titulo: e.target.value })}
                  placeholder="Ex: Tomar vitamina, Conferir contas..."
                />
              </div>
              <div>
                <Label>Mensagem (opcional)</Label>
                <Input
                  value={novoLembrete.mensagem}
                  onChange={(e) => setNovoLembrete({ ...novoLembrete, mensagem: e.target.value })}
                  placeholder="Descrição adicional..."
                />
              </div>
              <div>
                <Label>Horário</Label>
                <Input
                  type="time"
                  value={novoLembrete.horario}
                  onChange={(e) => setNovoLembrete({ ...novoLembrete, horario: e.target.value })}
                />
              </div>
              <div>
                <Label className="mb-2 block">Dias da Semana</Label>
                <div className="flex gap-2 justify-center">
                  {diasSemana.map((dia, index) => (
                    <button
                      key={dia.value}
                      onClick={() => toggleDia(dia.value)}
                      className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                        novoLembrete.dias_semana.includes(dia.value)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {dia.label}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={adicionarLembrete} className="w-full">
                Criar Lembrete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Lista de lembretes */}
        {lembretes.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">
              Você ainda não tem lembretes configurados
            </p>
            <p className="text-sm text-muted-foreground">
              Crie lembretes para beber água, tomar medicamentos, ou qualquer outra coisa importante!
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {lembretes.map(lembrete => {
              const tipo = tiposLembrete.find(t => t.value === lembrete.tipo);
              const Icon = tipo?.icon || Bell;
              
              return (
                <Card 
                  key={lembrete.id} 
                  className={`p-4 ${!lembrete.ativo ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-full bg-muted ${tipo?.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{lembrete.titulo}</span>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {lembrete.horario}
                        </Badge>
                      </div>
                      {lembrete.mensagem && (
                        <p className="text-sm text-muted-foreground truncate">
                          {lembrete.mensagem}
                        </p>
                      )}
                      <div className="flex gap-1 mt-1.5">
                        {diasSemana.map(dia => (
                          <span
                            key={dia.value}
                            className={`text-xs w-5 h-5 flex items-center justify-center rounded-full ${
                              lembrete.dias_semana?.includes(dia.value)
                                ? 'bg-primary/20 text-primary font-medium'
                                : 'text-muted-foreground/40'
                            }`}
                          >
                            {dia.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={lembrete.ativo}
                        onCheckedChange={() => toggleAtivo(lembrete)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => excluirLembrete(lembrete.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info sobre notificações */}
        <Card className="mt-6 p-4 bg-muted/50">
          <div className="flex gap-3">
            <Bell className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Notificações no navegador</p>
              <p className="text-xs text-muted-foreground mt-1">
                Para receber alertas, instale o app na tela inicial do seu celular. 
                Assim você receberá notificações mesmo com o app fechado!
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

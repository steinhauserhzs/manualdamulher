import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format, isSameDay, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  CalendarDays, Plus, Home, Heart, Smile, DollarSign, 
  Stethoscope, Clock, CheckCircle2, Circle, Trash2 
} from 'lucide-react';
import { ModuleHeader } from '@/components/ui/ModuleHeader';

interface Evento {
  id: string;
  titulo: string;
  descricao: string | null;
  data_inicio: string;
  data_fim: string | null;
  tipo: string;
  modulo: string | null;
  cor: string | null;
  concluido: boolean;
}

const moduloConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  casa: { icon: Home, color: 'bg-casa text-white', label: 'Casa' },
  saude: { icon: Heart, color: 'bg-saude text-white', label: 'Saúde' },
  bem_estar: { icon: Smile, color: 'bg-bemEstar text-white', label: 'Bem-estar' },
  financas: { icon: DollarSign, color: 'bg-financas text-white', label: 'Finanças' },
  telemedicina: { icon: Stethoscope, color: 'bg-saude text-white', label: 'Consulta' },
};

export default function Calendario() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [novoEvento, setNovoEvento] = useState({
    titulo: '',
    descricao: '',
    data_inicio: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    tipo: 'evento',
    modulo: '',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      carregarEventos();
    }
  }, [user, selectedDate]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUser(user);
    setLoading(false);
  };

  const carregarEventos = async () => {
    const inicio = startOfMonth(selectedDate);
    const fim = endOfMonth(selectedDate);

    const { data, error } = await supabase
      .from('calendario_eventos')
      .select('*')
      .eq('user_id', user.id)
      .gte('data_inicio', inicio.toISOString())
      .lte('data_inicio', fim.toISOString())
      .order('data_inicio', { ascending: true });

    if (!error && data) {
      setEventos(data);
    }
  };

  const adicionarEvento = async () => {
    if (!novoEvento.titulo.trim()) {
      toast.error('Digite um título para o evento');
      return;
    }

    const { error } = await supabase.from('calendario_eventos').insert({
      user_id: user.id,
      titulo: novoEvento.titulo,
      descricao: novoEvento.descricao || null,
      data_inicio: new Date(novoEvento.data_inicio).toISOString(),
      tipo: novoEvento.tipo,
      modulo: novoEvento.modulo || null,
    });

    if (error) {
      toast.error('Erro ao adicionar evento');
      return;
    }

    toast.success('Evento adicionado!');
    setDialogOpen(false);
    setNovoEvento({
      titulo: '',
      descricao: '',
      data_inicio: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      tipo: 'evento',
      modulo: '',
    });
    carregarEventos();
  };

  const toggleConcluido = async (evento: Evento) => {
    const { error } = await supabase
      .from('calendario_eventos')
      .update({ concluido: !evento.concluido })
      .eq('id', evento.id);

    if (!error) {
      setEventos(eventos.map(e => 
        e.id === evento.id ? { ...e, concluido: !e.concluido } : e
      ));
      toast.success(evento.concluido ? 'Desmarcado' : 'Concluído!');
    }
  };

  const excluirEvento = async (id: string) => {
    const { error } = await supabase
      .from('calendario_eventos')
      .delete()
      .eq('id', id);

    if (!error) {
      setEventos(eventos.filter(e => e.id !== id));
      toast.success('Evento removido');
    }
  };

  const eventosDoDia = eventos.filter(e => 
    isSameDay(parseISO(e.data_inicio), selectedDate)
  );

  const diasComEventos = eventos.map(e => parseISO(e.data_inicio));

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:ml-64">
      <ModuleHeader 
        title="Calendário Unificado" 
        subtitle="Todos os seus compromissos em um só lugar"
        icon={CalendarDays}
        gradient="calendario"
      />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Calendário */}
          <Card>
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ptBR}
                className="rounded-md border-0"
                modifiers={{
                  hasEvent: diasComEventos
                }}
                modifiersStyles={{
                  hasEvent: { 
                    backgroundColor: 'hsl(var(--primary) / 0.2)',
                    borderRadius: '50%'
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Eventos do dia */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">
                {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
              </CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Adicionar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Evento</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Título</Label>
                      <Input
                        value={novoEvento.titulo}
                        onChange={(e) => setNovoEvento({ ...novoEvento, titulo: e.target.value })}
                        placeholder="Ex: Reunião, Consulta médica..."
                      />
                    </div>
                    <div>
                      <Label>Data e Hora</Label>
                      <Input
                        type="datetime-local"
                        value={novoEvento.data_inicio}
                        onChange={(e) => setNovoEvento({ ...novoEvento, data_inicio: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Módulo (opcional)</Label>
                      <Select
                        value={novoEvento.modulo}
                        onValueChange={(v) => setNovoEvento({ ...novoEvento, modulo: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um módulo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="casa">🏠 Casa</SelectItem>
                          <SelectItem value="saude">❤️ Saúde</SelectItem>
                          <SelectItem value="bem_estar">😊 Bem-estar</SelectItem>
                          <SelectItem value="financas">💰 Finanças</SelectItem>
                          <SelectItem value="telemedicina">🩺 Consulta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Descrição (opcional)</Label>
                      <Textarea
                        value={novoEvento.descricao}
                        onChange={(e) => setNovoEvento({ ...novoEvento, descricao: e.target.value })}
                        placeholder="Detalhes do evento..."
                      />
                    </div>
                    <Button onClick={adicionarEvento} className="w-full">
                      Salvar Evento
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {eventosDoDia.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum evento neste dia
                </p>
              ) : (
                <div className="space-y-3">
                  {eventosDoDia.map((evento) => {
                    const config = evento.modulo ? moduloConfig[evento.modulo] : null;
                    const Icon = config?.icon || Clock;
                    
                    return (
                      <div
                        key={evento.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${
                          evento.concluido ? 'bg-muted/50 opacity-60' : 'bg-card'
                        }`}
                      >
                        <button onClick={() => toggleConcluido(evento)}>
                          {evento.concluido ? (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${evento.concluido ? 'line-through' : ''}`}>
                              {evento.titulo}
                            </span>
                            {config && (
                              <Badge variant="secondary" className={`${config.color} text-xs`}>
                                <Icon className="h-3 w-3 mr-1" />
                                {config.label}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(parseISO(evento.data_inicio), 'HH:mm')}
                            {evento.descricao && ` • ${evento.descricao}`}
                          </p>
                        </div>
                        <button 
                          onClick={() => excluirEvento(evento.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Próximos eventos */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventos.filter(e => new Date(e.data_inicio) >= new Date() && !e.concluido).length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum evento futuro agendado
              </p>
            ) : (
              <div className="space-y-2">
                {eventos
                  .filter(e => new Date(e.data_inicio) >= new Date() && !e.concluido)
                  .slice(0, 5)
                  .map((evento) => (
                    <div key={evento.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">
                            {format(parseISO(evento.data_inicio), 'd')}
                          </div>
                          <div className="text-xs text-muted-foreground uppercase">
                            {format(parseISO(evento.data_inicio), 'MMM', { locale: ptBR })}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{evento.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(evento.data_inicio), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

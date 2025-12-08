import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  ShoppingCart, Plus, Trash2, Apple, Sparkles, Bath, 
  Pill, Package, MoreHorizontal, Check, AlertTriangle
} from 'lucide-react';
import { ModuleHeader } from '@/components/ui/ModuleHeader';

interface ItemCompra {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number;
  unidade: string | null;
  preco_estimado: number | null;
  comprado: boolean;
  prioridade: string;
  notas: string | null;
}

const categorias = [
  { value: 'alimentos', label: 'Alimentos', icon: Apple, color: 'bg-green-500' },
  { value: 'limpeza', label: 'Limpeza', icon: Sparkles, color: 'bg-blue-500' },
  { value: 'higiene', label: 'Higiene', icon: Bath, color: 'bg-pink-500' },
  { value: 'farmacia', label: 'Farmácia', icon: Pill, color: 'bg-red-500' },
  { value: 'mercado', label: 'Mercado', icon: Package, color: 'bg-amber-500' },
  { value: 'outros', label: 'Outros', icon: MoreHorizontal, color: 'bg-gray-500' },
];

const unidades = ['un', 'kg', 'g', 'L', 'ml', 'pct', 'cx', 'dz'];

export default function ListaCompras() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [itens, setItens] = useState<ItemCompra[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [novoItem, setNovoItem] = useState({
    nome: '',
    categoria: 'alimentos',
    quantidade: 1,
    unidade: 'un',
    preco_estimado: '',
    prioridade: 'normal',
  });
  const [filtroCategoria, setFiltroCategoria] = useState('todos');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      carregarItens();
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

  const carregarItens = async () => {
    const { data, error } = await supabase
      .from('lista_compras')
      .select('*')
      .eq('user_id', user.id)
      .order('comprado', { ascending: true })
      .order('prioridade', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setItens(data);
    }
  };

  const adicionarItem = async () => {
    if (!novoItem.nome.trim()) {
      toast.error('Digite o nome do item');
      return;
    }

    const { error } = await supabase.from('lista_compras').insert({
      user_id: user.id,
      nome: novoItem.nome,
      categoria: novoItem.categoria,
      quantidade: novoItem.quantidade,
      unidade: novoItem.unidade,
      preco_estimado: novoItem.preco_estimado ? parseFloat(novoItem.preco_estimado) : null,
      prioridade: novoItem.prioridade,
    });

    if (error) {
      toast.error('Erro ao adicionar item');
      return;
    }

    toast.success('Item adicionado!');
    setDialogOpen(false);
    setNovoItem({
      nome: '',
      categoria: 'alimentos',
      quantidade: 1,
      unidade: 'un',
      preco_estimado: '',
      prioridade: 'normal',
    });
    carregarItens();
  };

  const toggleComprado = async (item: ItemCompra) => {
    const { error } = await supabase
      .from('lista_compras')
      .update({ comprado: !item.comprado })
      .eq('id', item.id);

    if (!error) {
      setItens(itens.map(i => 
        i.id === item.id ? { ...i, comprado: !i.comprado } : i
      ));
      if (!item.comprado) {
        toast.success('Item marcado como comprado!');
      }
    }
  };

  const excluirItem = async (id: string) => {
    const { error } = await supabase
      .from('lista_compras')
      .delete()
      .eq('id', id);

    if (!error) {
      setItens(itens.filter(i => i.id !== id));
      toast.success('Item removido');
    }
  };

  const limparComprados = async () => {
    const { error } = await supabase
      .from('lista_compras')
      .delete()
      .eq('user_id', user.id)
      .eq('comprado', true);

    if (!error) {
      setItens(itens.filter(i => !i.comprado));
      toast.success('Itens comprados removidos');
    }
  };

  const itensFiltrados = filtroCategoria === 'todos' 
    ? itens 
    : itens.filter(i => i.categoria === filtroCategoria);

  const itensNaoComprados = itensFiltrados.filter(i => !i.comprado);
  const itensComprados = itensFiltrados.filter(i => i.comprado);

  const totalEstimado = itens
    .filter(i => !i.comprado && i.preco_estimado)
    .reduce((acc, i) => acc + (i.preco_estimado || 0) * i.quantidade, 0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:ml-64">
      <ModuleHeader 
        title="Lista de Compras" 
        subtitle="Organize suas compras de forma inteligente"
        icon={ShoppingCart}
        gradient="compras"
      />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Resumo */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="text-center p-3">
            <div className="text-2xl font-bold text-primary">{itensNaoComprados.length}</div>
            <div className="text-xs text-muted-foreground">Pendentes</div>
          </Card>
          <Card className="text-center p-3">
            <div className="text-2xl font-bold text-success">{itensComprados.length}</div>
            <div className="text-xs text-muted-foreground">Comprados</div>
          </Card>
          <Card className="text-center p-3">
            <div className="text-lg font-bold text-financas">
              R$ {totalEstimado.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">Estimativa</div>
          </Card>
        </div>

        {/* Filtros por categoria */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <Button
            variant={filtroCategoria === 'todos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltroCategoria('todos')}
          >
            Todos
          </Button>
          {categorias.map(cat => {
            const count = itens.filter(i => i.categoria === cat.value && !i.comprado).length;
            return (
              <Button
                key={cat.value}
                variant={filtroCategoria === cat.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroCategoria(cat.value)}
                className="whitespace-nowrap"
              >
                <cat.icon className="h-3 w-3 mr-1" />
                {cat.label} {count > 0 && `(${count})`}
              </Button>
            );
          })}
        </div>

        {/* Adicionar item */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mb-4">
              <Plus className="h-4 w-4 mr-2" /> Adicionar Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome do Item</Label>
                <Input
                  value={novoItem.nome}
                  onChange={(e) => setNovoItem({ ...novoItem, nome: e.target.value })}
                  placeholder="Ex: Arroz, Sabonete, Remédio..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Categoria</Label>
                  <Select
                    value={novoItem.categoria}
                    onValueChange={(v) => setNovoItem({ ...novoItem, categoria: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <Select
                    value={novoItem.prioridade}
                    onValueChange={(v) => setNovoItem({ ...novoItem, prioridade: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Qtd</Label>
                  <Input
                    type="number"
                    min={1}
                    value={novoItem.quantidade}
                    onChange={(e) => setNovoItem({ ...novoItem, quantidade: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label>Unidade</Label>
                  <Select
                    value={novoItem.unidade}
                    onValueChange={(v) => setNovoItem({ ...novoItem, unidade: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {unidades.map(u => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Preço (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={novoItem.preco_estimado}
                    onChange={(e) => setNovoItem({ ...novoItem, preco_estimado: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <Button onClick={adicionarItem} className="w-full">
                Adicionar à Lista
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Lista de itens */}
        <Tabs defaultValue="pendentes">
          <TabsList className="w-full">
            <TabsTrigger value="pendentes" className="flex-1">
              Pendentes ({itensNaoComprados.length})
            </TabsTrigger>
            <TabsTrigger value="comprados" className="flex-1">
              Comprados ({itensComprados.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pendentes" className="mt-4">
            {itensNaoComprados.length === 0 ? (
              <Card className="p-8 text-center">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Lista vazia! Adicione itens acima.</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {itensNaoComprados.map(item => {
                  const cat = categorias.find(c => c.value === item.categoria);
                  const Icon = cat?.icon || Package;
                  
                  return (
                    <Card key={item.id} className="p-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={item.comprado}
                          onCheckedChange={() => toggleComprado(item)}
                        />
                        <div className={`p-1.5 rounded-full ${cat?.color} text-white`}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{item.nome}</span>
                            {item.prioridade === 'urgente' && (
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            )}
                            {item.prioridade === 'alta' && (
                              <Badge variant="destructive" className="text-xs">Alta</Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.quantidade} {item.unidade}
                            {item.preco_estimado && ` • R$ ${(item.preco_estimado * item.quantidade).toFixed(2)}`}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => excluirItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="comprados" className="mt-4">
            {itensComprados.length === 0 ? (
              <Card className="p-8 text-center">
                <Check className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nenhum item comprado ainda</p>
              </Card>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={limparComprados}
                  className="mb-4"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Limpar comprados
                </Button>
                <div className="space-y-2 opacity-60">
                  {itensComprados.map(item => {
                    const cat = categorias.find(c => c.value === item.categoria);
                    const Icon = cat?.icon || Package;
                    
                    return (
                      <Card key={item.id} className="p-3 bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={item.comprado}
                            onCheckedChange={() => toggleComprado(item)}
                          />
                          <div className={`p-1.5 rounded-full bg-muted text-muted-foreground`}>
                            <Icon className="h-3 w-3" />
                          </div>
                          <span className="font-medium line-through flex-1">{item.nome}</span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

-- Tabela para Calendário Unificado
CREATE TABLE public.calendario_eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE,
  tipo TEXT NOT NULL DEFAULT 'evento', -- evento, tarefa, consulta, medicamento, ciclo, meta, lembrete
  modulo TEXT, -- casa, saude, financas, bem_estar, telemedicina
  referencia_id UUID, -- ID do item original (tarefa, consulta, etc)
  cor TEXT,
  recorrente BOOLEAN DEFAULT false,
  frequencia_recorrencia TEXT, -- diario, semanal, mensal
  lembrete_minutos INTEGER DEFAULT 30,
  concluido BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para Notificações/Lembretes
CREATE TABLE public.lembretes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT,
  tipo TEXT NOT NULL DEFAULT 'geral', -- agua, medicamento, tarefa, consulta, meta, personalizado
  modulo TEXT, -- casa, saude, financas, bem_estar
  referencia_id UUID,
  horario TIME NOT NULL,
  dias_semana TEXT[] DEFAULT ARRAY['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'],
  ativo BOOLEAN DEFAULT true,
  ultimo_disparo TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para Lista de Compras
CREATE TABLE public.lista_compras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'outros', -- alimentos, limpeza, higiene, farmacia, mercado, outros
  quantidade INTEGER DEFAULT 1,
  unidade TEXT, -- un, kg, g, l, ml, pacote, caixa
  preco_estimado NUMERIC,
  comprado BOOLEAN DEFAULT false,
  prioridade TEXT DEFAULT 'normal', -- baixa, normal, alta, urgente
  notas TEXT,
  lista_id UUID, -- para agrupar em listas diferentes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para Listas de Compras (grupos)
CREATE TABLE public.listas_compras_grupos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL DEFAULT 'Minha Lista',
  cor TEXT DEFAULT '#8B5CF6',
  icone TEXT DEFAULT 'shopping-cart',
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.calendario_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lembretes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lista_compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listas_compras_grupos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Calendário
CREATE POLICY "Usuárias gerenciam seus eventos" ON public.calendario_eventos
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS - Lembretes
CREATE POLICY "Usuárias gerenciam seus lembretes" ON public.lembretes
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS - Lista de Compras
CREATE POLICY "Usuárias gerenciam suas compras" ON public.lista_compras
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS - Grupos de Listas
CREATE POLICY "Usuárias gerenciam suas listas" ON public.listas_compras_grupos
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_calendario_eventos_updated_at
  BEFORE UPDATE ON public.calendario_eventos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lista_compras_updated_at
  BEFORE UPDATE ON public.lista_compras
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar foreign key para lista_compras -> listas_compras_grupos
ALTER TABLE public.lista_compras
  ADD CONSTRAINT fk_lista_compras_grupo
  FOREIGN KEY (lista_id) REFERENCES public.listas_compras_grupos(id)
  ON DELETE SET NULL;
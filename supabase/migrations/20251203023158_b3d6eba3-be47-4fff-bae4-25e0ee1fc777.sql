-- Criar tabela de suplementos cadastrados
CREATE TABLE public.suplementos_cadastrados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  marca TEXT,
  tipo TEXT NOT NULL DEFAULT 'outro',
  sabor TEXT,
  dosagem_recomendada TEXT,
  horario_ideal TEXT,
  quantidade_total INTEGER,
  quantidade_restante INTEGER,
  unidade TEXT DEFAULT 'g',
  data_validade DATE,
  notas TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de registro de suplementação diária
CREATE TABLE public.registro_suplementacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  suplemento_id UUID REFERENCES public.suplementos_cadastrados(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  horario TEXT,
  quantidade TEXT,
  tomou BOOLEAN NOT NULL DEFAULT true,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.suplementos_cadastrados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registro_suplementacao ENABLE ROW LEVEL SECURITY;

-- Políticas para suplementos_cadastrados
CREATE POLICY "Usuárias gerenciam seus suplementos"
ON public.suplementos_cadastrados
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Políticas para registro_suplementacao
CREATE POLICY "Usuárias gerenciam seus registros de suplementação"
ON public.registro_suplementacao
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_suplementos_updated_at
BEFORE UPDATE ON public.suplementos_cadastrados
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_suplementos_user_id ON public.suplementos_cadastrados(user_id);
CREATE INDEX idx_suplementos_ativo ON public.suplementos_cadastrados(user_id, ativo);
CREATE INDEX idx_registro_suplementacao_user_data ON public.registro_suplementacao(user_id, data);
CREATE INDEX idx_registro_suplementacao_suplemento ON public.registro_suplementacao(suplemento_id, data);
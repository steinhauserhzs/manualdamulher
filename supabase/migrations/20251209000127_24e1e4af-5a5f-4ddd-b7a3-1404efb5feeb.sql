-- Tabela para Stories da Comunidade (posts temporários 24h)
CREATE TABLE public.comunidade_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conteudo TEXT,
  imagem_url TEXT,
  visualizacoes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expira_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

ALTER TABLE public.comunidade_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stories são visíveis para todas autenticadas"
  ON public.comunidade_stories FOR SELECT
  USING (auth.uid() IS NOT NULL AND expira_em > now());

CREATE POLICY "Usuárias podem criar stories"
  ON public.comunidade_stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuárias podem deletar seus stories"
  ON public.comunidade_stories FOR DELETE
  USING (auth.uid() = user_id);

-- Tabela para visualizações de stories
CREATE TABLE public.comunidade_stories_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.comunidade_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, user_id)
);

ALTER TABLE public.comunidade_stories_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuárias podem ver visualizações"
  ON public.comunidade_stories_views FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuárias podem registrar visualização"
  ON public.comunidade_stories_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Tabela para Divisão de Despesas
CREATE TABLE public.despesas_compartilhadas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  valor_total NUMERIC NOT NULL,
  categoria TEXT DEFAULT 'outros',
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.despesas_compartilhadas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuárias gerenciam suas despesas compartilhadas"
  ON public.despesas_compartilhadas FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Participantes da despesa compartilhada
CREATE TABLE public.despesas_participantes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  despesa_id UUID NOT NULL REFERENCES public.despesas_compartilhadas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  valor_devido NUMERIC NOT NULL,
  valor_pago NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.despesas_participantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participantes visíveis para criadora"
  ON public.despesas_participantes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.despesas_compartilhadas 
    WHERE id = despesa_id AND user_id = auth.uid()
  ));

-- Triggers para updated_at
CREATE TRIGGER update_despesas_compartilhadas_updated_at
  BEFORE UPDATE ON public.despesas_compartilhadas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
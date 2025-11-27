-- Criar tabela de capítulos do e-book
CREATE TABLE public.ebook_capitulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  tempo_leitura INTEGER DEFAULT 15,
  xp_recompensa INTEGER DEFAULT 40,
  ordem INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de progresso de leitura
CREATE TABLE public.ebook_progresso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  capitulo_id UUID REFERENCES public.ebook_capitulos(id) ON DELETE CASCADE,
  progresso INTEGER DEFAULT 0,
  concluido BOOLEAN DEFAULT false,
  posicao_scroll INTEGER DEFAULT 0,
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_conclusao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, capitulo_id)
);

-- Habilitar RLS
ALTER TABLE public.ebook_capitulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ebook_progresso ENABLE ROW LEVEL SECURITY;

-- Políticas para ebook_capitulos (todos podem ver)
CREATE POLICY "Capítulos são visíveis para usuárias autenticadas"
  ON public.ebook_capitulos
  FOR SELECT
  USING (true);

CREATE POLICY "Admins podem gerenciar capítulos"
  ON public.ebook_capitulos
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Políticas para ebook_progresso (apenas próprio progresso)
CREATE POLICY "Usuárias podem ver seu progresso"
  ON public.ebook_progresso
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem inserir seu progresso"
  ON public.ebook_progresso
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuárias podem atualizar seu progresso"
  ON public.ebook_progresso
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_ebook_progresso_updated_at
  BEFORE UPDATE ON public.ebook_progresso
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir capítulos placeholder
INSERT INTO public.ebook_capitulos (numero, titulo, conteudo, tempo_leitura, xp_recompensa, ordem) VALUES
  (1, 'Introdução', '# Bem-vinda ao Manual da Mulher Independente\n\nEste é o início da sua jornada rumo à independência e autonomia.\n\n## O que você vai aprender\n\nNeste e-book, você descobrirá ferramentas práticas para gerenciar sua vida com confiança.\n\n**Conteúdo placeholder** - Em breve você adicionará o conteúdo real aqui.', 15, 40, 1),
  (2, 'Organização da Casa', '# Organização da Casa\n\nAprenda a criar rotinas eficientes para manter sua casa organizada.\n\n**Conteúdo placeholder** - Em breve você adicionará o conteúdo real aqui.', 20, 40, 2),
  (3, 'Finanças Pessoais', '# Finanças Pessoais\n\nDomine suas finanças e construa um futuro financeiro sólido.\n\n**Conteúdo placeholder** - Em breve você adicionará o conteúdo real aqui.', 25, 40, 3),
  (4, 'Saúde Feminina', '# Saúde Feminina\n\nCuide da sua saúde de forma consciente e preventiva.\n\n**Conteúdo placeholder** - Em breve você adicionará o conteúdo real aqui.', 30, 40, 4),
  (5, 'Bem-estar e Autocuidado', '# Bem-estar e Autocuidado\n\nPriorize seu bem-estar físico e emocional.\n\n**Conteúdo placeholder** - Em breve você adicionará o conteúdo real aqui.', 20, 40, 5),
  (6, 'Planejamento de Metas', '# Planejamento de Metas\n\nEstabeleça e alcance suas metas pessoais e profissionais.\n\n**Conteúdo placeholder** - Em breve você adicionará o conteúdo real aqui.', 15, 40, 6);
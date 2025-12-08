-- =============================================
-- FASE 1: FINANÇAS AVANÇADAS
-- =============================================

-- Tabela de orçamentos por categoria
CREATE TABLE public.orcamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  categoria TEXT NOT NULL,
  valor_limite NUMERIC NOT NULL,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano INTEGER NOT NULL CHECK (ano >= 2020 AND ano <= 2100),
  alerta_percentual INTEGER DEFAULT 80 CHECK (alerta_percentual >= 0 AND alerta_percentual <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, categoria, mes, ano)
);

-- Tabela de transações recorrentes
CREATE TABLE public.transacoes_recorrentes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conta_id UUID REFERENCES public.contas_financeiras(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  categoria TEXT NOT NULL,
  descricao TEXT,
  valor NUMERIC NOT NULL,
  frequencia TEXT NOT NULL CHECK (frequencia IN ('semanal', 'quinzenal', 'mensal', 'bimestral', 'trimestral', 'semestral', 'anual')),
  dia_vencimento INTEGER CHECK (dia_vencimento >= 1 AND dia_vencimento <= 31),
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim DATE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ultima_geracao DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de dívidas e parcelamentos
CREATE TABLE public.dividas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  valor_total NUMERIC NOT NULL,
  valor_pago NUMERIC DEFAULT 0,
  taxa_juros NUMERIC,
  total_parcelas INTEGER,
  parcelas_pagas INTEGER DEFAULT 0,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento DATE,
  credor TEXT,
  categoria TEXT DEFAULT 'outros',
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'quitada', 'atrasada', 'renegociada')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de pagamentos de dívidas
CREATE TABLE public.dividas_pagamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  divida_id UUID NOT NULL REFERENCES public.dividas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  valor NUMERIC NOT NULL,
  data_pagamento DATE NOT NULL DEFAULT CURRENT_DATE,
  numero_parcela INTEGER,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes_recorrentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividas_pagamentos ENABLE ROW LEVEL SECURITY;

-- Policies para orçamentos
CREATE POLICY "Usuárias gerenciam seus orçamentos"
ON public.orcamentos FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies para transações recorrentes
CREATE POLICY "Usuárias gerenciam suas transações recorrentes"
ON public.transacoes_recorrentes FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies para dívidas
CREATE POLICY "Usuárias gerenciam suas dívidas"
ON public.dividas FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies para pagamentos de dívidas
CREATE POLICY "Usuárias gerenciam seus pagamentos"
ON public.dividas_pagamentos FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_orcamentos_updated_at
BEFORE UPDATE ON public.orcamentos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transacoes_recorrentes_updated_at
BEFORE UPDATE ON public.transacoes_recorrentes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dividas_updated_at
BEFORE UPDATE ON public.dividas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- FASE 2: COMUNIDADE AVANÇADA
-- =============================================

-- Tabela de mensagens diretas
CREATE TABLE public.mensagens_diretas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  remetente_id UUID NOT NULL,
  destinatario_id UUID NOT NULL,
  conteudo TEXT NOT NULL,
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de grupos/comunidades temáticas
CREATE TABLE public.comunidade_grupos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  icone TEXT,
  cor TEXT DEFAULT '#8B5CF6',
  criadora_id UUID NOT NULL,
  privado BOOLEAN DEFAULT false,
  membros_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de membros dos grupos
CREATE TABLE public.comunidade_grupos_membros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grupo_id UUID NOT NULL REFERENCES public.comunidade_grupos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  papel TEXT DEFAULT 'membro' CHECK (papel IN ('admin', 'moderador', 'membro')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(grupo_id, user_id)
);

-- Tabela de notificações
CREATE TABLE public.notificacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('curtida', 'comentario', 'seguidor', 'mencao', 'mensagem', 'grupo', 'sistema')),
  titulo TEXT NOT NULL,
  mensagem TEXT,
  referencia_id UUID,
  referencia_tipo TEXT,
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de badges da comunidade
CREATE TABLE public.comunidade_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  icone TEXT,
  cor TEXT DEFAULT '#8B5CF6',
  criterio TEXT NOT NULL,
  pontos_necessarios INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de badges conquistados pelas usuárias
CREATE TABLE public.comunidade_badges_usuario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.comunidade_badges(id) ON DELETE CASCADE,
  data_conquista TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.mensagens_diretas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunidade_grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunidade_grupos_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunidade_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunidade_badges_usuario ENABLE ROW LEVEL SECURITY;

-- Policies para mensagens diretas
CREATE POLICY "Usuárias veem suas mensagens"
ON public.mensagens_diretas FOR SELECT
USING (auth.uid() = remetente_id OR auth.uid() = destinatario_id);

CREATE POLICY "Usuárias enviam mensagens"
ON public.mensagens_diretas FOR INSERT
WITH CHECK (auth.uid() = remetente_id);

CREATE POLICY "Usuárias atualizam suas mensagens recebidas"
ON public.mensagens_diretas FOR UPDATE
USING (auth.uid() = destinatario_id);

-- Policies para grupos
CREATE POLICY "Grupos públicos são visíveis"
ON public.comunidade_grupos FOR SELECT
USING (NOT privado OR criadora_id = auth.uid() OR EXISTS (
  SELECT 1 FROM comunidade_grupos_membros WHERE grupo_id = id AND user_id = auth.uid()
));

CREATE POLICY "Usuárias podem criar grupos"
ON public.comunidade_grupos FOR INSERT
WITH CHECK (auth.uid() = criadora_id);

CREATE POLICY "Admins podem atualizar grupos"
ON public.comunidade_grupos FOR UPDATE
USING (criadora_id = auth.uid() OR EXISTS (
  SELECT 1 FROM comunidade_grupos_membros WHERE grupo_id = id AND user_id = auth.uid() AND papel = 'admin'
));

CREATE POLICY "Criadoras podem deletar grupos"
ON public.comunidade_grupos FOR DELETE
USING (criadora_id = auth.uid());

-- Policies para membros de grupos
CREATE POLICY "Membros são visíveis"
ON public.comunidade_grupos_membros FOR SELECT
USING (true);

CREATE POLICY "Usuárias podem entrar em grupos"
ON public.comunidade_grupos_membros FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuárias podem sair de grupos"
ON public.comunidade_grupos_membros FOR DELETE
USING (auth.uid() = user_id);

-- Policies para notificações
CREATE POLICY "Usuárias veem suas notificações"
ON public.notificacoes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Sistema cria notificações"
ON public.notificacoes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Usuárias atualizam suas notificações"
ON public.notificacoes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuárias deletam suas notificações"
ON public.notificacoes FOR DELETE
USING (auth.uid() = user_id);

-- Policies para badges
CREATE POLICY "Badges são visíveis para todas"
ON public.comunidade_badges FOR SELECT
USING (true);

CREATE POLICY "Admins gerenciam badges"
ON public.comunidade_badges FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Policies para badges de usuárias
CREATE POLICY "Badges de usuárias são visíveis"
ON public.comunidade_badges_usuario FOR SELECT
USING (true);

CREATE POLICY "Sistema atribui badges"
ON public.comunidade_badges_usuario FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_comunidade_grupos_updated_at
BEFORE UPDATE ON public.comunidade_grupos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- FASE 3: MARKETPLACE AVANÇADO
-- =============================================

-- Tabela de conversas do marketplace
CREATE TABLE public.marketplace_conversas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  anuncio_id UUID REFERENCES public.marketplace_anuncios(id) ON DELETE SET NULL,
  servico_id UUID REFERENCES public.marketplace_servicos(id) ON DELETE SET NULL,
  comprador_id UUID NOT NULL,
  vendedor_id UUID NOT NULL,
  status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'fechada', 'negociando', 'finalizada')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de mensagens do marketplace
CREATE TABLE public.marketplace_mensagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversa_id UUID NOT NULL REFERENCES public.marketplace_conversas(id) ON DELETE CASCADE,
  remetente_id UUID NOT NULL,
  conteudo TEXT NOT NULL,
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de anúncios de troca
CREATE TABLE public.marketplace_trocas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL,
  imagens TEXT[],
  aceita_troca_por TEXT[],
  localizacao TEXT,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'trocado')),
  visualizacoes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de propostas de troca
CREATE TABLE public.marketplace_propostas_troca (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  troca_id UUID NOT NULL REFERENCES public.marketplace_trocas(id) ON DELETE CASCADE,
  proponente_id UUID NOT NULL,
  descricao_oferta TEXT NOT NULL,
  imagens_oferta TEXT[],
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceita', 'recusada', 'negociando')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de vendedoras verificadas
CREATE TABLE public.marketplace_verificacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  documento_tipo TEXT,
  documento_verificado BOOLEAN DEFAULT false,
  telefone_verificado BOOLEAN DEFAULT false,
  email_verificado BOOLEAN DEFAULT true,
  nivel_verificacao INTEGER DEFAULT 1 CHECK (nivel_verificacao >= 1 AND nivel_verificacao <= 3),
  total_vendas INTEGER DEFAULT 0,
  avaliacao_media NUMERIC DEFAULT 0,
  selo_vendedora_confiavel BOOLEAN DEFAULT false,
  data_primeira_venda DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_trocas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_propostas_troca ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_verificacoes ENABLE ROW LEVEL SECURITY;

-- Policies para conversas do marketplace
CREATE POLICY "Usuárias veem suas conversas"
ON public.marketplace_conversas FOR SELECT
USING (auth.uid() = comprador_id OR auth.uid() = vendedor_id);

CREATE POLICY "Usuárias criam conversas"
ON public.marketplace_conversas FOR INSERT
WITH CHECK (auth.uid() = comprador_id);

CREATE POLICY "Participantes atualizam conversas"
ON public.marketplace_conversas FOR UPDATE
USING (auth.uid() = comprador_id OR auth.uid() = vendedor_id);

-- Policies para mensagens do marketplace
CREATE POLICY "Participantes veem mensagens"
ON public.marketplace_mensagens FOR SELECT
USING (EXISTS (
  SELECT 1 FROM marketplace_conversas 
  WHERE id = conversa_id 
  AND (comprador_id = auth.uid() OR vendedor_id = auth.uid())
));

CREATE POLICY "Participantes enviam mensagens"
ON public.marketplace_mensagens FOR INSERT
WITH CHECK (auth.uid() = remetente_id AND EXISTS (
  SELECT 1 FROM marketplace_conversas 
  WHERE id = conversa_id 
  AND (comprador_id = auth.uid() OR vendedor_id = auth.uid())
));

CREATE POLICY "Destinatários marcam como lida"
ON public.marketplace_mensagens FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM marketplace_conversas 
  WHERE id = conversa_id 
  AND (comprador_id = auth.uid() OR vendedor_id = auth.uid())
) AND remetente_id != auth.uid());

-- Policies para trocas
CREATE POLICY "Trocas ativas são visíveis"
ON public.marketplace_trocas FOR SELECT
USING (status = 'ativo' OR auth.uid() = user_id);

CREATE POLICY "Usuárias criam trocas"
ON public.marketplace_trocas FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuárias atualizam suas trocas"
ON public.marketplace_trocas FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuárias deletam suas trocas"
ON public.marketplace_trocas FOR DELETE
USING (auth.uid() = user_id);

-- Policies para propostas de troca
CREATE POLICY "Propostas são visíveis para envolvidos"
ON public.marketplace_propostas_troca FOR SELECT
USING (auth.uid() = proponente_id OR EXISTS (
  SELECT 1 FROM marketplace_trocas WHERE id = troca_id AND user_id = auth.uid()
));

CREATE POLICY "Usuárias criam propostas"
ON public.marketplace_propostas_troca FOR INSERT
WITH CHECK (auth.uid() = proponente_id);

CREATE POLICY "Envolvidos atualizam propostas"
ON public.marketplace_propostas_troca FOR UPDATE
USING (auth.uid() = proponente_id OR EXISTS (
  SELECT 1 FROM marketplace_trocas WHERE id = troca_id AND user_id = auth.uid()
));

-- Policies para verificações
CREATE POLICY "Verificações são visíveis"
ON public.marketplace_verificacoes FOR SELECT
USING (true);

CREATE POLICY "Usuárias criam sua verificação"
ON public.marketplace_verificacoes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuárias atualizam sua verificação"
ON public.marketplace_verificacoes FOR UPDATE
USING (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_marketplace_conversas_updated_at
BEFORE UPDATE ON public.marketplace_conversas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_trocas_updated_at
BEFORE UPDATE ON public.marketplace_trocas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_propostas_updated_at
BEFORE UPDATE ON public.marketplace_propostas_troca
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_verificacoes_updated_at
BEFORE UPDATE ON public.marketplace_verificacoes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar coluna grupo_id aos posts da comunidade
ALTER TABLE public.comunidade_posts ADD COLUMN IF NOT EXISTS grupo_id UUID REFERENCES public.comunidade_grupos(id) ON DELETE SET NULL;

-- Adicionar coluna aceita_troca aos anúncios do marketplace
ALTER TABLE public.marketplace_anuncios ADD COLUMN IF NOT EXISTS aceita_troca BOOLEAN DEFAULT false;
ALTER TABLE public.marketplace_anuncios ADD COLUMN IF NOT EXISTS localizacao TEXT;
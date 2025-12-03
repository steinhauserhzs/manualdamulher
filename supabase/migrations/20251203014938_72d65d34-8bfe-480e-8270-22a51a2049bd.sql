-- Criar bucket de storage para imagens do marketplace
INSERT INTO storage.buckets (id, name, public) VALUES ('marketplace-imagens', 'marketplace-imagens', true);

-- Políticas de storage para marketplace-imagens
CREATE POLICY "Imagens do marketplace são públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'marketplace-imagens');

CREATE POLICY "Usuárias podem fazer upload de imagens do marketplace"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'marketplace-imagens' AND auth.uid() IS NOT NULL);

CREATE POLICY "Usuárias podem deletar suas próprias imagens do marketplace"
ON storage.objects FOR DELETE
USING (bucket_id = 'marketplace-imagens' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Tabela de anúncios do brechó
CREATE TABLE public.marketplace_anuncios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  preco NUMERIC NOT NULL,
  categoria TEXT NOT NULL,
  condicao TEXT NOT NULL DEFAULT 'usado_bom',
  imagens TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'ativo',
  visualizacoes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_anuncios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anúncios ativos são visíveis para todas"
ON public.marketplace_anuncios FOR SELECT
USING (status = 'ativo' OR auth.uid() = user_id);

CREATE POLICY "Usuárias podem criar anúncios"
ON public.marketplace_anuncios FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuárias podem atualizar seus anúncios"
ON public.marketplace_anuncios FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem deletar seus anúncios"
ON public.marketplace_anuncios FOR DELETE
USING (auth.uid() = user_id);

-- Tabela de serviços
CREATE TABLE public.marketplace_servicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL,
  preco_minimo NUMERIC,
  preco_maximo NUMERIC,
  tipo_preco TEXT DEFAULT 'negociavel',
  imagens TEXT[] DEFAULT '{}',
  portfolio TEXT[] DEFAULT '{}',
  contato_whatsapp TEXT,
  contato_instagram TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  visualizacoes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Serviços ativos são visíveis para todas"
ON public.marketplace_servicos FOR SELECT
USING (status = 'ativo' OR auth.uid() = user_id);

CREATE POLICY "Usuárias podem criar serviços"
ON public.marketplace_servicos FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuárias podem atualizar seus serviços"
ON public.marketplace_servicos FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem deletar seus serviços"
ON public.marketplace_servicos FOR DELETE
USING (auth.uid() = user_id);

-- Tabela de parceiros (estabelecimentos)
CREATE TABLE public.marketplace_parceiros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome_estabelecimento TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  telefone TEXT,
  whatsapp TEXT,
  instagram TEXT,
  website TEXT,
  logo_url TEXT,
  banner_url TEXT,
  verificado BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'ativo',
  visualizacoes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_parceiros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parceiros ativos são visíveis para todas"
ON public.marketplace_parceiros FOR SELECT
USING (status = 'ativo' OR auth.uid() = user_id);

CREATE POLICY "Usuárias podem criar parceiros"
ON public.marketplace_parceiros FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuárias podem atualizar seus parceiros"
ON public.marketplace_parceiros FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem deletar seus parceiros"
ON public.marketplace_parceiros FOR DELETE
USING (auth.uid() = user_id);

-- Tabela de cupons
CREATE TABLE public.marketplace_cupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parceiro_id UUID REFERENCES public.marketplace_parceiros(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  codigo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo_desconto TEXT NOT NULL DEFAULT 'percentual',
  valor_desconto NUMERIC NOT NULL,
  valor_minimo NUMERIC,
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_fim TIMESTAMP WITH TIME ZONE,
  limite_uso INTEGER,
  usos_atuais INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_cupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cupons ativos são visíveis para todas"
ON public.marketplace_cupons FOR SELECT
USING (status = 'ativo' OR auth.uid() = user_id);

CREATE POLICY "Usuárias podem criar cupons"
ON public.marketplace_cupons FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuárias podem atualizar seus cupons"
ON public.marketplace_cupons FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem deletar seus cupons"
ON public.marketplace_cupons FOR DELETE
USING (auth.uid() = user_id);

-- Tabela de favoritos
CREATE TABLE public.marketplace_favoritos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  anuncio_id UUID REFERENCES public.marketplace_anuncios(id) ON DELETE CASCADE,
  servico_id UUID REFERENCES public.marketplace_servicos(id) ON DELETE CASCADE,
  parceiro_id UUID REFERENCES public.marketplace_parceiros(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_favoritos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuárias podem ver seus favoritos"
ON public.marketplace_favoritos FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem adicionar favoritos"
ON public.marketplace_favoritos FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuárias podem remover favoritos"
ON public.marketplace_favoritos FOR DELETE
USING (auth.uid() = user_id);

-- Tabela de avaliações
CREATE TABLE public.marketplace_avaliacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  servico_id UUID REFERENCES public.marketplace_servicos(id) ON DELETE CASCADE,
  parceiro_id UUID REFERENCES public.marketplace_parceiros(id) ON DELETE CASCADE,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_avaliacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Avaliações são visíveis para todas"
ON public.marketplace_avaliacoes FOR SELECT
USING (true);

CREATE POLICY "Usuárias podem criar avaliações"
ON public.marketplace_avaliacoes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuárias podem atualizar suas avaliações"
ON public.marketplace_avaliacoes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem deletar suas avaliações"
ON public.marketplace_avaliacoes FOR DELETE
USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_marketplace_anuncios_updated_at
BEFORE UPDATE ON public.marketplace_anuncios
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_servicos_updated_at
BEFORE UPDATE ON public.marketplace_servicos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_parceiros_updated_at
BEFORE UPDATE ON public.marketplace_parceiros
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_cupons_updated_at
BEFORE UPDATE ON public.marketplace_cupons
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Criar tabelas da comunidade
CREATE TABLE IF NOT EXISTS public.comunidade_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'post' CHECK (tipo IN ('post', 'pergunta', 'dica', 'enquete')),
  titulo TEXT,
  conteudo TEXT NOT NULL,
  imagem_url TEXT,
  tags TEXT[],
  likes_count INTEGER DEFAULT 0,
  comentarios_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.comunidade_comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.comunidade_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  conteudo TEXT NOT NULL,
  parent_id UUID REFERENCES public.comunidade_comentarios(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.comunidade_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id UUID REFERENCES public.comunidade_posts(id) ON DELETE CASCADE,
  comentario_id UUID REFERENCES public.comunidade_comentarios(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK ((post_id IS NOT NULL AND comentario_id IS NULL) OR (post_id IS NULL AND comentario_id IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS public.comunidade_enquetes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.comunidade_posts(id) ON DELETE CASCADE,
  opcoes JSONB NOT NULL,
  multipla_escolha BOOLEAN DEFAULT false,
  data_fim TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.comunidade_votos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquete_id UUID NOT NULL REFERENCES public.comunidade_enquetes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  opcao_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.comunidade_seguidores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seguidor_id UUID NOT NULL,
  seguindo_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(seguidor_id, seguindo_id),
  CHECK (seguidor_id != seguindo_id)
);

CREATE TABLE IF NOT EXISTS public.comunidade_denuncias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id UUID REFERENCES public.comunidade_posts(id) ON DELETE CASCADE,
  comentario_id UUID REFERENCES public.comunidade_comentarios(id) ON DELETE CASCADE,
  motivo TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'analisada', 'resolvida', 'rejeitada')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_comunidade_posts_user_id ON public.comunidade_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_comunidade_posts_created_at ON public.comunidade_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comunidade_comentarios_post_id ON public.comunidade_comentarios(post_id);
CREATE INDEX IF NOT EXISTS idx_comunidade_likes_user_post ON public.comunidade_likes(user_id, post_id);
CREATE INDEX IF NOT EXISTS idx_comunidade_votos_enquete_user ON public.comunidade_votos(enquete_id, user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_comunidade_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comunidade_posts_updated_at
BEFORE UPDATE ON public.comunidade_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_comunidade_posts_updated_at();

-- RLS Policies para comunidade_posts
ALTER TABLE public.comunidade_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts são visíveis para todas usuárias autenticadas"
ON public.comunidade_posts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuárias podem criar seus próprios posts"
ON public.comunidade_posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuárias podem atualizar seus próprios posts"
ON public.comunidade_posts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem deletar seus próprios posts"
ON public.comunidade_posts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins podem gerenciar todos os posts"
ON public.comunidade_posts FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies para comunidade_comentarios
ALTER TABLE public.comunidade_comentarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comentários são visíveis para todas"
ON public.comunidade_comentarios FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuárias podem criar comentários"
ON public.comunidade_comentarios FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuárias podem atualizar seus comentários"
ON public.comunidade_comentarios FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem deletar seus comentários"
ON public.comunidade_comentarios FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies para comunidade_likes
ALTER TABLE public.comunidade_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes são visíveis para todas"
ON public.comunidade_likes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuárias podem dar like"
ON public.comunidade_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuárias podem remover seus likes"
ON public.comunidade_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies para comunidade_enquetes
ALTER TABLE public.comunidade_enquetes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enquetes são visíveis para todas"
ON public.comunidade_enquetes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuárias podem criar enquetes nos seus posts"
ON public.comunidade_enquetes FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.comunidade_posts
    WHERE id = post_id AND user_id = auth.uid()
  )
);

-- RLS Policies para comunidade_votos
ALTER TABLE public.comunidade_votos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votos são visíveis para todas"
ON public.comunidade_votos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuárias podem votar"
ON public.comunidade_votos FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuárias podem remover seus votos"
ON public.comunidade_votos FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies para comunidade_seguidores
ALTER TABLE public.comunidade_seguidores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seguidores são visíveis para todas"
ON public.comunidade_seguidores FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuárias podem seguir outras"
ON public.comunidade_seguidores FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = seguidor_id);

CREATE POLICY "Usuárias podem deixar de seguir"
ON public.comunidade_seguidores FOR DELETE
TO authenticated
USING (auth.uid() = seguidor_id);

-- RLS Policies para comunidade_denuncias
ALTER TABLE public.comunidade_denuncias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuárias podem criar denúncias"
ON public.comunidade_denuncias FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todas as denúncias"
ON public.comunidade_denuncias FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Criar bucket de imagens da comunidade
INSERT INTO storage.buckets (id, name, public)
VALUES ('comunidade-imagens', 'comunidade-imagens', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies para storage de imagens da comunidade
CREATE POLICY "Imagens da comunidade são públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'comunidade-imagens');

CREATE POLICY "Usuárias autenticadas podem fazer upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'comunidade-imagens');

CREATE POLICY "Usuárias podem deletar suas próprias imagens"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'comunidade-imagens' AND auth.uid()::text = (storage.foldername(name))[1]);
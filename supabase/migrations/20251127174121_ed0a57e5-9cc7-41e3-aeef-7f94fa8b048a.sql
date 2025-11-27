-- Expandir tabela perfis com novos campos
ALTER TABLE public.perfis 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS localizacao TEXT,
ADD COLUMN IF NOT EXISTS cidade TEXT,
ADD COLUMN IF NOT EXISTS estado TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS visibilidade_perfil TEXT DEFAULT 'publico';

-- Criar bucket de avatares
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatares', 'avatares', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para o bucket de avatares
-- Todos podem ver avatares públicos
CREATE POLICY "Avatares são públicos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatares');

-- Usuárias podem fazer upload do próprio avatar
CREATE POLICY "Usuárias podem fazer upload do próprio avatar"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatares' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Usuárias podem atualizar o próprio avatar
CREATE POLICY "Usuárias podem atualizar o próprio avatar"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatares' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Usuárias podem deletar o próprio avatar
CREATE POLICY "Usuárias podem deletar o próprio avatar"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatares' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
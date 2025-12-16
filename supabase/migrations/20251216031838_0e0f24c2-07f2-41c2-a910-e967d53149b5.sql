-- Adicionar campo username único na tabela perfis
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Adicionar campo anonimo na tabela comunidade_posts
ALTER TABLE comunidade_posts ADD COLUMN IF NOT EXISTS anonimo BOOLEAN DEFAULT false;

-- Adicionar campo anonimo na tabela comunidade_stories
ALTER TABLE comunidade_stories ADD COLUMN IF NOT EXISTS anonimo BOOLEAN DEFAULT false;

-- Gerar usernames iniciais para perfis existentes
UPDATE perfis 
SET username = LOWER(REGEXP_REPLACE(nome, '[^a-zA-Z0-9]', '', 'g')) || '_' || SUBSTRING(user_id::text, 1, 4)
WHERE username IS NULL;
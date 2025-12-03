-- Expandir tabela refeicoes com campos nutricionais
ALTER TABLE public.refeicoes ADD COLUMN IF NOT EXISTS calorias integer;
ALTER TABLE public.refeicoes ADD COLUMN IF NOT EXISTS proteinas numeric;
ALTER TABLE public.refeicoes ADD COLUMN IF NOT EXISTS carboidratos numeric;
ALTER TABLE public.refeicoes ADD COLUMN IF NOT EXISTS gorduras numeric;
ALTER TABLE public.refeicoes ADD COLUMN IF NOT EXISTS fibras numeric;
ALTER TABLE public.refeicoes ADD COLUMN IF NOT EXISTS foto_url text;
ALTER TABLE public.refeicoes ADD COLUMN IF NOT EXISTS porcao text;
ALTER TABLE public.refeicoes ADD COLUMN IF NOT EXISTS alimentos_identificados jsonb;

-- Criar tabela para registros diários do ciclo (relações, medicamentos, etc)
CREATE TABLE IF NOT EXISTS public.registro_ciclo_diario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  data date NOT NULL,
  teve_relacao boolean DEFAULT false,
  usou_protecao boolean,
  medicamento text,
  sintomas text[],
  humor text,
  fluxo text,
  notas text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, data)
);

-- Enable RLS
ALTER TABLE public.registro_ciclo_diario ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Usuárias gerenciam seus registros diários do ciclo"
ON public.registro_ciclo_diario
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Criar tabela para metas nutricionais
CREATE TABLE IF NOT EXISTS public.metas_nutricionais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  calorias_diarias integer DEFAULT 1800,
  proteinas_diarias integer DEFAULT 50,
  carboidratos_diarios integer DEFAULT 250,
  gorduras_diarias integer DEFAULT 65,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.metas_nutricionais ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Usuárias gerenciam suas metas nutricionais"
ON public.metas_nutricionais
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
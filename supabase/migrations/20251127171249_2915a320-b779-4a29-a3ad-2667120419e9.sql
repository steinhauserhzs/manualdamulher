-- Criar tabela para respostas interativas do e-book
CREATE TABLE IF NOT EXISTS public.ebook_respostas_interativas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tipo_resposta TEXT NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  respostas JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ebook_respostas_interativas ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Usuárias gerenciam suas respostas interativas"
  ON public.ebook_respostas_interativas
  FOR ALL
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ebook_respostas_user_tipo 
  ON public.ebook_respostas_interativas(user_id, tipo_resposta, data);

-- Add trigger for updated_at
CREATE TRIGGER update_ebook_respostas_updated_at
  BEFORE UPDATE ON public.ebook_respostas_interativas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
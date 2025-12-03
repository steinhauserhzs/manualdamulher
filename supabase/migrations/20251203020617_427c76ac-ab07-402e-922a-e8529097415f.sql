-- Tabela para cache das previsões diárias geradas por IA
CREATE TABLE public.horoscopo_diario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  signo TEXT NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  previsao_geral TEXT NOT NULL,
  amor TEXT,
  trabalho TEXT,
  saude TEXT,
  numero_sorte INTEGER,
  cor_do_dia TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(signo, data)
);

-- Tabela para perfil astrológico calculado do usuário
CREATE TABLE public.perfil_astrologico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  signo_solar TEXT NOT NULL,
  elemento TEXT NOT NULL,
  modalidade TEXT NOT NULL,
  numero_pessoal INTEGER NOT NULL,
  ano_pessoal INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.horoscopo_diario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfil_astrologico ENABLE ROW LEVEL SECURITY;

-- Políticas para horoscopo_diario (leitura pública para autenticados)
CREATE POLICY "Previsões são visíveis para usuárias autenticadas"
  ON public.horoscopo_diario
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Políticas para perfil_astrologico
CREATE POLICY "Usuárias podem ver seu perfil astrológico"
  ON public.perfil_astrologico
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem criar seu perfil astrológico"
  ON public.perfil_astrologico
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuárias podem atualizar seu perfil astrológico"
  ON public.perfil_astrologico
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_perfil_astrologico_updated_at
  BEFORE UPDATE ON public.perfil_astrologico
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de medicamentos cadastrados
CREATE TABLE public.medicamentos_cadastrados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  principio_ativo TEXT,
  tipo TEXT NOT NULL DEFAULT 'continuo', -- continuo, temporario, sos
  categoria TEXT NOT NULL DEFAULT 'outro', -- cardiaco, hormonal, psiquiatrico, analgesico, antibiotico, antiinflamatorio, vitamina, outro
  dosagem TEXT,
  quantidade_por_dose INTEGER DEFAULT 1,
  via_administracao TEXT DEFAULT 'oral', -- oral, sublingual, injetavel, topico, inalatorio
  horarios TEXT[] DEFAULT '{}',
  dias_semana TEXT[], -- null = todos os dias
  data_inicio DATE DEFAULT CURRENT_DATE,
  data_fim DATE, -- null = uso contínuo
  medico_prescreveu TEXT,
  crm_medico TEXT,
  farmacia TEXT,
  quantidade_estoque INTEGER DEFAULT 0,
  alerta_estoque_minimo INTEGER DEFAULT 10,
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de registro diário de medicamentos
CREATE TABLE public.registro_medicamento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  medicamento_id UUID REFERENCES public.medicamentos_cadastrados(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  horario_programado TEXT,
  horario_tomado TIMESTAMP WITH TIME ZONE,
  tomou BOOLEAN NOT NULL DEFAULT false,
  pulou_motivo TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de especialidades de telemedicina
CREATE TABLE public.telemedicina_especialidades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  icone TEXT,
  tipo TEXT NOT NULL DEFAULT 'medicina', -- medicina, psicologia
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de profissionais de telemedicina
CREATE TABLE public.telemedicina_profissionais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  registro_profissional TEXT NOT NULL, -- CRM ou CRP
  especialidade_id UUID REFERENCES public.telemedicina_especialidades(id),
  foto_url TEXT,
  bio TEXT,
  anos_experiencia INTEGER DEFAULT 0,
  idiomas TEXT[] DEFAULT ARRAY['Português'],
  valor_consulta DECIMAL(10,2) NOT NULL DEFAULT 0,
  duracao_consulta INTEGER DEFAULT 30, -- minutos
  disponivel BOOLEAN NOT NULL DEFAULT true,
  avaliacao_media DECIMAL(3,2) DEFAULT 0,
  total_consultas INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de agendamentos de telemedicina
CREATE TABLE public.telemedicina_agendamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  profissional_id UUID REFERENCES public.telemedicina_profissionais(id),
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  duracao_minutos INTEGER DEFAULT 30,
  tipo TEXT NOT NULL DEFAULT 'telemedicina', -- telemedicina, telepsicologia
  status TEXT NOT NULL DEFAULT 'agendado', -- agendado, confirmado, em_andamento, concluido, cancelado
  motivo_consulta TEXT,
  link_video_chamada TEXT,
  token_acesso TEXT,
  valor DECIMAL(10,2),
  pago BOOLEAN DEFAULT false,
  avaliacao_paciente INTEGER, -- 1-5
  comentario_avaliacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de histórico de consultas
CREATE TABLE public.telemedicina_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agendamento_id UUID REFERENCES public.telemedicina_agendamentos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  profissional_id UUID REFERENCES public.telemedicina_profissionais(id),
  data_consulta TIMESTAMP WITH TIME ZONE NOT NULL,
  resumo_consulta TEXT,
  prescricoes TEXT,
  orientacoes TEXT,
  proxima_consulta TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.medicamentos_cadastrados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registro_medicamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemedicina_especialidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemedicina_profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemedicina_agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemedicina_historico ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medicamentos_cadastrados
CREATE POLICY "Usuárias gerenciam seus medicamentos"
ON public.medicamentos_cadastrados
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for registro_medicamento
CREATE POLICY "Usuárias gerenciam seus registros de medicamentos"
ON public.registro_medicamento
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for telemedicina_especialidades (public read)
CREATE POLICY "Especialidades são visíveis para todas"
ON public.telemedicina_especialidades
FOR SELECT
USING (true);

CREATE POLICY "Admins gerenciam especialidades"
ON public.telemedicina_especialidades
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for telemedicina_profissionais (public read)
CREATE POLICY "Profissionais disponíveis são visíveis para todas"
ON public.telemedicina_profissionais
FOR SELECT
USING (disponivel = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins gerenciam profissionais"
ON public.telemedicina_profissionais
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for telemedicina_agendamentos
CREATE POLICY "Usuárias gerenciam seus agendamentos"
ON public.telemedicina_agendamentos
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for telemedicina_historico
CREATE POLICY "Usuárias veem seu histórico"
ON public.telemedicina_historico
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode inserir histórico"
ON public.telemedicina_historico
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_medicamentos_updated_at
BEFORE UPDATE ON public.medicamentos_cadastrados
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profissionais_updated_at
BEFORE UPDATE ON public.telemedicina_profissionais
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at
BEFORE UPDATE ON public.telemedicina_agendamentos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir especialidades iniciais
INSERT INTO public.telemedicina_especialidades (nome, descricao, icone, tipo) VALUES
('Clínico Geral', 'Consultas gerais de saúde, check-ups e orientações', '🩺', 'medicina'),
('Ginecologista', 'Saúde da mulher, exames preventivos e acompanhamento', '👩‍⚕️', 'medicina'),
('Dermatologista', 'Cuidados com a pele, cabelos e unhas', '✨', 'medicina'),
('Endocrinologista', 'Hormônios, tireoide, diabetes e metabolismo', '⚗️', 'medicina'),
('Nutricionista', 'Alimentação saudável e reeducação alimentar', '🥗', 'medicina'),
('Psicólogo(a)', 'Saúde mental, terapia e acompanhamento psicológico', '🧠', 'psicologia'),
('Psiquiatra', 'Saúde mental, medicação e acompanhamento', '💊', 'medicina'),
('Cardiologista', 'Saúde do coração e sistema cardiovascular', '❤️', 'medicina');

-- Inserir profissionais de exemplo
INSERT INTO public.telemedicina_profissionais (nome, registro_profissional, especialidade_id, bio, anos_experiencia, valor_consulta, duracao_consulta, avaliacao_media, total_consultas) VALUES
('Dra. Ana Carolina Silva', 'CRM 123456/SP', (SELECT id FROM telemedicina_especialidades WHERE nome = 'Clínico Geral'), 'Médica com 15 anos de experiência em atendimento humanizado. Especialista em saúde da mulher e medicina preventiva.', 15, 150.00, 30, 4.9, 1250),
('Dra. Beatriz Santos', 'CRM 234567/SP', (SELECT id FROM telemedicina_especialidades WHERE nome = 'Ginecologista'), 'Ginecologista e obstetra focada no cuidado integral da saúde feminina.', 12, 180.00, 40, 4.8, 890),
('Dr. Carlos Mendes', 'CRM 345678/RJ', (SELECT id FROM telemedicina_especialidades WHERE nome = 'Dermatologista'), 'Dermatologista especializado em tratamentos estéticos e clínicos.', 10, 200.00, 30, 4.7, 650),
('Dra. Diana Oliveira', 'CRP 12345/SP', (SELECT id FROM telemedicina_especialidades WHERE nome = 'Psicólogo(a)'), 'Psicóloga clínica especializada em terapia cognitivo-comportamental para ansiedade e depressão.', 8, 160.00, 50, 4.95, 2100),
('Dra. Elena Ferreira', 'CRP 23456/MG', (SELECT id FROM telemedicina_especialidades WHERE nome = 'Psicólogo(a)'), 'Psicóloga com foco em autoestima, relacionamentos e desenvolvimento pessoal feminino.', 6, 140.00, 50, 4.85, 980),
('Dra. Fernanda Lima', 'CRM 456789/SP', (SELECT id FROM telemedicina_especialidades WHERE nome = 'Endocrinologista'), 'Endocrinologista especialista em tireoide e saúde hormonal feminina.', 14, 220.00, 40, 4.75, 720),
('Dra. Gabriela Costa', 'CRN 56789/SP', (SELECT id FROM telemedicina_especialidades WHERE nome = 'Nutricionista'), 'Nutricionista funcional com abordagem integrativa e gentil.', 7, 130.00, 45, 4.9, 1450);

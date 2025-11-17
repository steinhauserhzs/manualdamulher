-- Tabela para dicas de vida prática
CREATE TABLE IF NOT EXISTS public.dicas_praticas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria TEXT NOT NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  checklist JSONB,
  ordem INTEGER DEFAULT 0,
  destacada BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para favoritos de dicas (por usuária)
CREATE TABLE IF NOT EXISTS public.dicas_favoritas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dica_id UUID REFERENCES public.dicas_praticas(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, dica_id)
);

-- Tabela para progresso de onboarding
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  completed BOOLEAN DEFAULT false,
  step TEXT,
  dados_onboarding JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabela para progresso de tutoriais
CREATE TABLE IF NOT EXISTS public.tutorial_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  modulo TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  step_atual INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, modulo)
);

-- Tabela para artigos de ajuda
CREATE TABLE IF NOT EXISTS public.ajuda_artigos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria TEXT NOT NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  helpful_yes INTEGER DEFAULT 0,
  helpful_no INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.dicas_praticas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dicas_favoritas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ajuda_artigos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para dicas_praticas (públicas para leitura, admin para escrita)
CREATE POLICY "Dicas são visíveis para todas autenticadas"
ON public.dicas_praticas
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins podem gerenciar dicas"
ON public.dicas_praticas
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Políticas RLS para dicas_favoritas
CREATE POLICY "Usuárias gerenciam suas favoritas"
ON public.dicas_favoritas
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para onboarding_progress
CREATE POLICY "Usuárias gerenciam seu onboarding"
ON public.onboarding_progress
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para tutorial_progress
CREATE POLICY "Usuárias gerenciam seu progresso de tutorial"
ON public.tutorial_progress
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para ajuda_artigos (públicos para leitura, admin para escrita)
CREATE POLICY "Artigos de ajuda são visíveis para todas autenticadas"
ON public.ajuda_artigos
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins podem gerenciar artigos de ajuda"
ON public.ajuda_artigos
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Criar bucket de storage para recursos digitais (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recursos-digitais',
  'recursos-digitais',
  true,
  52428800,
  ARRAY['application/pdf', 'application/epub+zip', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para recursos digitais
CREATE POLICY "Recursos digitais são públicos para leitura"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'recursos-digitais');

CREATE POLICY "Admins podem fazer upload de recursos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'recursos-digitais' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins podem deletar recursos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'recursos-digitais' AND has_role(auth.uid(), 'admin'::app_role));

-- Inserir alguns artigos de ajuda iniciais
INSERT INTO public.ajuda_artigos (categoria, titulo, conteudo, ordem) VALUES
('primeiros-passos', 'Como criar minha primeira tarefa?', 'Para criar sua primeira tarefa, vá até a seção "Casa" no menu lateral. Clique no botão "Nova Tarefa" e preencha os campos: nome da tarefa, descrição (opcional), categoria, frequência e pontos XP. Cada tarefa concluída te dá pontos de experiência!', 1),
('primeiros-passos', 'Como registrar água?', 'Na seção "Saúde", você encontrará um card com a meta de água do dia. Clique em "Adicionar Água" e selecione a quantidade consumida (200ml, 500ml, etc.). A meta padrão é 2000ml por dia, mas você pode ajustar nas configurações.', 2),
('primeiros-passos', 'Como funciona o XP?', 'XP (Pontos de Experiência) é um sistema de gamificação que recompensa suas conquistas! Cada tarefa da casa completada te dá pontos. Acumule XP para subir de nível e desbloquear badges especiais. Quanto mais você faz, mais você evolui!', 3),
('casa', 'Como ganhar XP?', 'Você ganha XP completando tarefas da casa. O valor de XP varia conforme a dificuldade da tarefa. Tarefas diárias valem menos, mas somam bastante no mês. Tarefas semanais ou mensais valem mais XP!', 1),
('casa', 'O que são badges?', 'Badges são conquistas especiais que você desbloqueia ao completar desafios! Por exemplo: "Primeira Tarefa", "7 Dias Consecutivos", "100 XP Acumulados". Cada badge é uma celebração do seu progresso!', 2),
('saude', 'Como acompanhar meu ciclo?', 'Na seção "Saúde", role até encontrar o calendário menstrual. Clique em "Registrar Período" e informe a data de início e fim. O sistema calculará automaticamente a previsão do próximo ciclo!', 1),
('bem-estar', 'O que é streak?', 'Streak é a sequência de dias consecutivos que você mantém um hábito! Por exemplo, se você meditar 7 dias seguidos, seu streak é 7 🔥. Mantenha seu streak para criar hábitos duradouros!', 1),
('financas', 'Como criar metas financeiras?', 'Na seção "Finanças", clique em "Nova Meta". Defina o nome da meta (ex: "Viagem"), o valor total que deseja juntar, quanto já tem guardado e uma data limite (opcional). Acompanhe seu progresso visualmente!', 1);

-- Inserir algumas dicas de vida prática
INSERT INTO public.dicas_praticas (categoria, titulo, conteudo, checklist, ordem, destacada) VALUES
('documentos', 'Documentos Essenciais para Ter em Casa', 'Mantenha seus documentos organizados e sempre à mão. É importante ter cópias físicas e digitais dos principais documentos.', 
'["RG e CPF", "Certidão de Nascimento", "Título de Eleitor", "Carteira de Trabalho", "Comprovante de Residência", "Cartão do SUS", "Carteira de Vacinação"]', 1, true),
('documentos', 'Como Organizar Seus Documentos', 'Use pastas separadas por categoria: Pessoal, Financeiro, Saúde, Trabalho. Mantenha tudo em um lugar seguro e de fácil acesso.', 
'["Comprar pastas organizadoras", "Separar por categoria", "Fazer cópias digitais", "Guardar em local seguro", "Atualizar regularmente"]', 2, false),
('planejamento', 'Planejamento Mensal Simplificado', 'Reserve um dia no início do mês para planejar. Liste suas prioridades, compromissos e metas.', 
'["Revisar mês anterior", "Listar compromissos fixos", "Definir metas do mês", "Planejar orçamento", "Organizar tarefas da casa"]', 1, true),
('burocracias', 'Como Abrir uma Conta Bancária', 'Abrir uma conta bancária é simples e essencial para sua independência financeira.', 
'["Pesquisar bancos (compare taxas)", "Separar RG, CPF e comprovante de residência", "Agendar atendimento ou fazer online", "Levar documentos originais", "Ativar aplicativo do banco"]', 1, false),
('filhos', 'Rotina com Filhos Pequenos', 'Estabelecer uma rotina ajuda a organizar o dia e reduz o estresse.', 
'["Definir horário de acordar", "Preparar café da manhã saudável", "Organizar roupas na noite anterior", "Estabelecer horário de sono", "Reservar tempo para brincar"]', 1, true);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_dicas_praticas_categoria ON public.dicas_praticas(categoria);
CREATE INDEX IF NOT EXISTS idx_dicas_praticas_destacada ON public.dicas_praticas(destacada);
CREATE INDEX IF NOT EXISTS idx_dicas_favoritas_user_id ON public.dicas_favoritas(user_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_progress_user_id ON public.tutorial_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user_id ON public.onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_ajuda_artigos_categoria ON public.ajuda_artigos(categoria);
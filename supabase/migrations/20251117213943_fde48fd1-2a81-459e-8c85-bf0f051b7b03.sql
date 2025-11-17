-- Criar enum para tipo de usuário
CREATE TYPE public.tipo_usuario AS ENUM ('usuario', 'admin');

-- Criar enum para app_role (sistema de permissões)
CREATE TYPE public.app_role AS ENUM ('admin', 'usuario');

-- Tabela de perfis de usuárias
CREATE TABLE public.perfis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  pronome TEXT,
  data_nascimento DATE,
  objetivos TEXT,
  tipo_usuario tipo_usuario DEFAULT 'usuario' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabela de roles (separada para segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, role)
);

-- Função para verificar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Trigger para criar perfil automaticamente ao criar usuária
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfis (user_id, nome, tipo_usuario)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuária'),
    'usuario'
  );
  
  -- Adicionar role padrão
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'usuario');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===== MÓDULO CASA =====

-- Categorias de tarefas da casa
CREATE TABLE public.categorias_tarefa_casa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  icone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tarefas da casa
CREATE TABLE public.tarefas_casa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  categoria_id UUID REFERENCES public.categorias_tarefa_casa(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  frequencia TEXT DEFAULT 'diaria' NOT NULL,
  data_proxima_execucao DATE,
  ativo BOOLEAN DEFAULT true NOT NULL,
  pontos_xp INTEGER DEFAULT 10 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Histórico de conclusão de tarefas
CREATE TABLE public.tarefas_casa_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id UUID REFERENCES public.tarefas_casa(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data_conclusao TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  observacoes TEXT
);

-- Badges/Conquistas
CREATE TABLE public.badges_casa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  criterio TEXT NOT NULL,
  icone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Badges conquistadas por usuárias
CREATE TABLE public.badges_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges_casa(id) ON DELETE CASCADE NOT NULL,
  data_conquista TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, badge_id)
);

-- ===== MÓDULO SAÚDE =====

-- Resumo diário de saúde
CREATE TABLE public.saude_resumo_diario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL,
  humor TEXT,
  energia INTEGER CHECK (energia >= 0 AND energia <= 10),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, data)
);

-- Registro de água
CREATE TABLE public.registro_agua (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL,
  quantidade_ml INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Refeições
CREATE TABLE public.refeicoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  tipo TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Ciclo menstrual
CREATE TABLE public.ciclo_menstrual (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  intensidade TEXT,
  sintomas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ===== MÓDULO BEM-ESTAR =====

-- Hábitos de bem-estar
CREATE TABLE public.habitos_bem_estar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  frequencia TEXT DEFAULT 'diario' NOT NULL,
  ativo BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Histórico de hábitos
CREATE TABLE public.habitos_bem_estar_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habito_id UUID REFERENCES public.habitos_bem_estar(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL,
  concluido BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(habito_id, data)
);

-- ===== MÓDULO FINANÇAS =====

-- Contas financeiras
CREATE TABLE public.contas_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  saldo_atual DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Transações financeiras
CREATE TABLE public.transacoes_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  conta_id UUID REFERENCES public.contas_financeiras(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT,
  valor DECIMAL(10,2) NOT NULL,
  data DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Metas financeiras
CREATE TABLE public.metas_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  valor_atual DECIMAL(10,2) DEFAULT 0,
  data_limite DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ===== NOTAS =====

CREATE TABLE public.notas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT,
  categoria TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ===== BLOG =====

CREATE TABLE public.categorias_blog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE public.posts_blog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  categoria_id UUID REFERENCES public.categorias_blog(id) ON DELETE SET NULL,
  conteudo TEXT NOT NULL,
  autor TEXT,
  data_publicacao TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'rascunho' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ===== RECURSOS DIGITAIS (E-BOOKS) =====

CREATE TABLE public.recursos_digitais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  url_arquivo TEXT,
  exige_login BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ===== TRIGGERS DE UPDATED_AT =====

CREATE TRIGGER update_perfis_updated_at BEFORE UPDATE ON public.perfis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tarefas_casa_updated_at BEFORE UPDATE ON public.tarefas_casa
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_habitos_bem_estar_updated_at BEFORE UPDATE ON public.habitos_bem_estar
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contas_financeiras_updated_at BEFORE UPDATE ON public.contas_financeiras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_metas_financeiras_updated_at BEFORE UPDATE ON public.metas_financeiras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notas_updated_at BEFORE UPDATE ON public.notas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_blog_updated_at BEFORE UPDATE ON public.posts_blog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recursos_digitais_updated_at BEFORE UPDATE ON public.recursos_digitais
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== RLS POLICIES =====

-- Perfis
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuárias podem ver seu próprio perfil"
  ON public.perfis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem atualizar seu próprio perfil"
  ON public.perfis FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os perfis"
  ON public.perfis FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- User Roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuárias podem ver suas próprias roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins podem gerenciar roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Tarefas Casa
ALTER TABLE public.tarefas_casa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuárias podem ver suas próprias tarefas"
  ON public.tarefas_casa FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem criar suas próprias tarefas"
  ON public.tarefas_casa FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuárias podem atualizar suas próprias tarefas"
  ON public.tarefas_casa FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem deletar suas próprias tarefas"
  ON public.tarefas_casa FOR DELETE
  USING (auth.uid() = user_id);

-- Histórico Tarefas
ALTER TABLE public.tarefas_casa_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuárias podem ver seu próprio histórico"
  ON public.tarefas_casa_historico FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem criar seu próprio histórico"
  ON public.tarefas_casa_historico FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Categorias Casa (público para leitura)
ALTER TABLE public.categorias_tarefa_casa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categorias são visíveis para todas"
  ON public.categorias_tarefa_casa FOR SELECT
  USING (true);

CREATE POLICY "Admins podem gerenciar categorias"
  ON public.categorias_tarefa_casa FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Badges (público para leitura)
ALTER TABLE public.badges_casa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges são visíveis para todas"
  ON public.badges_casa FOR SELECT
  USING (true);

CREATE POLICY "Admins podem gerenciar badges"
  ON public.badges_casa FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Badges Usuário
ALTER TABLE public.badges_usuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuárias podem ver suas próprias badges"
  ON public.badges_usuario FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode criar badges para usuárias"
  ON public.badges_usuario FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Saúde
ALTER TABLE public.saude_resumo_diario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuárias gerenciam seu próprio resumo"
  ON public.saude_resumo_diario FOR ALL
  USING (auth.uid() = user_id);

ALTER TABLE public.registro_agua ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuárias gerenciam seus registros de água"
  ON public.registro_agua FOR ALL
  USING (auth.uid() = user_id);

ALTER TABLE public.refeicoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuárias gerenciam suas refeições"
  ON public.refeicoes FOR ALL
  USING (auth.uid() = user_id);

ALTER TABLE public.ciclo_menstrual ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuárias gerenciam seu ciclo"
  ON public.ciclo_menstrual FOR ALL
  USING (auth.uid() = user_id);

-- Bem-estar
ALTER TABLE public.habitos_bem_estar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuárias gerenciam seus hábitos"
  ON public.habitos_bem_estar FOR ALL
  USING (auth.uid() = user_id);

ALTER TABLE public.habitos_bem_estar_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuárias gerenciam histórico de hábitos"
  ON public.habitos_bem_estar_historico FOR ALL
  USING (auth.uid() = user_id);

-- Finanças
ALTER TABLE public.contas_financeiras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuárias gerenciam suas contas"
  ON public.contas_financeiras FOR ALL
  USING (auth.uid() = user_id);

ALTER TABLE public.transacoes_financeiras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuárias gerenciam suas transações"
  ON public.transacoes_financeiras FOR ALL
  USING (auth.uid() = user_id);

ALTER TABLE public.metas_financeiras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuárias gerenciam suas metas"
  ON public.metas_financeiras FOR ALL
  USING (auth.uid() = user_id);

-- Notas
ALTER TABLE public.notas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuárias gerenciam suas notas"
  ON public.notas FOR ALL
  USING (auth.uid() = user_id);

-- Blog (público para leitura, admin para escrita)
ALTER TABLE public.categorias_blog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categorias de blog são públicas"
  ON public.categorias_blog FOR SELECT
  USING (true);

CREATE POLICY "Admins gerenciam categorias de blog"
  ON public.categorias_blog FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.posts_blog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts publicados são públicos"
  ON public.posts_blog FOR SELECT
  USING (status = 'publicado' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins gerenciam posts"
  ON public.posts_blog FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Recursos Digitais
ALTER TABLE public.recursos_digitais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recursos públicos são visíveis"
  ON public.recursos_digitais FOR SELECT
  USING (NOT exige_login OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins gerenciam recursos"
  ON public.recursos_digitais FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ===== DADOS INICIAIS =====

-- Categorias padrão de tarefas
INSERT INTO public.categorias_tarefa_casa (nome, descricao, icone) VALUES
  ('Limpeza Diária', 'Tarefas de limpeza que devem ser feitas todos os dias', '🧹'),
  ('Limpeza Semanal', 'Tarefas de limpeza feitas semanalmente', '🧼'),
  ('Cozinha', 'Tarefas relacionadas à cozinha', '🍳'),
  ('Quarto', 'Organização e limpeza do quarto', '🛏️'),
  ('Lavanderia', 'Lavar, secar e passar roupas', '👗'),
  ('Banheiro', 'Limpeza e organização do banheiro', '🚿');

-- Badges iniciais
INSERT INTO public.badges_casa (nome, descricao, criterio, icone) VALUES
  ('Primeira Conquista', 'Complete sua primeira tarefa!', 'Completar 1 tarefa', '⭐'),
  ('Rainha da Rotina', 'Complete 10 tarefas em uma semana', 'Completar 10 tarefas em 7 dias', '👑'),
  ('Casa em Dia', 'Complete todas as tarefas diárias por 7 dias seguidos', '7 dias de streak', '🏠'),
  ('Persistente', 'Complete 30 tarefas', 'Total de 30 tarefas', '💪'),
  ('Cozinheira Master', 'Complete 20 tarefas de cozinha', '20 tarefas de cozinha', '👩‍🍳');

-- Categorias de blog
INSERT INTO public.categorias_blog (nome, slug) VALUES
  ('Saúde', 'saude'),
  ('Finanças', 'financas'),
  ('Casa & Organização', 'casa-organizacao'),
  ('Autoconhecimento', 'autoconhecimento'),
  ('Direitos da Mulher', 'direitos-mulher'),
  ('Bem-estar', 'bem-estar');
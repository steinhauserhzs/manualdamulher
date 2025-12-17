import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const Termos = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto max-w-4xl px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-semibold">Termos de Serviço</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Calendar className="h-4 w-4" />
            <span>Última atualização: 17 de Dezembro de 2024</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-8">Termos de Serviço</h1>

          {/* Índice */}
          <div className="bg-muted/50 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Índice</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li><a href="#aceitacao" className="text-primary hover:underline">Aceitação dos Termos</a></li>
              <li><a href="#descricao" className="text-primary hover:underline">Descrição do Serviço</a></li>
              <li><a href="#cadastro" className="text-primary hover:underline">Cadastro e Conta</a></li>
              <li><a href="#obrigacoes" className="text-primary hover:underline">Obrigações do Usuário</a></li>
              <li><a href="#conteudo" className="text-primary hover:underline">Conteúdo do Usuário</a></li>
              <li><a href="#comunidade" className="text-primary hover:underline">Regras da Comunidade</a></li>
              <li><a href="#marketplace" className="text-primary hover:underline">Marketplace</a></li>
              <li><a href="#propriedade" className="text-primary hover:underline">Propriedade Intelectual</a></li>
              <li><a href="#limitacao" className="text-primary hover:underline">Limitação de Responsabilidade</a></li>
              <li><a href="#modificacoes" className="text-primary hover:underline">Modificações</a></li>
              <li><a href="#rescisao" className="text-primary hover:underline">Rescisão</a></li>
              <li><a href="#lei" className="text-primary hover:underline">Lei Aplicável</a></li>
              <li><a href="#contato" className="text-primary hover:underline">Contato</a></li>
            </ol>
          </div>

          {/* Seções */}
          <section id="aceitacao" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao acessar ou usar o aplicativo <strong>Manual da Mulher Independente</strong> ("Serviço"), 
              você concorda em ficar vinculada a estes Termos de Serviço. Se você não concordar com qualquer 
              parte dos termos, não poderá acessar o Serviço.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Estes termos se aplicam a todas as visitantes, usuárias e outras pessoas que acessam ou usam 
              o Serviço.
            </p>
          </section>

          <section id="descricao" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Descrição do Serviço</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              O Manual da Mulher Independente é uma plataforma web que oferece ferramentas para:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Gerenciamento de tarefas domésticas e rotinas</li>
              <li>Acompanhamento de saúde (ciclo menstrual, nutrição, medicamentos)</li>
              <li>Controle financeiro pessoal</li>
              <li>Rastreamento de hábitos e bem-estar</li>
              <li>Comunidade social entre usuárias</li>
              <li>Marketplace de produtos e serviços</li>
              <li>Horóscopo e conteúdo astrológico</li>
              <li>E-book interativo e recursos educacionais</li>
            </ul>
          </section>

          <section id="cadastro" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Cadastro e Conta</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Para usar certas funcionalidades do Serviço, você deve criar uma conta. Ao criar uma conta, 
              você declara que:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Tem pelo menos 18 anos de idade</li>
              <li>Fornecerá informações verdadeiras, precisas e completas</li>
              <li>Manterá suas credenciais de acesso em sigilo</li>
              <li>É responsável por todas as atividades em sua conta</li>
              <li>Notificará imediatamente sobre qualquer uso não autorizado</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Você pode criar uma conta usando e-mail/senha ou através do Google OAuth. Ao usar o Google OAuth, 
              você autoriza o acesso às informações básicas do seu perfil Google conforme nossa 
              <Link to="/privacidade" className="text-primary hover:underline ml-1">Política de Privacidade</Link>.
            </p>
          </section>

          <section id="obrigacoes" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Obrigações do Usuário</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Ao usar o Serviço, você concorda em:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Usar o Serviço apenas para fins legais e de acordo com estes Termos</li>
              <li>Não usar o Serviço para prejudicar, assediar ou discriminar outras usuárias</li>
              <li>Não tentar obter acesso não autorizado a sistemas ou dados</li>
              <li>Não transmitir vírus, malware ou código malicioso</li>
              <li>Não fazer engenharia reversa ou copiar o Serviço</li>
              <li>Não usar o Serviço para spam ou marketing não autorizado</li>
              <li>Respeitar os direitos de propriedade intelectual</li>
            </ul>
          </section>

          <section id="conteudo" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Conteúdo do Usuário</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Você mantém a propriedade de qualquer conteúdo que criar ou enviar através do Serviço. 
              Ao publicar conteúdo, você nos concede uma licença não exclusiva, mundial, isenta de royalties 
              para usar, modificar, exibir e distribuir esse conteúdo no contexto do Serviço.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Você é responsável pelo conteúdo que publica e garante que tem os direitos necessários para 
              compartilhá-lo. Não é permitido publicar conteúdo ilegal, ofensivo, difamatório, pornográfico, 
              que incite violência ou viole direitos de terceiros.
            </p>
          </section>

          <section id="comunidade" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Regras da Comunidade</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A comunidade do Manual da Mulher Independente é um espaço de apoio e respeito mútuo. 
              As seguintes condutas são proibidas:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Assédio, bullying ou intimidação de qualquer forma</li>
              <li>Discurso de ódio ou discriminação</li>
              <li>Compartilhamento de informações pessoais de terceiros sem consentimento</li>
              <li>Spam, propaganda ou promoção não autorizada</li>
              <li>Conteúdo explicitamente sexual ou violento</li>
              <li>Desinformação sobre saúde ou conselhos médicos não profissionais</li>
              <li>Criação de perfis falsos ou enganosos</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Reservamo-nos o direito de remover conteúdo e suspender contas que violem estas regras.
            </p>
          </section>

          <section id="marketplace" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Marketplace</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              O Marketplace permite que usuárias vendam, comprem e troquem produtos e serviços entre si. 
              Ao usar o Marketplace, você entende que:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Somos apenas uma plataforma de conexão entre usuárias</li>
              <li>Não somos parte das transações realizadas entre usuárias</li>
              <li>Não garantimos a qualidade, segurança ou legalidade dos itens anunciados</li>
              <li>Não garantimos a veracidade das informações dos anúncios</li>
              <li>Disputas entre compradores e vendedores devem ser resolvidas entre as partes</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              É proibido anunciar produtos ilegais, falsificados, roubados, perigosos ou que violem 
              direitos de propriedade intelectual.
            </p>
          </section>

          <section id="propriedade" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Propriedade Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed">
              O Serviço e seu conteúdo original (excluindo conteúdo fornecido por usuárias), recursos e 
              funcionalidades são e permanecerão propriedade exclusiva do Manual da Mulher Independente. 
              O Serviço é protegido por direitos autorais, marcas registradas e outras leis de propriedade 
              intelectual do Brasil e de outros países. Nossos logotipos e marcas não podem ser usados sem 
              autorização prévia por escrito.
            </p>
          </section>

          <section id="limitacao" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              O Serviço é fornecido "como está" e "conforme disponível", sem garantias de qualquer tipo. 
              Em nenhuma circunstância seremos responsáveis por:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Danos indiretos, incidentais, especiais ou consequenciais</li>
              <li>Perda de dados, lucros ou uso do Serviço</li>
              <li>Interrupções ou erros no Serviço</li>
              <li>Ações de terceiros, incluindo outras usuárias</li>
              <li>Transações realizadas no Marketplace</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>Aviso de Saúde:</strong> As informações fornecidas no Serviço não substituem 
              aconselhamento médico profissional. Sempre consulte um profissional de saúde qualificado 
              para questões médicas.
            </p>
          </section>

          <section id="modificacoes" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. Modificações</h2>
            <p className="text-muted-foreground leading-relaxed">
              Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento. 
              Notificaremos você sobre alterações significativas através do Serviço ou por e-mail. 
              O uso continuado do Serviço após a publicação de alterações constitui aceitação dos 
              novos termos.
            </p>
          </section>

          <section id="rescisao" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">11. Rescisão</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Podemos encerrar ou suspender sua conta imediatamente, sem aviso prévio, por qualquer 
              motivo, incluindo, sem limitação, violação destes Termos.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Você pode encerrar sua conta a qualquer momento através das configurações do aplicativo. 
              Após o encerramento, seu direito de usar o Serviço cessará imediatamente.
            </p>
          </section>

          <section id="lei" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">12. Lei Aplicável</h2>
            <p className="text-muted-foreground leading-relaxed">
              Estes Termos serão regidos e interpretados de acordo com as leis da República Federativa 
              do Brasil, incluindo o Código de Defesa do Consumidor (Lei nº 8.078/1990) e a Lei Geral 
              de Proteção de Dados (Lei nº 13.709/2018), sem considerar conflitos de disposições legais.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Qualquer disputa relacionada a estes Termos será submetida à jurisdição exclusiva dos 
              tribunais brasileiros.
            </p>
          </section>

          <section id="contato" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">13. Contato</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco:
            </p>
            <div className="bg-card border rounded-lg p-4 flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-muted-foreground">
                  <strong>E-mail:</strong> suporte@manualdamulher.com
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto max-w-4xl px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Manual da Mulher Independente. Todos os direitos reservados.</p>
          <div className="mt-2 flex justify-center gap-4">
            <Link to="/privacidade" className="hover:text-foreground transition-colors">Política de Privacidade</Link>
            <Link to="/" className="hover:text-foreground transition-colors">Página Inicial</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Termos;

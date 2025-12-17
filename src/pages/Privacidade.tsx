import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const Privacidade = () => {
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
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold">Política de Privacidade</span>
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

          <h1 className="text-3xl md:text-4xl font-bold mb-8">Política de Privacidade</h1>

          {/* Índice */}
          <div className="bg-muted/50 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Índice</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li><a href="#introducao" className="text-primary hover:underline">Introdução</a></li>
              <li><a href="#controlador" className="text-primary hover:underline">Identificação do Controlador</a></li>
              <li><a href="#dados-coletados" className="text-primary hover:underline">Dados Coletados</a></li>
              <li><a href="#finalidade" className="text-primary hover:underline">Finalidade do Tratamento</a></li>
              <li><a href="#base-legal" className="text-primary hover:underline">Base Legal (LGPD)</a></li>
              <li><a href="#compartilhamento" className="text-primary hover:underline">Compartilhamento de Dados</a></li>
              <li><a href="#direitos" className="text-primary hover:underline">Seus Direitos</a></li>
              <li><a href="#cookies" className="text-primary hover:underline">Cookies e Tecnologias</a></li>
              <li><a href="#seguranca" className="text-primary hover:underline">Segurança dos Dados</a></li>
              <li><a href="#retencao" className="text-primary hover:underline">Retenção de Dados</a></li>
              <li><a href="#alteracoes" className="text-primary hover:underline">Alterações nesta Política</a></li>
              <li><a href="#contato" className="text-primary hover:underline">Contato</a></li>
            </ol>
          </div>

          {/* Seções */}
          <section id="introducao" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Introdução</h2>
            <p className="text-muted-foreground leading-relaxed">
              O <strong>Manual da Mulher Independente</strong> ("nós", "nosso" ou "aplicativo") está comprometido 
              em proteger a privacidade de nossas usuárias. Esta Política de Privacidade descreve como coletamos, 
              usamos, armazenamos e protegemos suas informações pessoais quando você utiliza nosso aplicativo web 
              e serviços relacionados.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Ao utilizar nosso aplicativo, você concorda com as práticas descritas nesta política. Recomendamos 
              a leitura completa deste documento.
            </p>
          </section>

          <section id="controlador" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Identificação do Controlador</h2>
            <div className="bg-card border rounded-lg p-4">
              <p className="text-muted-foreground">
                <strong>Controlador:</strong> Manual da Mulher Independente<br />
                <strong>E-mail de contato:</strong> suporte@manualdamulher.com<br />
                <strong>Encarregado de Dados (DPO):</strong> privacidade@manualdamulher.com
              </p>
            </div>
          </section>

          <section id="dados-coletados" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Dados Coletados</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Coletamos os seguintes tipos de dados pessoais:
            </p>
            
            <h3 className="text-lg font-semibold mb-2">3.1 Dados fornecidos diretamente por você:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
              <li>Nome completo</li>
              <li>Endereço de e-mail</li>
              <li>Foto de perfil (opcional)</li>
              <li>Data de nascimento (opcional, para horóscopo)</li>
              <li>Localização (cidade/estado, opcional)</li>
              <li>Informações de saúde (ciclo menstrual, medicamentos, refeições - opcional)</li>
              <li>Informações financeiras (transações, metas - opcional)</li>
              <li>Conteúdo gerado (posts, comentários, notas)</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2">3.2 Dados coletados via Google OAuth:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
              <li>Nome do perfil Google</li>
              <li>Endereço de e-mail do Google</li>
              <li>Foto do perfil Google (se disponível)</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2">3.3 Dados coletados automaticamente:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Endereço IP</li>
              <li>Tipo de navegador e dispositivo</li>
              <li>Páginas visitadas e tempo de uso</li>
              <li>Data e hora de acesso</li>
            </ul>
          </section>

          <section id="finalidade" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Finalidade do Tratamento</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Utilizamos seus dados pessoais para as seguintes finalidades:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Criar e gerenciar sua conta de usuária</li>
              <li>Fornecer e personalizar os serviços do aplicativo</li>
              <li>Permitir funcionalidades como rastreamento de saúde, finanças e tarefas</li>
              <li>Gerar previsões de horóscopo personalizadas</li>
              <li>Facilitar a interação na comunidade</li>
              <li>Enviar comunicações importantes sobre o serviço</li>
              <li>Melhorar nossos serviços e experiência do usuário</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </section>

          <section id="base-legal" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Base Legal (LGPD)</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              O tratamento de dados pessoais é realizado com base nas seguintes hipóteses previstas na 
              Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018):
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Consentimento (Art. 7º, I):</strong> Para coleta de dados sensíveis de saúde</li>
              <li><strong>Execução de contrato (Art. 7º, V):</strong> Para fornecer os serviços contratados</li>
              <li><strong>Legítimo interesse (Art. 7º, IX):</strong> Para melhorias no serviço e comunicações</li>
              <li><strong>Cumprimento de obrigação legal (Art. 7º, II):</strong> Quando exigido por lei</li>
            </ul>
          </section>

          <section id="compartilhamento" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Compartilhamento de Dados</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Seus dados pessoais podem ser compartilhados com:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Provedores de serviço:</strong> Empresas que nos auxiliam na operação (hospedagem, banco de dados, autenticação)</li>
              <li><strong>Parceiros de autenticação:</strong> Google (para login via Google OAuth)</li>
              <li><strong>Autoridades legais:</strong> Quando exigido por lei ou ordem judicial</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>Não vendemos, alugamos ou comercializamos seus dados pessoais com terceiros para fins de marketing.</strong>
            </p>
          </section>

          <section id="direitos" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Seus Direitos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              De acordo com a LGPD, você tem os seguintes direitos:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Confirmar a existência de tratamento de dados</li>
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados</li>
              <li>Solicitar a portabilidade dos dados</li>
              <li>Revogar o consentimento a qualquer momento</li>
              <li>Solicitar a eliminação de dados tratados com base no consentimento</li>
              <li>Obter informações sobre compartilhamento de dados</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Para exercer seus direitos, entre em contato conosco através do e-mail: 
              <a href="mailto:privacidade@manualdamulher.com" className="text-primary hover:underline ml-1">
                privacidade@manualdamulher.com
              </a>
            </p>
          </section>

          <section id="cookies" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Cookies e Tecnologias</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Utilizamos cookies e tecnologias similares para:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li><strong>Cookies essenciais:</strong> Necessários para o funcionamento do aplicativo</li>
              <li><strong>Cookies de autenticação:</strong> Para manter sua sessão ativa</li>
              <li><strong>Cookies de preferências:</strong> Para lembrar suas configurações</li>
              <li><strong>Local Storage:</strong> Para armazenar dados offline e preferências</li>
            </ul>
          </section>

          <section id="seguranca" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Segurança dos Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Implementamos medidas técnicas e organizacionais apropriadas para proteger seus dados pessoais, 
              incluindo:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-4">
              <li>Criptografia de dados em trânsito (HTTPS/TLS)</li>
              <li>Criptografia de senhas (hash seguro)</li>
              <li>Controle de acesso baseado em funções (RLS)</li>
              <li>Monitoramento contínuo de segurança</li>
              <li>Backups regulares e seguros</li>
            </ul>
          </section>

          <section id="retencao" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. Retenção de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Seus dados pessoais são mantidos pelo tempo necessário para cumprir as finalidades descritas 
              nesta política, ou conforme exigido por lei. Ao encerrar sua conta, seus dados serão excluídos 
              ou anonimizados, exceto quando houver obrigação legal de retenção.
            </p>
          </section>

          <section id="alteracoes" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">11. Alterações nesta Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre 
              alterações significativas através do aplicativo ou por e-mail. A data da última atualização 
              estará sempre indicada no início deste documento.
            </p>
          </section>

          <section id="contato" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">12. Contato</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Se você tiver dúvidas sobre esta Política de Privacidade ou sobre o tratamento de seus dados, 
              entre em contato conosco:
            </p>
            <div className="bg-card border rounded-lg p-4 flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-muted-foreground">
                  <strong>E-mail geral:</strong> suporte@manualdamulher.com<br />
                  <strong>Privacidade e dados:</strong> privacidade@manualdamulher.com
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
            <Link to="/termos" className="hover:text-foreground transition-colors">Termos de Serviço</Link>
            <Link to="/" className="hover:text-foreground transition-colors">Página Inicial</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Privacidade;

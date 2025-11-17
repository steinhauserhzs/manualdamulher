import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Heart,
  Home,
  DollarSign,
  Activity,
  Sparkles,
  Book,
  Shield,
  TrendingUp,
  Target,
  Users,
  CheckCircle2,
  Star,
  BookOpen,
  ShoppingCart,
  UserPlus,
  Gift,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { StepCard } from "@/components/ui/StepCard";
import { StatDisplay } from "@/components/ui/StatDisplay";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import heroImage from "@/assets/hero-woman.jpg";
import casaIllustration from "@/assets/casa-illustration.jpg";
import saudeIllustration from "@/assets/saude-illustration.jpg";
import financasIllustration from "@/assets/financas-illustration.jpg";
import ebookMockup from "@/assets/ebook-mockup.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 md:py-32 pt-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        
        <div className="container relative mx-auto max-w-6xl">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-6 text-center md:text-left">
              <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Organize sua vida, conquiste sua{" "}
                <span className="text-gradient">independência</span>
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                O app completo para mulheres que querem ter controle total sobre casa,
                finanças, saúde e bem-estar. Tudo em um só lugar. 💜
              </p>
              <div className="flex flex-col gap-3 sm:flex-row justify-center md:justify-start">
                <Button asChild variant="hero" size="xl" className="hover-scale">
                  <a href="#ebook">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Adquirir E-book + App
                  </a>
                </Button>
                <Button asChild variant="outline" size="xl" className="hover-scale">
                  <Link to="/blog">
                    <Book className="mr-2 h-5 w-5" />
                    Ver Blog
                  </Link>
                </Button>
              </div>
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground md:justify-start">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Acesso liberado com o E-book
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Atualizações vitalícias incluídas
                </div>
              </div>
            </div>
            <div className="relative hidden md:block">
              <img 
                src={heroImage} 
                alt="Mulher confiante usando o app" 
                className="rounded-3xl shadow-card hover-scale"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary/5 px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4 text-center">
            <StatDisplay number="10.000+" label="Mulheres empoderadas" />
            <StatDisplay number="50.000+" label="Tarefas completadas" />
            <StatDisplay number="100+" label="Hábitos cultivados" />
            <StatDisplay number="4.9/5" label="Avaliação média" icon={<Star className="h-5 w-5" />} />
          </div>
        </div>
      </section>

      {/* Sobre Section */}
      <section id="sobre" className="px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Sobre o Manual da Mulher Independente
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            Criado especialmente para mulheres que buscam organizar suas vidas 
            de forma prática e eficiente. Nosso método combina um e-book completo 
            com um aplicativo exclusivo para transformar conhecimento em ação.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold mb-2 text-xl">Aprenda</h3>
              <p className="text-sm text-muted-foreground">
                Com nosso e-book completo e prático
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-bold mb-2 text-xl">Aplique</h3>
              <p className="text-sm text-muted-foreground">
                Use o app para colocar em prática
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-bold mb-2 text-xl">Evolua</h3>
              <p className="text-sm text-muted-foreground">
                Acompanhe seu progresso e conquistas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* E-book Section */}
      <section id="ebook" className="px-4 py-16 md:py-24 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Imagem do E-book */}
            <div className="relative">
              <img 
                src={ebookMockup} 
                alt="Manual da Mulher Independente - E-book"
                className="rounded-3xl shadow-card hover-scale"
              />
              <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded-full font-bold text-sm">
                🏆 Mais Vendido
              </div>
            </div>
            
            {/* Conteúdo */}
            <div>
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                E-book: Manual da Mulher Independente
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                Seu guia completo para organizar a vida, conquistar independência 
                e cuidar de você mesma. + Acesso VITALÍCIO ao nosso app exclusivo!
              </p>
              
              {/* O que está incluído */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold">E-book Completo (200+ páginas)</h4>
                    <p className="text-muted-foreground text-sm">Guia prático com passo a passo detalhado</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold">Acesso VITALÍCIO ao App</h4>
                    <p className="text-muted-foreground text-sm">Organize casa, finanças, saúde e bem-estar</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold">Planilhas e Checklists</h4>
                    <p className="text-muted-foreground text-sm">Materiais extras para download</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold">Atualizações Gratuitas</h4>
                    <p className="text-muted-foreground text-sm">Novos conteúdos e funcionalidades sempre</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold">Suporte via Comunidade</h4>
                    <p className="text-muted-foreground text-sm">Grupo exclusivo para tirar dúvidas</p>
                  </div>
                </div>
              </div>
              
              {/* Preço e CTA */}
              <div className="gradient-card rounded-2xl p-6 shadow-card">
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-4xl font-bold text-foreground">R$ 97,00</span>
                  <span className="text-xl line-through text-muted-foreground">R$ 197,00</span>
                  <span className="bg-success text-white px-3 py-1 rounded-full text-sm font-bold">
                    50% OFF
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Ou 12x de R$ 9,70 sem juros
                </p>
                <Button size="lg" variant="hero" className="w-full hover-scale">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Comprar E-book + Acesso ao App
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  🔒 Compra 100% segura • 7 dias de garantia
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
            Tudo que você precisa em um só lugar
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Home className="h-8 w-8 text-casa-primary" />}
              title="Casa Organizada"
              description="Gerencie tarefas domésticas, crie rotinas e mantenha sua casa sempre em ordem."
              gradient="gradient-casa"
              image={casaIllustration}
            />
            <FeatureCard
              icon={<Activity className="h-8 w-8 text-saude-primary" />}
              title="Saúde em Dia"
              description="Monitore sua saúde, ciclo menstrual, humor e mantenha hábitos saudáveis."
              gradient="gradient-saude"
              image={saudeIllustration}
            />
            <FeatureCard
              icon={<DollarSign className="h-8 w-8 text-financas-primary" />}
              title="Finanças Controladas"
              description="Controle gastos, defina metas financeiras e conquiste sua independência econômica."
              gradient="gradient-financas"
              image={financasIllustration}
            />
            <FeatureCard
              icon={<Sparkles className="h-8 w-8 text-primary" />}
              title="Bem-estar"
              description="Cultive hábitos positivos, pratique autocuidado e acompanhe sua evolução."
              gradient="gradient-hero"
            />
            <FeatureCard
              icon={<Book className="h-8 w-8 text-notas-primary" />}
              title="Biblioteca"
              description="Acesse dicas práticas e conteúdos exclusivos sobre organização e independência."
              gradient="gradient-subtle"
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-primary" />}
              title="Privacidade Total"
              description="Seus dados são 100% privados e seguros. Ninguém mais tem acesso."
              gradient="gradient-hero"
            />
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section className="bg-muted/30 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">Como funciona?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              icon={<ShoppingCart className="h-8 w-8" />}
              title="Compre o E-book"
              description="Adquira o Manual da Mulher Independente e ganhe acesso ao app"
            />
            <StepCard
              number="2"
              icon={<Target className="h-8 w-8" />}
              title="Defina Seus Objetivos"
              description="Configure suas áreas de foco e personalize sua experiência"
            />
            <StepCard
              number="3"
              icon={<Sparkles className="h-8 w-8" />}
              title="Evolua Todos os Dias"
              description="Complete tarefas, ganhe XP e conquiste suas metas"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="depoimentos" className="px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
            O que outras mulheres estão dizendo
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <TestimonialCard
              avatar="👩‍💼"
              name="Ana Silva"
              role="Mãe solo e empreendedora"
              quote="Esse app transformou minha rotina! Consigo organizar tudo e ainda ganho XP. É como um jogo, mas da vida real! 🌟"
            />
            <TestimonialCard
              avatar="👩‍🎓"
              name="Carla Santos"
              role="Estudante de medicina"
              quote="Finalmente consigo equilibrar estudos, casa e autocuidado. O app me ajuda a não esquecer nada importante! 💜"
            />
            <TestimonialCard
              avatar="👩‍💻"
              name="Juliana Costa"
              role="Designer freelancer"
              quote="Minha vida financeira mudou completamente. Agora eu sei exatamente para onde vai cada centavo e já economizei R$ 5.000! 💰"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">Perguntas Frequentes</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="q1">
              <AccordionTrigger>
                O que está incluído no E-book?
              </AccordionTrigger>
              <AccordionContent>
                O E-book contém mais de 200 páginas com guias práticos sobre organização 
                doméstica, finanças pessoais, saúde feminina e desenvolvimento pessoal. 
                Além disso, você ganha acesso vitalício ao nosso app exclusivo!
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="q2">
              <AccordionTrigger>
                Como funciona o acesso ao app?
              </AccordionTrigger>
              <AccordionContent>
                Após a compra, você receberá um código de acesso por email. Com esse código, 
                você pode criar sua conta no app e ter acesso vitalício a todas as funcionalidades.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="q3">
              <AccordionTrigger>
                Posso acessar o app sem comprar o E-book?
              </AccordionTrigger>
              <AccordionContent>
                Não. O app é um conteúdo exclusivo para quem adquire o E-book. 
                É assim que conseguimos manter a qualidade e oferecer suporte dedicado.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="q4">
              <AccordionTrigger>
                Tem garantia?
              </AccordionTrigger>
              <AccordionContent>
                Sim! Oferecemos 7 dias de garantia incondicional. Se não gostar, 
                devolvemos 100% do seu dinheiro, sem perguntas.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="q5">
              <AccordionTrigger>
                O app funciona em celular?
              </AccordionTrigger>
              <AccordionContent>
                Sim! O app é totalmente responsivo e funciona perfeitamente em celulares, 
                tablets e computadores. Você pode acessar de qualquer dispositivo com internet.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent px-4 py-20 md:py-32">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container relative mx-auto max-w-3xl text-center text-white">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Pronta para transformar sua vida?
          </h2>
          <p className="mb-8 text-lg opacity-90">
            Junte-se a milhares de mulheres que já estão organizando suas vidas e
            conquistando sua independência.
          </p>
          <Button asChild size="xl" className="bg-white text-primary hover:bg-white/90 hover-scale text-lg px-8 py-6 h-auto">
            <a href="#ebook">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Adquirir Agora por R$ 97
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 px-4 py-8">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 Manual da Mulher Independente. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient?: string;
  image?: string;
}

const FeatureCard = ({ icon, title, description, gradient, image }: FeatureCardProps) => (
  <div className={`group relative overflow-hidden rounded-2xl ${gradient || 'bg-card'} p-6 shadow-card hover-scale transition-all duration-300`}>
    {image && (
      <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
        <img src={image} alt={title} className="h-full w-full object-cover" />
      </div>
    )}
    <div className="relative">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default Landing;

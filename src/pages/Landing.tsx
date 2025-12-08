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
  
  ShoppingBag,
  Stars,
  Camera,
  CalendarHeart,
  Dumbbell,
  MessageCircle,
  Percent,
  Zap,
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

import bemEstarIllustration from "@/assets/bem-estar-illustration.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-landing-pattern">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 md:py-32 pt-24 w-full max-w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-secondary/8 to-accent/15" />
        <div className="absolute top-10 right-10 w-48 h-48 md:w-80 md:h-80 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 md:w-80 md:h-80 bg-secondary/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 bg-accent/5 rounded-full blur-3xl" />
        
        <div className="container relative mx-auto max-w-6xl w-full">
          <div className="grid items-center gap-8 md:grid-cols-2 w-full">
            <div className="flex flex-col items-center md:items-start space-y-6 text-center md:text-left w-full">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Zap className="h-4 w-4 flex-shrink-0" />
                <span>Novidade: IA para análise de refeições!</span>
              </div>
              <h1 className="text-3xl font-bold leading-tight md:text-5xl lg:text-6xl break-words">
                Organize sua vida, conquiste sua{" "}
                <span className="text-gradient">independência</span>
              </h1>
              <p className="text-base text-muted-foreground md:text-xl break-words max-w-lg">
                O app completo para mulheres que querem ter controle total sobre casa,
                finanças, saúde, bem-estar, comunidade e muito mais. Tudo em um só lugar. 💜
              </p>
              <div className="flex flex-col gap-3 w-full max-w-full sm:flex-row sm:w-auto">
                <Button asChild variant="hero" size="lg" className="hover-scale w-full sm:w-auto text-center">
                  <Link to="/auth">
                    <Sparkles className="mr-2 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">Começar Agora - 7 dias grátis</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="hover-scale w-full sm:w-auto">
                  <Link to="/blog">
                    <Book className="mr-2 h-5 w-5 flex-shrink-0" />
                    Ver Blog
                  </Link>
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 text-sm text-muted-foreground md:justify-start">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>7 dias grátis para testar</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Cancele quando quiser</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>9 módulos + IA</span>
                </div>
              </div>
            </div>
            <div className="relative hidden md:block">
              <img 
                src={heroImage} 
                alt="Mulher confiante usando o app" 
                className="rounded-3xl shadow-card hover-scale"
                width="1920"
                height="1080"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary/5 px-4 py-12 w-full max-w-full overflow-hidden">
        <div className="container mx-auto max-w-6xl w-full">
          <div className="grid gap-6 md:gap-8 grid-cols-2 md:grid-cols-4 text-center w-full">
            <StatDisplay number="15.000+" label="Mulheres empoderadas" />
            <StatDisplay number="100.000+" label="Tarefas completadas" />
            <StatDisplay number="5.000+" label="Posts na comunidade" />
            <StatDisplay number="4.9/5" label="Avaliação média" icon={<Star className="h-5 w-5" />} />
          </div>
        </div>
      </section>

      {/* Novidades Section - NEW */}
      <section id="novidades" className="relative px-4 py-16 md:py-24 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container relative mx-auto max-w-6xl w-full">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4 flex-shrink-0" />
              <span>Atualizações Recentes</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              Novidades do App ✨
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Estamos sempre evoluindo! Confira as funcionalidades que adicionamos recentemente para deixar sua experiência ainda mais completa.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Ciclo Menstrual */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 p-6 border border-pink-500/20 hover-scale flex flex-col items-center text-center">
              <div className="absolute top-3 right-3 bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                NOVO
              </div>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-pink-500/20">
                <CalendarHeart className="h-7 w-7 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Ciclo Menstrual</h3>
              <p className="text-muted-foreground text-sm">
                Calendário visual colorido, previsões de período fértil, registro de sintomas, humor e relações íntimas.
              </p>
            </div>

            {/* IA Calorias */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 p-6 border border-violet-500/20 hover-scale flex flex-col items-center text-center">
              <div className="absolute top-3 right-3 bg-violet-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                IA
              </div>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-violet-500/20">
                <Camera className="h-7 w-7 text-violet-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Calculadora de Calorias</h3>
              <p className="text-muted-foreground text-sm">
                Tire uma foto do seu prato e nossa IA analisa calorias, proteínas, carboidratos e gorduras automaticamente.
              </p>
            </div>

            {/* Suplementação */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 p-6 border border-emerald-500/20 hover-scale flex flex-col items-center text-center">
              <div className="absolute top-3 right-3 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                NOVO
              </div>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/20">
                <Dumbbell className="h-7 w-7 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Suplementação Fitness</h3>
              <p className="text-muted-foreground text-sm">
                Controle Whey, Creatina, BCAA e outros suplementos. Alertas de estoque e validade incluídos.
              </p>
            </div>

            {/* Horóscopo */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-6 border border-amber-500/20 hover-scale flex flex-col items-center text-center">
              <div className="absolute top-3 right-3 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                NOVO
              </div>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/20">
                <Stars className="h-7 w-7 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Horóscopo Diário</h3>
              <p className="text-muted-foreground text-sm">
                Previsões personalizadas geradas por IA, numerologia, compatibilidade e mapa astral simplificado.
              </p>
            </div>

            {/* Marketplace */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-6 border border-blue-500/20 hover-scale flex flex-col items-center text-center">
              <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                NOVO
              </div>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/20">
                <ShoppingBag className="h-7 w-7 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Marketplace</h3>
              <p className="text-muted-foreground text-sm">
                Brechó exclusivo, serviços de outras usuárias, parceiros verificados e cupons de desconto.
              </p>
            </div>

            {/* Comunidade */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 p-6 border border-indigo-500/20 hover-scale flex flex-col items-center text-center">
              <div className="absolute top-3 right-3 bg-indigo-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                NOVO
              </div>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-500/20">
                <MessageCircle className="h-7 w-7 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Comunidade</h3>
              <p className="text-muted-foreground text-sm">
                Rede social exclusiva para mulheres. Compartilhe experiências, faça perguntas e apoie outras mulheres.
              </p>
            </div>
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


      {/* Features */}
      <section id="funcionalidades" className="px-4 py-16 md:py-24 w-full max-w-full overflow-hidden">
        <div className="container mx-auto max-w-6xl w-full">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-2xl md:text-3xl lg:text-4xl break-words">
              9 Módulos Completos
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para organizar sua vida em um só lugar. Cada módulo foi pensado para atender às necessidades reais das mulheres.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
            <FeatureCard
              icon={<Home className="h-8 w-8 text-casa-primary" />}
              title="Casa Organizada"
              description="Gerencie tarefas domésticas, crie rotinas e ganhe XP. Gamificação completa com badges e níveis."
              gradient="gradient-casa"
              image={casaIllustration}
            />
            <FeatureCard
              icon={<Activity className="h-8 w-8 text-saude-primary" />}
              title="Saúde Completa"
              description="Ciclo menstrual, IA para calorias, suplementação fitness, humor e consumo de água."
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
              description="Cultive hábitos positivos, pratique autocuidado e acompanhe sua evolução diária."
              gradient="gradient-hero"
              image={bemEstarIllustration}
            />
            <FeatureCard
              icon={<Stars className="h-8 w-8 text-amber-500" />}
              title="Horóscopo"
              description="Previsões diárias por IA, numerologia pessoal, compatibilidade e mapa astral."
              gradient="bg-gradient-to-br from-amber-500/80 to-orange-500/80"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-indigo-500" />}
              title="Comunidade"
              description="Rede social exclusiva. Compartilhe, pergunte, crie enquetes e conecte-se."
              gradient="bg-gradient-to-br from-indigo-500/80 to-blue-500/80"
            />
            <FeatureCard
              icon={<ShoppingBag className="h-8 w-8 text-blue-500" />}
              title="Marketplace"
              description="Brechó, serviços, parceiros verificados e cupons de desconto exclusivos."
              gradient="bg-gradient-to-br from-blue-500/80 to-cyan-500/80"
            />
            <FeatureCard
              icon={<Book className="h-8 w-8 text-notas-primary" />}
              title="Biblioteca"
              description="E-book interativo, dicas práticas e recursos digitais para download."
              gradient="gradient-subtle"
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-primary" />}
              title="Segurança"
              description="Botão de emergência discreto, contatos de confiança e seus direitos legais."
              gradient="gradient-hero"
            />
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section className="bg-muted/30 px-4 py-16 md:py-24 w-full max-w-full overflow-hidden">
        <div className="container mx-auto max-w-6xl w-full">
          <h2 className="mb-12 text-center text-2xl md:text-3xl lg:text-4xl break-words">Como funciona?</h2>
          <div className="grid md:grid-cols-3 gap-8 w-full">
            <StepCard
              number="1"
              icon={<Sparkles className="h-8 w-8" />}
              title="Crie sua conta"
              description="Cadastre-se gratuitamente e aproveite 7 dias grátis para testar tudo"
            />
            <StepCard
              number="2"
              icon={<Target className="h-8 w-8" />}
              title="Personalize"
              description="Configure seus objetivos, adicione seus dados e personalize sua experiência"
            />
            <StepCard
              number="3"
              icon={<Sparkles className="h-8 w-8" />}
              title="Evolua"
              description="Complete tarefas, ganhe XP, conecte-se na comunidade e conquiste suas metas"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="depoimentos" className="px-4 py-16 md:py-24 w-full max-w-full overflow-hidden">
        <div className="container mx-auto max-w-6xl w-full">
          <h2 className="mb-12 text-center text-2xl md:text-3xl lg:text-4xl break-words">
            O que outras mulheres estão dizendo
          </h2>
          <div className="grid gap-8 md:grid-cols-3 w-full">
            <TestimonialCard
              avatar="👩‍💼"
              name="Ana Silva"
              role="Mãe solo e empreendedora"
              quote="Esse app transformou minha rotina! Consigo organizar tudo e ainda ganho XP. A comunidade é maravilhosa para trocar experiências! 🌟"
            />
            <TestimonialCard
              avatar="👩‍🎓"
              name="Carla Santos"
              role="Estudante de medicina"
              quote="A calculadora de calorias por IA é incrível! Tiro foto do prato e já sei tudo. O controle de suplementos me ajuda muito na academia! 💪"
            />
            <TestimonialCard
              avatar="👩‍💻"
              name="Juliana Costa"
              role="Designer freelancer"
              quote="Minha vida financeira mudou completamente. Adoro o marketplace e já encontrei várias peças incríveis no brechó! 💰"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-16 md:py-24 bg-muted/30 w-full max-w-full overflow-hidden">
        <div className="container mx-auto max-w-4xl w-full">
          <h2 className="mb-12 text-center text-2xl md:text-3xl lg:text-4xl break-words">Perguntas Frequentes</h2>
          <Accordion type="single" collapsible className="w-full max-w-full">
            <AccordionItem value="q1">
              <AccordionTrigger>
                O que está incluído no E-book?
              </AccordionTrigger>
              <AccordionContent>
                O E-book contém mais de 200 páginas com guias práticos sobre organização 
                doméstica, finanças pessoais, saúde feminina e desenvolvimento pessoal. 
                Além disso, você ganha acesso vitalício ao nosso app exclusivo com 9 módulos completos!
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="q2">
              <AccordionTrigger>
                Como funciona o acesso ao app?
              </AccordionTrigger>
              <AccordionContent>
                Após a compra, você receberá um código de acesso por email. Com esse código, 
                você pode criar sua conta no app e ter acesso vitalício a todas as funcionalidades, 
                incluindo a comunidade, marketplace, horóscopo e IA para análise de refeições.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="q3">
              <AccordionTrigger>
                O que é o Marketplace?
              </AccordionTrigger>
              <AccordionContent>
                O Marketplace é um espaço exclusivo dentro do app onde você pode: vender e comprar 
                itens usados no brechó, oferecer ou contratar serviços de outras usuárias, 
                encontrar parceiros verificados com descontos especiais, e acessar cupons exclusivos.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="q4">
              <AccordionTrigger>
                Como funciona o Horóscopo?
              </AccordionTrigger>
              <AccordionContent>
                O horóscopo é personalizado com base na sua data de nascimento. Nossa IA gera 
                previsões diárias exclusivas para seu signo, incluindo amor, trabalho e saúde. 
                Também oferecemos numerologia pessoal, compatibilidade entre signos e um mapa astral simplificado.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="q5">
              <AccordionTrigger>
                O que é a Comunidade?
              </AccordionTrigger>
              <AccordionContent>
                A Comunidade é uma rede social exclusiva para as usuárias do app. Você pode 
                compartilhar experiências, fazer perguntas, dar dicas, criar enquetes e 
                se conectar com outras mulheres que buscam organizar suas vidas. É um espaço 
                seguro e acolhedor para trocar ideias e apoio mútuo.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="q6">
              <AccordionTrigger>
                Como funciona a calculadora de calorias por IA?
              </AccordionTrigger>
              <AccordionContent>
                Basta tirar uma foto do seu prato ou descrever sua refeição. Nossa inteligência 
                artificial analisa os alimentos e estima automaticamente as calorias, proteínas, 
                carboidratos, gorduras e fibras. Você pode ajustar os valores antes de salvar 
                e acompanhar seu consumo diário.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="q7">
              <AccordionTrigger>
                Posso acessar o app sem comprar o E-book?
              </AccordionTrigger>
              <AccordionContent>
                Não. O app é um conteúdo exclusivo para quem adquire o E-book. 
                É assim que conseguimos manter a qualidade e oferecer suporte dedicado 
                para nossa comunidade de mulheres.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="q8">
              <AccordionTrigger>
                Tem garantia?
              </AccordionTrigger>
              <AccordionContent>
                Sim! Oferecemos 7 dias de garantia incondicional. Se não gostar, 
                devolvemos 100% do seu dinheiro, sem perguntas.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent px-4 py-20 md:py-32 w-full max-w-full">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container relative mx-auto max-w-3xl text-center text-white w-full">
          <h2 className="mb-4 text-2xl md:text-3xl lg:text-4xl break-words">
            Pronta para transformar sua vida?
          </h2>
          <p className="mb-8 text-base md:text-lg opacity-90 break-words">
            Junte-se a mais de 15.000 mulheres que já estão organizando suas vidas, 
            conectando-se na comunidade e conquistando sua independência.
          </p>
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 hover-scale text-sm md:text-lg px-6 md:px-8 py-4 md:py-6 h-auto w-full max-w-md mx-auto">
            <Link to="/auth" className="flex items-center justify-center">
              <Sparkles className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              <span className="break-words">Começar Agora - 7 dias grátis</span>
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 px-4 py-12 w-full max-w-full overflow-hidden">
        <div className="container mx-auto max-w-6xl w-full">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo e descrição */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 font-bold text-lg mb-4">
                <Heart className="h-6 w-6 text-primary" />
                Manual da Mulher Independente
              </div>
              <p className="text-sm text-muted-foreground">
                O app completo para mulheres que querem ter controle total sobre 
                casa, finanças, saúde e bem-estar. Transforme sua vida com organização e autonomia.
              </p>
            </div>
            
            {/* Links rápidos */}
            <div>
              <h4 className="font-bold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#sobre" className="hover:text-foreground transition-colors">Sobre</a></li>
                <li><a href="#novidades" className="hover:text-foreground transition-colors">Novidades</a></li>
                <li><a href="#funcionalidades" className="hover:text-foreground transition-colors">Funcionalidades</a></li>
                <li><a href="#ebook" className="hover:text-foreground transition-colors">E-book</a></li>
                <li><Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
              </ul>
            </div>
            
            {/* Contato */}
            <div>
              <h4 className="font-bold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="mailto:suporte@manualdamulher.com" className="hover:text-foreground transition-colors">suporte@manualdamulher.com</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Política de Privacidade</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 Manual da Mulher Independente. Todos os direitos reservados.</p>
          </div>
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

const FeatureCard = ({ icon, title, description, gradient, image }: FeatureCardProps) => {
  const hasGradient = gradient && (gradient.startsWith('gradient-') || gradient.startsWith('bg-gradient'));
  
  return (
    <div className={`group relative overflow-hidden rounded-2xl ${gradient || 'bg-card'} p-6 shadow-card hover-scale transition-all duration-300 flex flex-col`}>
      {/* Overlay para melhorar contraste em gradientes */}
      {hasGradient && (
        <div className="absolute inset-0 bg-black/20" />
      )}
      
      {image && (
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
          <img 
            src={image} 
            alt={title} 
            className="h-full w-full object-cover"
            width="800"
            height="515"
            loading="lazy"
          />
        </div>
      )}
      
      <div className="relative flex flex-col items-center text-center h-full">
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${hasGradient ? 'bg-white/90' : 'bg-background/80'} backdrop-blur-sm`}>
          {icon}
        </div>
        <h3 className={`mb-2 text-xl font-bold ${hasGradient ? 'text-white' : 'text-foreground'}`}>
          {title}
        </h3>
        <p className={`${hasGradient ? 'text-white/90' : 'text-muted-foreground'} text-sm`}>
          {description}
        </p>
      </div>
    </div>
  );
};

export default Landing;
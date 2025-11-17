import { Button } from "@/components/ui/button";
import { Heart, Home, Sparkles, TrendingUp, BookOpen, Shield, UserPlus, Target, Star, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { StepCard } from "@/components/ui/StepCard";
import { StatDisplay } from "@/components/ui/StatDisplay";
import heroImage from "@/assets/hero-woman.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 md:py-32">
        <div className="absolute inset-0 gradient-hero opacity-10"></div>
        <div className="absolute top-20 right-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute bottom-20 left-10 h-64 w-64 rounded-full bg-secondary/10 blur-3xl"></div>
        
        <div className="container relative mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="animate-fade-in text-center md:text-left">
              <h1 className="mb-6 text-foreground">
                Manual da Mulher Independente
              </h1>
              <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                Seu espaço seguro para organizar a vida, cuidar de você e conquistar sua independência.
                Apoio 360º para mulheres que não precisam dar conta de tudo sozinhas.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row md:justify-start justify-center">
                <Button asChild variant="hero" size="xl" className="hover-scale">
                  <Link to="/auth">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Começar Agora
                  </Link>
                </Button>
                <Button asChild variant="outline" size="xl" className="hover-scale">
                  <Link to="/blog">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Ver Blog
                  </Link>
                </Button>
              </div>
              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground md:justify-start">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Gratuito para sempre
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Sem cartão de crédito
                </div>
              </div>
            </div>
            <div className="relative animate-fade-in">
              <img 
                src={heroImage} 
                alt="Mulher confiante e organizada" 
                className="rounded-3xl shadow-card"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary/5 px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4">
            <StatDisplay number="10.000+" label="Mulheres empoderadas" />
            <StatDisplay number="50.000+" label="Tarefas completadas" />
            <StatDisplay number="100+" label="Hábitos cultivados" />
            <StatDisplay 
              number="4.9/5" 
              label="Avaliação média" 
              icon={<Star className="h-6 w-6 fill-primary" />} 
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-foreground">
            Tudo que você precisa em um só lugar
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Home className="h-8 w-8 text-primary" />}
              title="Casa Organizada"
              description="Transforme sua rotina com gamificação. Ganhe XP, conquiste badges e torne a organização divertida!"
            />
            <FeatureCard
              icon={<Heart className="h-8 w-8 text-secondary" />}
              title="Saúde & Bem-estar"
              description="Acompanhe seu ciclo, registre refeições, monitore água e cuide do seu corpo e mente."
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8 text-accent" />}
              title="Finanças Simples"
              description="Organize suas contas, acompanhe gastos e alcance suas metas financeiras com facilidade."
            />
            <FeatureCard
              icon={<Sparkles className="h-8 w-8 text-primary" />}
              title="Autocuidado"
              description="Crie hábitos de bem-estar e acompanhe seu progresso com streaks e lembretes carinhosos."
            />
            <FeatureCard
              icon={<BookOpen className="h-8 w-8 text-secondary" />}
              title="Conteúdo Rico"
              description="Acesse nosso blog com dicas práticas e materiais exclusivos para empoderar sua jornada."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-accent" />}
              title="Espaço Seguro"
              description="Seus dados são privados e protegidos. Aqui é seu espaço, sem julgamentos."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-foreground">Como funciona?</h2>
          <p className="mb-12 text-center text-muted-foreground">Em 3 passos simples você começa sua jornada</p>
          <div className="grid gap-12 md:grid-cols-3">
            <StepCard
              number="1"
              icon={<UserPlus className="h-12 w-12 text-primary" />}
              title="Cadastre-se Grátis"
              description="Crie sua conta em menos de 2 minutos, sem complicação"
            />
            <StepCard
              number="2"
              icon={<Target className="h-12 w-12 text-secondary" />}
              title="Defina Seus Objetivos"
              description="Escolha as áreas da vida que quer organizar e melhorar"
            />
            <StepCard
              number="3"
              icon={<Sparkles className="h-12 w-12 text-accent" />}
              title="Evolua Todos os Dias"
              description="Complete tarefas, ganhe XP e conquiste suas metas com gamificação"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-muted/30 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-foreground">O que outras mulheres estão dizendo</h2>
          <p className="mb-12 text-center text-muted-foreground">Histórias reais de transformação</p>
          <div className="grid gap-8 md:grid-cols-3">
            <TestimonialCard
              avatar="👩‍💼"
              name="Ana Silva"
              role="Mãe solo e empreendedora"
              quote="Esse app transformou minha rotina! Consigo organizar tudo e ainda ganho XP. Meus filhos adoram ver meu progresso!"
            />
            <TestimonialCard
              avatar="👩‍🎓"
              name="Beatriz Costa"
              role="Estudante universitária"
              quote="Finalmente consigo equilibrar estudos, saúde e vida pessoal. O sistema de hábitos me ajudou muito com autocuidado."
            />
            <TestimonialCard
              avatar="👩‍💻"
              name="Carla Mendes"
              role="Desenvolvedora freelancer"
              quote="Amei o controle financeiro! Já estou no caminho da minha primeira meta de economia. Super recomendo!"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-4xl">
          <div className="gradient-card rounded-3xl p-8 text-center shadow-card md:p-12">
            <h2 className="mb-4 text-foreground">Pronta para começar?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Junte-se a milhares de mulheres que já estão transformando suas vidas, um passo de cada vez.
            </p>
            <Button asChild variant="hero" size="xl" className="hover-scale">
              <Link to="/auth">
                <Sparkles className="mr-2 h-5 w-5" />
                Criar Minha Conta Grátis
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8">
        <div className="container mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          <p>© 2024 Manual da Mulher Independente. Feito com ❤️ para mulheres incríveis.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="gradient-card rounded-2xl p-6 shadow-card transition-transform hover:scale-105">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Landing;

import { Button } from "@/components/ui/button";
import { Heart, Home, Sparkles, TrendingUp, BookOpen, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 md:py-32">
        <div className="absolute inset-0 gradient-hero opacity-10"></div>
        <div className="container relative mx-auto max-w-6xl text-center">
          <h1 className="mb-6 text-foreground">
            Manual da Mulher Independente
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Seu espaço seguro para organizar a vida, cuidar de você e conquistar sua independência.
            Apoio 360º para mulheres que não precisam dar conta de tudo sozinhas.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild variant="hero" size="xl">
              <Link to="/auth">Começar Agora</Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link to="/blog">Ver Blog</Link>
            </Button>
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

      {/* CTA Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-4xl">
          <div className="gradient-card rounded-3xl p-8 text-center shadow-card md:p-12">
            <h2 className="mb-4 text-foreground">Pronta para começar?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Junte-se a milhares de mulheres que já estão transformando suas vidas, um passo de cada vez.
            </p>
            <Button asChild variant="hero" size="xl">
              <Link to="/auth">Criar Minha Conta Grátis</Link>
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

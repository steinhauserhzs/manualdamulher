import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Blog</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            Conteúdo para Inspirar sua Jornada
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Dicas práticas, reflexões e informações para apoiar você em todas as áreas da vida.
          </p>
        </div>

        <Card className="gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Posts em Breve
            </CardTitle>
            <CardDescription>
              Estamos preparando conteúdo incrível para você
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Em breve, você encontrará aqui artigos sobre:
              </p>
              <div className="mx-auto max-w-md space-y-2 text-left">
                <p className="text-sm">🏠 Organização e rotinas práticas para casa</p>
                <p className="text-sm">💪 Saúde física e mental</p>
                <p className="text-sm">💰 Educação financeira simplificada</p>
                <p className="text-sm">✨ Autocuidado e bem-estar</p>
                <p className="text-sm">⚖️ Direitos da mulher</p>
                <p className="text-sm">🌱 Crescimento pessoal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Blog;

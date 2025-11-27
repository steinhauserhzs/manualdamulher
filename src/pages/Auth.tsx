import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/Checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Lock, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email({ message: "E-mail inválido" }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
  nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }).optional(),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se já está logada
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === "SIGNED_IN") {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      toast.success("E-mail de recuperação enviado! Verifique sua caixa de entrada. 📧");
      setShowForgotPassword(false);
      setEmail("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar e-mail de recuperação");
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar dados
      if (isLogin) {
        authSchema.pick({ email: true, password: true }).parse({ email, password });
      } else {
        authSchema.parse({ email, password, nome });
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        toast.success("Bem-vinda de volta! 💜");
      } else {
        const redirectUrl = `${window.location.origin}/dashboard`;
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              nome,
            },
          },
        });

        if (error) throw error;
        toast.success("Conta criada! Bem-vinda ao Manual! 🎉");
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error.message?.includes("already registered")) {
        toast.error("Este e-mail já está cadastrado. Tente fazer login.");
      } else if (error.message?.includes("Invalid login credentials")) {
        toast.error("E-mail ou senha incorretos.");
      } else {
        toast.error(error.message || "Erro ao processar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        
        <div className="mb-6 bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-center mb-2">
            <Lock className="inline h-4 w-4 mr-1" />
            <strong>Acesso Exclusivo:</strong> Disponível apenas para quem adquiriu o E-book.
          </p>
          <Button variant="link" asChild className="text-sm w-full p-0 h-auto">
            <a href="/#ebook" className="flex items-center justify-center gap-1">
              <BookOpen className="h-3 w-3" />
              Ainda não tem? Clique aqui para adquirir
            </a>
          </Button>
        </div>
        
        <Card className="gradient-card shadow-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {isLogin ? "Bem-vinda de volta!" : "Crie sua conta"}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin
                ? "Entre para continuar organizando sua vida"
                : "Comece sua jornada de independência"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enviaremos um link para redefinir sua senha
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  variant="hero"
                  size="lg"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar Link de Recuperação
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setEmail("");
                  }}
                  disabled={loading}
                >
                  Voltar para login
                </Button>
              </form>
            ) : (
              <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Como você gostaria de ser chamada?"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                {!isLogin && (
                  <p className="text-xs text-muted-foreground">
                    Mínimo de 6 caracteres
                  </p>
                )}
              </div>
              
              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
                      Lembrar-me
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm p-0 h-auto"
                    onClick={() => setShowForgotPassword(true)}
                    disabled={loading}
                  >
                    Esqueceu a senha?
                  </Button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                variant="hero"
                size="lg"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLogin ? "Entrar" : "Criar Conta"}
              </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            {!showForgotPassword && (
              <Button
              variant="link"
              className="text-sm"
              onClick={() => {
                setIsLogin(!isLogin);
                setNome("");
                setEmail("");
                setPassword("");
              }}
              disabled={loading}
            >
                {isLogin
                  ? "Não tem conta? Cadastre-se aqui"
                  : "Já tem conta? Entre aqui"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;

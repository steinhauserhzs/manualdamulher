import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle2, Mail, Phone, FileText, Star, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Verificacao {
  id: string;
  email_verificado: boolean;
  telefone_verificado: boolean;
  documento_verificado: boolean;
  documento_tipo: string | null;
  nivel_verificacao: number;
  selo_vendedora_confiavel: boolean;
  total_vendas: number;
  avaliacao_media: number;
}

export const VerificacaoVendedora = () => {
  const [verificacao, setVerificacao] = useState<Verificacao | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarVerificacao();
  }, []);

  const carregarVerificacao = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("marketplace_verificacoes")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Erro ao carregar verificação:", error);
    }

    if (data) {
      setVerificacao(data);
    }
    setLoading(false);
  };

  const iniciarVerificacao = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("marketplace_verificacoes")
      .insert({
        user_id: user.id,
        email_verificado: true, // Já tem email verificado pelo cadastro
        nivel_verificacao: 1
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Erro ao iniciar verificação", variant: "destructive" });
      return;
    }

    setVerificacao(data);
    toast({ title: "Verificação iniciada!", description: "Email verificado automaticamente" });
  };

  const verificarTelefone = async () => {
    if (!verificacao) return;

    // Simulação de verificação de telefone
    const { error } = await supabase
      .from("marketplace_verificacoes")
      .update({ 
        telefone_verificado: true,
        nivel_verificacao: Math.max(verificacao.nivel_verificacao, 2)
      })
      .eq("id", verificacao.id);

    if (error) {
      toast({ title: "Erro ao verificar telefone", variant: "destructive" });
      return;
    }

    toast({ title: "Telefone verificado!" });
    carregarVerificacao();
  };

  if (loading) {
    return (
      <Card className="gradient-card shadow-card">
        <CardContent className="p-6">
          <div className="h-32 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const nivelProgresso = verificacao ? (verificacao.nivel_verificacao / 5) * 100 : 0;

  return (
    <Card className="gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Shield className="h-5 w-5 text-blue-500" />
          Verificação de Vendedora
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!verificacao ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Verifique sua conta para ganhar mais confiança das compradoras!
            </p>
            <Button onClick={iniciarVerificacao}>
              <Shield className="h-4 w-4 mr-2" />
              Iniciar Verificação
            </Button>
          </div>
        ) : (
          <>
            {/* Nível de verificação */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Nível de Verificação</span>
                <span className="font-medium">{verificacao.nivel_verificacao}/5</span>
              </div>
              <Progress value={nivelProgresso} className="h-2" />
            </div>

            {/* Selo de vendedora confiável */}
            {verificacao.selo_vendedora_confiavel && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-medium text-green-700 dark:text-green-400">
                  Vendedora Confiável
                </span>
              </div>
            )}

            {/* Itens de verificação */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Email</span>
                </div>
                {verificacao.email_verificado ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verificado
                  </Badge>
                ) : (
                  <Button size="sm" variant="outline">Verificar</Button>
                )}
              </div>

              <div className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Telefone</span>
                </div>
                {verificacao.telefone_verificado ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verificado
                  </Badge>
                ) : (
                  <Button size="sm" variant="outline" onClick={verificarTelefone}>
                    Verificar
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Documento</span>
                </div>
                {verificacao.documento_verificado ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {verificacao.documento_tipo}
                  </Badge>
                ) : (
                  <Badge variant="secondary">Em breve</Badge>
                )}
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <ShoppingBag className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-lg font-bold">{verificacao.total_vendas || 0}</p>
                <p className="text-xs text-muted-foreground">Vendas</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Star className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                <p className="text-lg font-bold">
                  {verificacao.avaliacao_media ? verificacao.avaliacao_media.toFixed(1) : "-"}
                </p>
                <p className="text-xs text-muted-foreground">Avaliação</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const Configuracoes = () => {
  const [user, setUser] = useState<any>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [nome, setNome] = useState("");
  const [pronome, setPronome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [objetivos, setObjetivos] = useState("");
  
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [alterandoSenha, setAlterandoSenha] = useState(false);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      carregarPerfil(session.user.id);
    };
    checkAuth();
  }, [navigate]);

  const carregarPerfil = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      toast({
        title: "Erro ao carregar perfil",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setPerfil(data);
      setNome(data.nome || "");
      setPronome(data.pronome || "");
      setDataNascimento(data.data_nascimento || "");
      setObjetivos(data.objetivos || "");
    }
    setLoading(false);
  };

  const handleSalvarPerfil = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from('perfis')
      .update({
        nome,
        pronome,
        data_nascimento: dataNascimento || null,
        objetivos,
      })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Perfil atualizado! ✅",
        description: "Suas informações foram salvas com sucesso.",
      });
    }
    setSaving(false);
  };

  const handleAlterarSenha = async () => {
    if (novaSenha !== confirmarSenha) {
      toast({
        title: "Senhas não coincidem",
        description: "Por favor, verifique as senhas digitadas.",
        variant: "destructive",
      });
      return;
    }

    if (novaSenha.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setAlterandoSenha(true);
    const { error } = await supabase.auth.updateUser({
      password: novaSenha,
    });

    if (error) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Senha alterada! 🔒",
        description: "Sua nova senha foi salva com sucesso.",
      });
      setNovaSenha("");
      setConfirmarSenha("");
    }
    setAlterandoSenha(false);
  };

  const handleExcluirConta = async () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A exclusão de conta estará disponível em breve. Por favor, entre em contato com o suporte.",
    });
    setDeleteDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 md:ml-64 mb-16 md:mb-0">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:ml-64 mb-16 md:mb-0">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: "Configurações" }]} />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Configurações ⚙️</h1>
          <p className="text-muted-foreground">Gerencie sua conta e preferências</p>
        </div>

        <Tabs defaultValue="perfil" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
            <TabsTrigger value="seguranca">Segurança</TabsTrigger>
            <TabsTrigger value="dados">Dados</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Atualize seus dados pessoais aqui</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <Label htmlFor="pronome">Pronome</Label>
                  <Input
                    id="pronome"
                    value={pronome}
                    onChange={(e) => setPronome(e.target.value)}
                    placeholder="Ex: ela/dela"
                  />
                </div>
                <div>
                  <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="objetivos">Objetivos</Label>
                  <Textarea
                    id="objetivos"
                    value={objetivos}
                    onChange={(e) => setObjetivos(e.target.value)}
                    placeholder="O que você deseja alcançar?"
                    rows={4}
                  />
                </div>
                <Button onClick={handleSalvarPerfil} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seguranca">
            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>Mantenha sua conta segura com uma senha forte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="novaSenha">Nova Senha</Label>
                  <Input
                    id="novaSenha"
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmarSenha"
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Digite a senha novamente"
                  />
                </div>
                <Button onClick={handleAlterarSenha} disabled={alterandoSenha}>
                  {alterandoSenha ? "Alterando..." : "Alterar Senha"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dados">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Dados</CardTitle>
                <CardDescription>Exporte ou exclua seus dados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Exportar Dados</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Em breve você poderá exportar todos os seus dados em formato JSON.
                  </p>
                  <Button variant="outline" disabled>
                    Exportar (em breve)
                  </Button>
                </div>
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-2 text-destructive">Excluir Conta</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
                  </p>
                  <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                    Excluir Minha Conta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Excluir conta permanentemente?"
          description="Esta ação não pode ser desfeita. Todos os seus dados, tarefas, notas e progresso serão permanentemente removidos. Tem certeza absoluta?"
          onConfirm={handleExcluirConta}
          confirmText="Sim, excluir minha conta"
          variant="destructive"
        />
      </div>
    </div>
  );
};

export default Configuracoes;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Users2, Lock, Globe, UserPlus, LogOut, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Grupo {
  id: string;
  nome: string;
  descricao: string | null;
  icone: string | null;
  cor: string;
  privado: boolean;
  membros_count: number;
  criadora_id: string;
  is_membro?: boolean;
}

const cores = [
  "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444"
];

export const GruposCard = () => {
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [meusGrupos, setMeusGrupos] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [novoGrupo, setNovoGrupo] = useState({
    nome: "",
    descricao: "",
    privado: false,
    cor: "#8B5CF6"
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Buscar grupos onde sou membro
      const { data: membrosData } = await supabase
        .from("comunidade_grupos_membros")
        .select("grupo_id")
        .eq("user_id", user.id);

      const gruposIds = membrosData?.map(m => m.grupo_id) || [];
      setMeusGrupos(gruposIds);

      // Buscar todos os grupos públicos + meus privados
      const { data: gruposData, error } = await supabase
        .from("comunidade_grupos")
        .select("*")
        .order("membros_count", { ascending: false });

      if (error) throw error;

      const gruposComStatus = gruposData?.map(g => ({
        ...g,
        is_membro: gruposIds.includes(g.id)
      })) || [];

      setGrupos(gruposComStatus);
    } catch (error) {
      console.error("Erro ao carregar grupos:", error);
    } finally {
      setLoading(false);
    }
  };

  const criarGrupo = async () => {
    if (!novoGrupo.nome.trim()) {
      toast({ title: "Digite um nome para o grupo", variant: "destructive" });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: grupo, error } = await supabase
        .from("comunidade_grupos")
        .insert({
          nome: novoGrupo.nome,
          descricao: novoGrupo.descricao || null,
          privado: novoGrupo.privado,
          cor: novoGrupo.cor,
          criadora_id: user.id,
          membros_count: 1
        })
        .select()
        .single();

      if (error) throw error;

      // Adicionar criadora como admin
      await supabase.from("comunidade_grupos_membros").insert({
        grupo_id: grupo.id,
        user_id: user.id,
        papel: "admin"
      });

      toast({ title: "Grupo criado com sucesso!" });
      setDialogOpen(false);
      setNovoGrupo({ nome: "", descricao: "", privado: false, cor: "#8B5CF6" });
      carregarDados();
    } catch (error: any) {
      toast({ title: "Erro ao criar grupo", description: error.message, variant: "destructive" });
    }
  };

  const entrarGrupo = async (grupoId: string) => {
    if (!userId) return;

    try {
      await supabase.from("comunidade_grupos_membros").insert({
        grupo_id: grupoId,
        user_id: userId
      });

      // Incrementar contador manualmente
      const grupo = grupos.find(g => g.id === grupoId);
      if (grupo) {
        await supabase
          .from("comunidade_grupos")
          .update({ membros_count: grupo.membros_count + 1 })
          .eq("id", grupoId);
      }

      toast({ title: "Você entrou no grupo!" });
      carregarDados();
    } catch (error: any) {
      toast({ title: "Erro ao entrar no grupo", description: error.message, variant: "destructive" });
    }
  };

  const sairGrupo = async (grupoId: string) => {
    if (!userId) return;

    try {
      await supabase
        .from("comunidade_grupos_membros")
        .delete()
        .eq("grupo_id", grupoId)
        .eq("user_id", userId);

      toast({ title: "Você saiu do grupo" });
      carregarDados();
    } catch (error: any) {
      toast({ title: "Erro ao sair do grupo", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users2 className="h-5 w-5 text-primary" />
          Grupos
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" /> Criar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Grupo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome do Grupo *</Label>
                <Input
                  value={novoGrupo.nome}
                  onChange={(e) => setNovoGrupo(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Mães Solo, Finanças Pessoais..."
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={novoGrupo.descricao}
                  onChange={(e) => setNovoGrupo(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Sobre o que é esse grupo?"
                />
              </div>
              <div>
                <Label>Cor do Grupo</Label>
                <div className="flex gap-2 mt-2">
                  {cores.map(cor => (
                    <button
                      key={cor}
                      type="button"
                      onClick={() => setNovoGrupo(prev => ({ ...prev, cor }))}
                      className={`w-8 h-8 rounded-full ${novoGrupo.cor === cor ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                      style={{ backgroundColor: cor }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Grupo Privado</Label>
                  <p className="text-xs text-muted-foreground">Apenas membros convidados podem ver</p>
                </div>
                <Switch
                  checked={novoGrupo.privado}
                  onCheckedChange={(v) => setNovoGrupo(prev => ({ ...prev, privado: v }))}
                />
              </div>
              <Button onClick={criarGrupo} className="w-full">Criar Grupo</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-center text-muted-foreground py-4">Carregando...</div>
        ) : grupos.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            <Users2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum grupo ainda</p>
            <p className="text-sm">Seja a primeira a criar um!</p>
          </div>
        ) : (
          grupos.map((grupo) => (
            <div 
              key={grupo.id} 
              className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
              style={{ borderLeftColor: grupo.cor, borderLeftWidth: "4px" }}
              onClick={() => navigate(`/comunidade/grupo/${grupo.id}`)}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: grupo.cor }}
                >
                  {grupo.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{grupo.nome}</span>
                    {grupo.privado ? (
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <Globe className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {grupo.membros_count} {grupo.membros_count === 1 ? "membro" : "membros"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {grupo.is_membro ? (
                  grupo.criadora_id === userId ? (
                    <Badge variant="secondary">Admin</Badge>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => sairGrupo(grupo.id)}
                    >
                      <LogOut className="h-4 w-4 mr-1" /> Sair
                    </Button>
                  )
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => entrarGrupo(grupo.id)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" /> Entrar
                  </Button>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

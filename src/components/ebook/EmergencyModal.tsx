import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Phone, Plus, Shield, Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddContatoEmergenciaDialog } from "./AddContatoEmergenciaDialog";

interface ContatoEmergencia {
  id: string;
  nome: string;
  telefone: string;
  relacao: string | null;
}

interface EmergencyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CONTATOS_PUBLICOS = [
  {
    nome: "Central de Atendimento à Mulher",
    numero: "180",
    descricao: "Denúncias de violência contra mulher (24h, gratuito)",
    cor: "rose",
  },
  {
    nome: "Polícia Militar",
    numero: "190",
    descricao: "Emergência policial",
    cor: "blue",
  },
  {
    nome: "SAMU - Emergência Médica",
    numero: "192",
    descricao: "Atendimento médico de urgência",
    cor: "red",
  },
  {
    nome: "Centro de Valorização da Vida",
    numero: "188",
    descricao: "Apoio emocional e prevenção ao suicídio (24h)",
    cor: "purple",
  },
  {
    nome: "Disque Direitos Humanos",
    numero: "100",
    descricao: "Denúncias de violação de direitos humanos",
    cor: "amber",
  },
];

export const EmergencyModal = ({ open, onOpenChange }: EmergencyModalProps) => {
  const [contatosPessoais, setContatosPessoais] = useState<ContatoEmergencia[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      carregarContatosPessoais();
    }
  }, [open]);

  const carregarContatosPessoais = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("contatos_emergencia")
        .select("*")
        .eq("user_id", user.id)
        .order("ordem", { ascending: true });

      if (error) throw error;
      setContatosPessoais(data || []);
    } catch (error) {
      console.error("Erro ao carregar contatos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deletarContato = async (id: string) => {
    try {
      const { error } = await supabase
        .from("contatos_emergencia")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Contato removido");
      carregarContatosPessoais();
    } catch (error) {
      console.error("Erro ao deletar contato:", error);
      toast.error("Erro ao remover contato");
    }
  };

  const ligar = (numero: string) => {
    window.location.href = `tel:${numero}`;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-rose-600" />
              <DialogTitle className="text-2xl">Contatos de Emergência</DialogTitle>
            </div>
            <DialogDescription>
              Você não está sozinha. Use esses contatos sempre que precisar de ajuda.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Contatos Públicos */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Serviços Públicos
                </h3>
                <div className="space-y-2">
                  {CONTATOS_PUBLICOS.map((contato) => (
                    <div
                      key={contato.numero}
                      className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">
                            {contato.nome}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {contato.descricao}
                          </p>
                          <p className="text-2xl font-bold text-primary mt-2">
                            {contato.numero}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => ligar(contato.numero)}
                          className="shrink-0"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Ligar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recursos Online */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-primary" />
                  Recursos Online
                </h3>
                <div className="space-y-2">
                  <div className="p-4 rounded-lg border bg-card">
                    <h4 className="font-semibold">Delegacia Virtual</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Registre boletim de ocorrência online (disponível em alguns estados)
                    </p>
                    <Button
                      variant="link"
                      className="px-0 mt-2"
                      onClick={() => window.open("https://www.google.com/search?q=delegacia+virtual+online", "_blank")}
                    >
                      Buscar delegacia do seu estado
                    </Button>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <h4 className="font-semibold">Mapa de Acolhimento</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Rede de psicólogas voluntárias para mulheres vítimas de violência
                    </p>
                    <Button
                      variant="link"
                      className="px-0 mt-2"
                      onClick={() => window.open("https://www.mapadoacolhimento.org/", "_blank")}
                    >
                      Acessar site
                    </Button>
                  </div>
                </div>
              </div>

              {/* Contatos Pessoais */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    Meus Contatos de Confiança
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>

                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </div>
                ) : contatosPessoais.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                    <p>Nenhum contato cadastrado ainda.</p>
                    <p className="text-sm mt-1">
                      Adicione pessoas de confiança que podem te ajudar em emergências.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contatosPessoais.map((contato) => (
                      <div
                        key={contato.id}
                        className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold">{contato.nome}</h4>
                            {contato.relacao && (
                              <p className="text-sm text-muted-foreground capitalize">
                                {contato.relacao}
                              </p>
                            )}
                            <p className="text-lg font-semibold text-primary mt-1">
                              {contato.telefone}
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="sm"
                              onClick={() => ligar(contato.telefone)}
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              Ligar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deletarContato(contato.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mensagem de Segurança */}
              <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800">
                <h4 className="font-semibold text-rose-900 dark:text-rose-100 mb-2">
                  💗 Lembre-se
                </h4>
                <ul className="text-sm text-rose-800 dark:text-rose-200 space-y-1">
                  <li>• Se você está em perigo imediato, ligue 190</li>
                  <li>• Suas informações estão seguras e privadas</li>
                  <li>• Você não está sozinha</li>
                  <li>• Pedir ajuda é um ato de coragem</li>
                </ul>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AddContatoEmergenciaDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={carregarContatosPessoais}
      />
    </>
  );
};

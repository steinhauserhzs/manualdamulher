import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Stethoscope, Brain, Calendar, Clock, ChevronRight, Shield } from "lucide-react";
import { format, formatDistanceToNow, isBefore, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TelemedicinaCuidadosCardProps {
  userId: string;
}

interface ProximaConsulta {
  id: string;
  data_hora: string;
  tipo: string;
  status: string;
  profissional: {
    nome: string;
    registro_profissional: string;
  } | null;
}

export const TelemedicinaCuidadosCard = ({ userId }: TelemedicinaCuidadosCardProps) => {
  const [proximaConsulta, setProximaConsulta] = useState<ProximaConsulta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarProximaConsulta();
  }, [userId]);

  const carregarProximaConsulta = async () => {
    const agora = new Date().toISOString();
    
    const { data, error } = await supabase
      .from("telemedicina_agendamentos")
      .select(`
        id,
        data_hora,
        tipo,
        status,
        profissional:telemedicina_profissionais(nome, registro_profissional)
      `)
      .eq("user_id", userId)
      .in("status", ["agendado", "confirmado"])
      .gte("data_hora", agora)
      .order("data_hora", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setProximaConsulta(data as unknown as ProximaConsulta);
    }
    setLoading(false);
  };

  // Verificar se pode entrar na consulta (5 min antes)
  const podeEntrar = proximaConsulta 
    ? isBefore(new Date(), addMinutes(new Date(proximaConsulta.data_hora), 5)) &&
      isBefore(addMinutes(new Date(proximaConsulta.data_hora), -5), new Date())
    : false;

  return (
    <Card className="gradient-card shadow-card hover-lift overflow-hidden">
      {/* Banner decorativo */}
      <div className="h-2 bg-gradient-to-r from-primary via-secondary to-accent" />
      
      <CardHeader className="px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Video className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Telemedicina & Telepsicologia
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Consulte profissionais de saúde por videochamada
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit flex items-center gap-1 text-xs">
            <Shield className="h-3 w-3" />
            Parceiro certificado
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-4 sm:px-6">
        {/* Próxima consulta agendada */}
        {proximaConsulta && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-primary">Próxima consulta</span>
              <Badge variant="secondary" className="text-xs">
                {proximaConsulta.tipo === "telepsicologia" ? "🧠 Psicologia" : "🩺 Medicina"}
              </Badge>
            </div>
            <p className="font-medium text-sm">
              {proximaConsulta.profissional?.nome}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(proximaConsulta.data_hora), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(proximaConsulta.data_hora), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </p>
            
            {podeEntrar ? (
              <Button asChild size="sm" className="w-full mt-3">
                <Link to={`/telemedicina/consulta/${proximaConsulta.id}`}>
                  <Video className="h-4 w-4 mr-2" />
                  Entrar na Consulta
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm" className="w-full mt-3">
                <Link to="/telemedicina">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver detalhes
                </Link>
              </Button>
            )}
          </div>
        )}

        {/* Botões de acesso rápido */}
        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="outline" className="flex flex-col h-auto py-4 gap-2">
            <Link to="/telemedicina?tipo=medicina">
              <Stethoscope className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium">Médico</span>
              <span className="text-[10px] text-muted-foreground">Consultas gerais</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="flex flex-col h-auto py-4 gap-2">
            <Link to="/telemedicina?tipo=psicologia">
              <Brain className="h-6 w-6 text-secondary" />
              <span className="text-xs font-medium">Psicólogo</span>
              <span className="text-[10px] text-muted-foreground">Saúde mental</span>
            </Link>
          </Button>
        </div>

        {/* Benefícios */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="py-2">
            <Clock className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <span className="text-[10px] text-muted-foreground">Atendimento rápido</span>
          </div>
          <div className="py-2">
            <Shield className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <span className="text-[10px] text-muted-foreground">Sigilo garantido</span>
          </div>
          <div className="py-2">
            <Video className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <span className="text-[10px] text-muted-foreground">100% online</span>
          </div>
        </div>

        {/* CTA principal */}
        <Button asChild className="w-full">
          <Link to="/telemedicina">
            Agendar Consulta
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

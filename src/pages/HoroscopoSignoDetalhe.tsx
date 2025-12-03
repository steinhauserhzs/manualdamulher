import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrevisaoDiaria } from "@/components/horoscopo/PrevisaoDiaria";
import { getSignoByNome, ELEMENTOS, MODALIDADES } from "@/lib/astrologia";

const HoroscopoSignoDetalhe = () => {
  const { signo } = useParams<{ signo: string }>();
  const [previsao, setPrevisao] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signoInfo = signo ? getSignoByNome(signo) : null;
  const elementoInfo = signoInfo ? ELEMENTOS[signoInfo.elemento as keyof typeof ELEMENTOS] : null;
  const modalidadeInfo = signoInfo ? MODALIDADES[signoInfo.modalidade as keyof typeof MODALIDADES] : null;

  useEffect(() => {
    const fetchPrevisao = async () => {
      if (!signoInfo) return;
      
      const hoje = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('horoscopo_diario')
        .select('*')
        .eq('signo', signoInfo.nome)
        .eq('data', hoje)
        .single();
      
      setPrevisao(data);
      setIsLoading(false);
    };

    fetchPrevisao();
  }, [signoInfo]);

  if (!signoInfo) {
    return (
      <div className="p-6 text-center">
        <p>Signo não encontrado</p>
        <Link to="/horoscopo/signos">
          <Button className="mt-4">Voltar</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className={`${elementoInfo?.bg} p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <Link to="/horoscopo/signos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{signoInfo.emoji}</span>
            <div>
              <h1 className="text-2xl font-bold">{signoInfo.nome} {signoInfo.simbolo}</h1>
              <p className="text-sm text-muted-foreground">
                {signoInfo.inicio.dia}/{signoInfo.inicio.mes} - {signoInfo.fim.dia}/{signoInfo.fim.mes}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Características */}
        <Card>
          <CardHeader>
            <CardTitle>Características</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Elemento</span>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${elementoInfo?.bg} ${elementoInfo?.cor}`}>
                {elementoInfo?.emoji} {signoInfo.elemento}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Modalidade</span>
              <span className="font-medium">{signoInfo.modalidade}</span>
            </div>
            <p className="text-sm text-muted-foreground pt-2 border-t">
              {modalidadeInfo?.descricao}
            </p>
          </CardContent>
        </Card>

        {/* Signos do mesmo elemento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {elementoInfo?.emoji} Signos de {signoInfo.elemento}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {elementoInfo?.signos.map((s) => (
                <Link key={s} to={`/horoscopo/signos/${s.toLowerCase()}`}>
                  <Button 
                    variant={s === signoInfo.nome ? "default" : "outline"} 
                    size="sm"
                  >
                    {s}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Previsão do Dia */}
        <PrevisaoDiaria previsao={previsao} isLoading={isLoading} signo={signoInfo.nome} />
      </div>
    </div>
  );
};

export default HoroscopoSignoDetalhe;

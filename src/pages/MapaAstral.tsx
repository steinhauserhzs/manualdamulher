import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Stars } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calcularSigno, calcularNumeroPessoal, calcularAnoPessoal, ELEMENTOS, MODALIDADES, getSignoByNome } from "@/lib/astrologia";

const MapaAstral = () => {
  const [perfilAstro, setPerfilAstro] = useState<any>(null);
  const [dataNascimento, setDataNascimento] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: perfil } = await supabase
          .from('perfis')
          .select('data_nascimento, nome')
          .eq('user_id', user.id)
          .single();
        
        if (perfil?.data_nascimento) {
          setDataNascimento(perfil.data_nascimento);
          const signo = calcularSigno(perfil.data_nascimento);
          if (signo) {
            setPerfilAstro({
              nome: perfil.nome,
              dataNascimento: perfil.data_nascimento,
              signo_solar: signo.nome,
              simbolo: signo.simbolo,
              emoji: signo.emoji,
              elemento: signo.elemento,
              modalidade: signo.modalidade,
              numero_pessoal: calcularNumeroPessoal(perfil.data_nascimento),
              ano_pessoal: calcularAnoPessoal(perfil.data_nascimento),
            });
          }
        }
      }
    };
    fetchData();
  }, []);

  const elementoInfo = perfilAstro ? ELEMENTOS[perfilAstro.elemento as keyof typeof ELEMENTOS] : null;
  const modalidadeInfo = perfilAstro ? MODALIDADES[perfilAstro.modalidade as keyof typeof MODALIDADES] : null;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-950/30 dark:to-indigo-950/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/horoscopo">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Stars className="h-6 w-6 text-purple-500" />
              Mapa Astral
            </h1>
            <p className="text-sm text-muted-foreground">Seu perfil astrológico completo</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {!dataNascimento ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Stars className="h-16 w-16 mx-auto mb-4 text-purple-500/50" />
              <h2 className="text-xl font-semibold mb-2">Configure sua data de nascimento</h2>
              <p className="text-muted-foreground mb-4">
                Precisamos da sua data de nascimento para calcular seu mapa astral.
              </p>
              <Link to="/configuracoes">
                <Button>Configurar Perfil</Button>
              </Link>
            </CardContent>
          </Card>
        ) : perfilAstro ? (
          <>
            {/* Card Principal */}
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
              <CardContent className="p-6">
                <div className="text-center">
                  <span className="text-6xl mb-4 block">{perfilAstro.emoji}</span>
                  <h2 className="text-3xl font-bold mb-1">
                    {perfilAstro.signo_solar} {perfilAstro.simbolo}
                  </h2>
                  <p className="text-muted-foreground">{perfilAstro.nome}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Nascimento: {new Date(perfilAstro.dataNascimento).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Detalhes */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Elemento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full ${elementoInfo?.bg} ${elementoInfo?.cor}`}>
                    <span className="text-2xl">{elementoInfo?.emoji}</span>
                    <span className="font-semibold">{perfilAstro.elemento}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Modalidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-lg">{perfilAstro.modalidade}</p>
                  <p className="text-xs text-muted-foreground">{modalidadeInfo?.descricao}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Número Pessoal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{perfilAstro.numero_pessoal}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Ano Pessoal {new Date().getFullYear()}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-secondary">{perfilAstro.ano_pessoal}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Signos do mesmo elemento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {elementoInfo?.emoji} Afinidade Elemental
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Signos do mesmo elemento tendem a se entender naturalmente:
                </p>
                <div className="flex gap-2 flex-wrap">
                  {elementoInfo?.signos.map((s) => {
                    const signoInfo = getSignoByNome(s);
                    return (
                      <Link key={s} to={`/horoscopo/signos/${s.toLowerCase()}`}>
                        <Button 
                          variant={s === perfilAstro.signo_solar ? "default" : "outline"} 
                          size="sm"
                        >
                          {signoInfo?.emoji} {s}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Links */}
            <div className="flex gap-3 flex-wrap">
              <Link to="/horoscopo/numerologia">
                <Button variant="outline">Ver Numerologia Completa</Button>
              </Link>
              <Link to="/horoscopo/compatibilidade">
                <Button variant="outline">Testar Compatibilidade</Button>
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default MapaAstral;

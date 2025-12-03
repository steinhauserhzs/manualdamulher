import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Stars, Compass, Hash, Heart, ChevronRight } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { PrevisaoDiaria } from "@/components/horoscopo/PrevisaoDiaria";
import { NumerologiaCard } from "@/components/horoscopo/NumerologiaCard";
import { calcularSigno, calcularNumeroPessoal, calcularAnoPessoal, ELEMENTOS, getSignoByNome } from "@/lib/astrologia";

interface PerfilAstrologico {
  signo_solar: string;
  elemento: string;
  modalidade: string;
  numero_pessoal: number;
  ano_pessoal: number;
}

interface Previsao {
  previsao_geral: string;
  amor?: string;
  trabalho?: string;
  saude?: string;
  numero_sorte?: number;
  cor_do_dia?: string;
}

const Horoscopo = () => {
  const [perfil, setPerfil] = useState<PerfilAstrologico | null>(null);
  const [previsao, setPrevisao] = useState<Previsao | null>(null);
  const [userName, setUserName] = useState("");
  const [dataNascimento, setDataNascimento] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar perfil do usuário
      const { data: perfilData } = await supabase
        .from('perfis')
        .select('nome, data_nascimento')
        .eq('user_id', user.id)
        .single();

      if (perfilData) {
        setUserName(perfilData.nome);
        setDataNascimento(perfilData.data_nascimento);

        if (perfilData.data_nascimento) {
          // Calcular dados astrológicos
          const signo = calcularSigno(perfilData.data_nascimento);
          const numeroPessoal = calcularNumeroPessoal(perfilData.data_nascimento);
          const anoPessoal = calcularAnoPessoal(perfilData.data_nascimento);

          if (signo) {
            const perfilAstro: PerfilAstrologico = {
              signo_solar: signo.nome,
              elemento: signo.elemento,
              modalidade: signo.modalidade,
              numero_pessoal: numeroPessoal,
              ano_pessoal: anoPessoal,
            };
            setPerfil(perfilAstro);

            // Salvar/atualizar perfil astrológico
            await supabase.from('perfil_astrologico').upsert({
              user_id: user.id,
              ...perfilAstro,
            }, { onConflict: 'user_id' });

            // Buscar previsão do dia
            const hoje = new Date().toISOString().split('T')[0];
            const { data: previsaoData } = await supabase
              .from('horoscopo_diario')
              .select('*')
              .eq('signo', signo.nome)
              .eq('data', hoje)
              .single();

            if (previsaoData) {
              setPrevisao(previsaoData);
            } else {
              // Tentar gerar previsões
              try {
                await supabase.functions.invoke('gerar-horoscopo');
                // Buscar novamente
                const { data: newPrevisao } = await supabase
                  .from('horoscopo_diario')
                  .select('*')
                  .eq('signo', signo.nome)
                  .eq('data', hoje)
                  .single();
                if (newPrevisao) setPrevisao(newPrevisao);
              } catch (e) {
                console.log('Previsões serão geradas em breve');
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signoInfo = perfil ? getSignoByNome(perfil.signo_solar) : null;
  const elementoInfo = perfil ? ELEMENTOS[perfil.elemento as keyof typeof ELEMENTOS] : null;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <ModuleHeader
        icon={Stars}
        title="Horóscopo"
        subtitle="Sua conexão com o universo"
        gradient="bem-estar"
      />

      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : !dataNascimento ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Stars className="h-16 w-16 mx-auto mb-4 text-primary/50" />
              <h2 className="text-xl font-semibold mb-2">Configure sua data de nascimento</h2>
              <p className="text-muted-foreground mb-4">
                Para personalizar sua experiência astrológica, precisamos saber quando você nasceu.
              </p>
              <Link to="/configuracoes">
                <Button>Configurar Perfil</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Card do Signo do Usuário */}
            {perfil && signoInfo && (
              <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="text-6xl">{signoInfo.emoji}</div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Olá, {userName}!</p>
                      <h2 className="text-2xl font-bold">
                        Você é de {perfil.signo_solar} {signoInfo.simbolo}
                      </h2>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${elementoInfo?.bg} ${elementoInfo?.cor}`}>
                          {elementoInfo?.emoji} {perfil.elemento}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {perfil.modalidade}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          • Número: {perfil.numero_pessoal}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Previsão do Dia */}
            <PrevisaoDiaria previsao={previsao} signo={perfil?.signo_solar} />

            {/* Numerologia Compacta */}
            {perfil && (
              <NumerologiaCard 
                numeroPessoal={perfil.numero_pessoal} 
                anoPessoal={perfil.ano_pessoal} 
                compact 
              />
            )}

            {/* Links de Navegação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/horoscopo/signos">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Compass className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Todos os Signos</p>
                        <p className="text-xs text-muted-foreground">Explore os 12 signos</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>

              <Link to="/horoscopo/numerologia">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                        <Hash className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium">Numerologia</p>
                        <p className="text-xs text-muted-foreground">Seus números pessoais</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>

              <Link to="/horoscopo/compatibilidade">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                        <Heart className="h-5 w-5 text-rose-500" />
                      </div>
                      <div>
                        <p className="font-medium">Compatibilidade</p>
                        <p className="text-xs text-muted-foreground">Afinidade entre signos</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>

              <Link to="/horoscopo/mapa-astral">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Stars className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium">Mapa Astral</p>
                        <p className="text-xs text-muted-foreground">Seu perfil completo</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Horoscopo;

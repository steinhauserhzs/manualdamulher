import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NumerologiaCard } from "@/components/horoscopo/NumerologiaCard";
import { calcularNumeroPessoal, calcularAnoPessoal } from "@/lib/astrologia";

const Numerologia = () => {
  const [numeroPessoal, setNumeroPessoal] = useState<number | null>(null);
  const [anoPessoal, setAnoPessoal] = useState<number | null>(null);
  const [dataNascimento, setDataNascimento] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: perfil } = await supabase
          .from('perfis')
          .select('data_nascimento')
          .eq('user_id', user.id)
          .single();
        
        if (perfil?.data_nascimento) {
          setDataNascimento(perfil.data_nascimento);
          setNumeroPessoal(calcularNumeroPessoal(perfil.data_nascimento));
          setAnoPessoal(calcularAnoPessoal(perfil.data_nascimento));
        }
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="bg-gradient-to-br from-secondary/20 to-primary/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/horoscopo">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Hash className="h-6 w-6" />
              Numerologia
            </h1>
            <p className="text-sm text-muted-foreground">Descubra o poder dos seus números</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {!dataNascimento ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Hash className="h-16 w-16 mx-auto mb-4 text-primary/50" />
              <h2 className="text-xl font-semibold mb-2">Configure sua data de nascimento</h2>
              <p className="text-muted-foreground mb-4">
                Precisamos da sua data de nascimento para calcular seus números pessoais.
              </p>
              <Link to="/configuracoes">
                <Button>Configurar Perfil</Button>
              </Link>
            </CardContent>
          </Card>
        ) : numeroPessoal && anoPessoal ? (
          <>
            <NumerologiaCard numeroPessoal={numeroPessoal} anoPessoal={anoPessoal} />

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">O que é Numerologia?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A numerologia é uma ciência antiga que estuda a influência dos números em nossas vidas. 
                  Seu <strong>Número Pessoal</strong> revela características permanentes da sua personalidade, 
                  enquanto o <strong>Ano Pessoal</strong> indica as energias e temas predominantes no ano atual.
                </p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Numerologia;

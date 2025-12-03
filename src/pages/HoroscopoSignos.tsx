import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Stars } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignoCard } from "@/components/horoscopo/SignoCard";
import { SIGNOS, calcularSigno } from "@/lib/astrologia";

const HoroscopoSignos = () => {
  const [userSigno, setUserSigno] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserSigno = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: perfil } = await supabase
          .from('perfis')
          .select('data_nascimento')
          .eq('user_id', user.id)
          .single();
        
        if (perfil?.data_nascimento) {
          const signo = calcularSigno(perfil.data_nascimento);
          if (signo) setUserSigno(signo.nome);
        }
      }
    };
    fetchUserSigno();
  }, []);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="bg-gradient-to-br from-primary/20 to-secondary/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/horoscopo">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Stars className="h-6 w-6" />
              Todos os Signos
            </h1>
            <p className="text-sm text-muted-foreground">Explore os 12 signos do zodíaco</p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {SIGNOS.map((signo) => (
            <SignoCard
              key={signo.nome}
              nome={signo.nome}
              simbolo={signo.simbolo}
              emoji={signo.emoji}
              elemento={signo.elemento}
              isUserSign={signo.nome === userSigno}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HoroscopoSignos;

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { SIGNOS, calcularCompatibilidade, calcularSigno } from "@/lib/astrologia";

const Compatibilidade = () => {
  const [signo1, setSigno1] = useState<string>("");
  const [signo2, setSigno2] = useState<string>("");
  const [resultado, setResultado] = useState<{ nivel: number; descricao: string } | null>(null);
  const [userSigno, setUserSigno] = useState<string>("");

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
          if (signo) {
            setUserSigno(signo.nome);
            setSigno1(signo.nome);
          }
        }
      }
    };
    fetchUserSigno();
  }, []);

  const handleCalcular = () => {
    if (signo1 && signo2) {
      const result = calcularCompatibilidade(signo1, signo2);
      setResultado(result);
    }
  };

  const getProgressColor = (nivel: number) => {
    if (nivel >= 80) return "bg-green-500";
    if (nivel >= 60) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-950/30 dark:to-pink-950/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/horoscopo">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Heart className="h-6 w-6 text-rose-500" />
              Compatibilidade
            </h1>
            <p className="text-sm text-muted-foreground">Descubra a afinidade entre signos</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Selecione dois signos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Primeiro Signo</label>
                <Select value={signo1} onValueChange={setSigno1}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIGNOS.map((s) => (
                      <SelectItem key={s.nome} value={s.nome}>
                        {s.emoji} {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {signo1 === userSigno && (
                  <p className="text-xs text-primary mt-1">Seu signo ✨</p>
                )}
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Segundo Signo</label>
                <Select value={signo2} onValueChange={setSigno2}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIGNOS.map((s) => (
                      <SelectItem key={s.nome} value={s.nome}>
                        {s.emoji} {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleCalcular} className="w-full" disabled={!signo1 || !signo2}>
              <Heart className="h-4 w-4 mr-2" />
              Ver Compatibilidade
            </Button>
          </CardContent>
        </Card>

        {resultado && (
          <Card className="animate-in fade-in slide-in-from-bottom-4">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <span className="text-4xl">{SIGNOS.find(s => s.nome === signo1)?.emoji}</span>
                  <Heart className="h-8 w-8 text-rose-500" />
                  <span className="text-4xl">{SIGNOS.find(s => s.nome === signo2)?.emoji}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {signo1} + {signo2}
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Afinidade</span>
                  <span className="font-bold text-lg">{resultado.nivel}%</span>
                </div>
                <Progress 
                  value={resultado.nivel} 
                  className={`h-3 ${getProgressColor(resultado.nivel)}`}
                />
                <p className="text-center text-muted-foreground mt-4">
                  {resultado.descricao}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Compatibilidade;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SIGNOS = [
  'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
  'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const hoje = new Date().toISOString().split('T')[0];

    // Verificar se já existem previsões para hoje
    const { data: existentes } = await supabase
      .from('horoscopo_diario')
      .select('signo')
      .eq('data', hoje);

    const signosExistentes = existentes?.map(e => e.signo) || [];
    const signosFaltantes = SIGNOS.filter(s => !signosExistentes.includes(s));

    if (signosFaltantes.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Previsões já geradas para hoje', count: 12 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Gerando previsões para ${signosFaltantes.length} signos...`);

    const previsoes = [];

    for (const signo of signosFaltantes) {
      const prompt = `Gere uma previsão de horóscopo para o signo de ${signo} para o dia ${hoje}.
Use um tom acolhedor, empoderador e positivo, adequado para mulheres independentes.
A previsão deve ser em português brasileiro.

Retorne APENAS um JSON válido (sem markdown, sem texto extra) no seguinte formato:
{
  "previsao_geral": "2-3 frases sobre o dia",
  "amor": "1-2 frases sobre relacionamentos",
  "trabalho": "1-2 frases sobre carreira e finanças",
  "saude": "1-2 frases sobre bem-estar",
  "numero_sorte": número entre 1 e 99,
  "cor_do_dia": "nome de uma cor"
}`;

      try {
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'Você é uma astróloga experiente e empática. Responda sempre em JSON válido.' },
              { role: 'user', content: prompt }
            ],
          }),
        });

        if (!response.ok) {
          console.error(`Erro na API para ${signo}:`, response.status);
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (content) {
          // Limpar possíveis marcadores de código
          const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
          const previsao = JSON.parse(jsonStr);

          previsoes.push({
            signo,
            data: hoje,
            previsao_geral: previsao.previsao_geral,
            amor: previsao.amor,
            trabalho: previsao.trabalho,
            saude: previsao.saude,
            numero_sorte: previsao.numero_sorte,
            cor_do_dia: previsao.cor_do_dia,
          });
        }
      } catch (parseError) {
        console.error(`Erro ao processar ${signo}:`, parseError);
      }
    }

    // Inserir todas as previsões no banco
    if (previsoes.length > 0) {
      const { error } = await supabase
        .from('horoscopo_diario')
        .insert(previsoes);

      if (error) {
        console.error('Erro ao inserir previsões:', error);
        throw error;
      }
    }

    console.log(`${previsoes.length} previsões geradas com sucesso`);

    return new Response(
      JSON.stringify({ 
        message: 'Previsões geradas com sucesso', 
        count: previsoes.length,
        signos: previsoes.map(p => p.signo)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na função gerar-horoscopo:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

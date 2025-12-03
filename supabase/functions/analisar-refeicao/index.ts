import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, descricao } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não está configurada');
    }

    let messages: any[] = [];
    
    const systemPrompt = `Você é um nutricionista especializado em análise de refeições. 
Analise a refeição descrita ou mostrada na imagem e forneça estimativas nutricionais precisas.

IMPORTANTE: Retorne APENAS um JSON válido no seguinte formato, sem texto adicional:
{
  "alimentos": [
    {"nome": "nome do alimento", "porcao": "porção estimada", "calorias": número}
  ],
  "totais": {
    "calorias": número,
    "proteinas": número em gramas,
    "carboidratos": número em gramas,
    "gorduras": número em gramas,
    "fibras": número em gramas
  },
  "observacoes": "breve observação nutricional"
}`;

    if (imageBase64) {
      // Análise com imagem
      messages = [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: [
            {
              type: "text",
              text: descricao 
                ? `Analise esta refeição. Contexto adicional: ${descricao}` 
                : "Analise esta refeição e estime os valores nutricionais."
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ];
    } else if (descricao) {
      // Análise apenas com descrição
      messages = [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: `Analise esta refeição baseado na descrição: ${descricao}`
        }
      ];
    } else {
      return new Response(
        JSON.stringify({ error: 'É necessário fornecer uma imagem ou descrição da refeição' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Enviando requisição para Lovable AI...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da API:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Entre em contato com o suporte.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('Resposta da IA:', content);

    // Tentar extrair JSON da resposta
    let analise;
    try {
      // Tenta fazer parse direto
      analise = JSON.parse(content);
    } catch {
      // Se falhar, tenta extrair JSON do texto
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analise = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Não foi possível extrair dados nutricionais da resposta');
      }
    }

    return new Response(
      JSON.stringify({ success: true, analise }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na função analisar-refeicao:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao analisar refeição';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Utilitários de cálculo astrológico

export const SIGNOS = [
  { nome: 'Áries', simbolo: '♈', emoji: '🐏', elemento: 'Fogo', modalidade: 'Cardinal', inicio: { mes: 3, dia: 21 }, fim: { mes: 4, dia: 19 } },
  { nome: 'Touro', simbolo: '♉', emoji: '🐂', elemento: 'Terra', modalidade: 'Fixo', inicio: { mes: 4, dia: 20 }, fim: { mes: 5, dia: 20 } },
  { nome: 'Gêmeos', simbolo: '♊', emoji: '👯', elemento: 'Ar', modalidade: 'Mutável', inicio: { mes: 5, dia: 21 }, fim: { mes: 6, dia: 20 } },
  { nome: 'Câncer', simbolo: '♋', emoji: '🦀', elemento: 'Água', modalidade: 'Cardinal', inicio: { mes: 6, dia: 21 }, fim: { mes: 7, dia: 22 } },
  { nome: 'Leão', simbolo: '♌', emoji: '🦁', elemento: 'Fogo', modalidade: 'Fixo', inicio: { mes: 7, dia: 23 }, fim: { mes: 8, dia: 22 } },
  { nome: 'Virgem', simbolo: '♍', emoji: '👩', elemento: 'Terra', modalidade: 'Mutável', inicio: { mes: 8, dia: 23 }, fim: { mes: 9, dia: 22 } },
  { nome: 'Libra', simbolo: '♎', emoji: '⚖️', elemento: 'Ar', modalidade: 'Cardinal', inicio: { mes: 9, dia: 23 }, fim: { mes: 10, dia: 22 } },
  { nome: 'Escorpião', simbolo: '♏', emoji: '🦂', elemento: 'Água', modalidade: 'Fixo', inicio: { mes: 10, dia: 23 }, fim: { mes: 11, dia: 21 } },
  { nome: 'Sagitário', simbolo: '♐', emoji: '🏹', elemento: 'Fogo', modalidade: 'Mutável', inicio: { mes: 11, dia: 22 }, fim: { mes: 12, dia: 21 } },
  { nome: 'Capricórnio', simbolo: '♑', emoji: '🐐', elemento: 'Terra', modalidade: 'Cardinal', inicio: { mes: 12, dia: 22 }, fim: { mes: 1, dia: 19 } },
  { nome: 'Aquário', simbolo: '♒', emoji: '🏺', elemento: 'Ar', modalidade: 'Fixo', inicio: { mes: 1, dia: 20 }, fim: { mes: 2, dia: 18 } },
  { nome: 'Peixes', simbolo: '♓', emoji: '🐟', elemento: 'Água', modalidade: 'Mutável', inicio: { mes: 2, dia: 19 }, fim: { mes: 3, dia: 20 } },
];

export const ELEMENTOS = {
  Fogo: { emoji: '🔥', cor: 'text-orange-500', bg: 'bg-orange-100', signos: ['Áries', 'Leão', 'Sagitário'] },
  Terra: { emoji: '🌍', cor: 'text-green-600', bg: 'bg-green-100', signos: ['Touro', 'Virgem', 'Capricórnio'] },
  Ar: { emoji: '💨', cor: 'text-sky-500', bg: 'bg-sky-100', signos: ['Gêmeos', 'Libra', 'Aquário'] },
  Água: { emoji: '💧', cor: 'text-blue-500', bg: 'bg-blue-100', signos: ['Câncer', 'Escorpião', 'Peixes'] },
};

export const MODALIDADES = {
  Cardinal: { descricao: 'Iniciadores, líderes naturais', signos: ['Áries', 'Câncer', 'Libra', 'Capricórnio'] },
  Fixo: { descricao: 'Estáveis, determinados', signos: ['Touro', 'Leão', 'Escorpião', 'Aquário'] },
  Mutável: { descricao: 'Adaptáveis, flexíveis', signos: ['Gêmeos', 'Virgem', 'Sagitário', 'Peixes'] },
};

export function calcularSigno(dataNascimento: Date | string): typeof SIGNOS[0] | null {
  const data = typeof dataNascimento === 'string' ? new Date(dataNascimento) : dataNascimento;
  const mes = data.getMonth() + 1;
  const dia = data.getDate();

  for (const signo of SIGNOS) {
    // Caso especial para Capricórnio que cruza o ano
    if (signo.nome === 'Capricórnio') {
      if ((mes === 12 && dia >= 22) || (mes === 1 && dia <= 19)) {
        return signo;
      }
    } else {
      const inicioOk = mes > signo.inicio.mes || (mes === signo.inicio.mes && dia >= signo.inicio.dia);
      const fimOk = mes < signo.fim.mes || (mes === signo.fim.mes && dia <= signo.fim.dia);
      if (inicioOk && fimOk) {
        return signo;
      }
    }
  }
  return null;
}

export function calcularNumeroPessoal(dataNascimento: Date | string): number {
  const data = typeof dataNascimento === 'string' ? new Date(dataNascimento) : dataNascimento;
  const dia = data.getDate();
  const mes = data.getMonth() + 1;
  const ano = data.getFullYear();
  
  let soma = dia + mes + ano;
  
  // Reduzir até um único dígito (1-9) ou número mestre (11, 22, 33)
  while (soma > 9 && soma !== 11 && soma !== 22 && soma !== 33) {
    soma = soma.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  
  return soma;
}

export function calcularAnoPessoal(dataNascimento: Date | string, anoAtual?: number): number {
  const data = typeof dataNascimento === 'string' ? new Date(dataNascimento) : dataNascimento;
  const dia = data.getDate();
  const mes = data.getMonth() + 1;
  const ano = anoAtual || new Date().getFullYear();
  
  let soma = dia + mes + ano;
  
  while (soma > 9) {
    soma = soma.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  
  return soma;
}

export function getSignoByNome(nome: string): typeof SIGNOS[0] | undefined {
  return SIGNOS.find(s => s.nome.toLowerCase() === nome.toLowerCase());
}

export function calcularCompatibilidade(signo1: string, signo2: string): { nivel: number; descricao: string } {
  const s1 = getSignoByNome(signo1);
  const s2 = getSignoByNome(signo2);
  
  if (!s1 || !s2) return { nivel: 0, descricao: 'Signo não encontrado' };
  
  // Mesmo signo
  if (s1.nome === s2.nome) {
    return { nivel: 75, descricao: 'Vocês se entendem bem, mas podem ter conflitos de ego.' };
  }
  
  // Mesmo elemento = alta compatibilidade
  if (s1.elemento === s2.elemento) {
    return { nivel: 90, descricao: 'Excelente! Vocês compartilham a mesma energia e se entendem naturalmente.' };
  }
  
  // Elementos complementares
  const complementares: Record<string, string> = {
    'Fogo': 'Ar',
    'Ar': 'Fogo',
    'Terra': 'Água',
    'Água': 'Terra',
  };
  
  if (complementares[s1.elemento] === s2.elemento) {
    return { nivel: 80, descricao: 'Ótima combinação! Seus elementos se complementam e fortalecem.' };
  }
  
  // Elementos desafiadores
  const desafiadores: Record<string, string> = {
    'Fogo': 'Água',
    'Água': 'Fogo',
    'Terra': 'Ar',
    'Ar': 'Terra',
  };
  
  if (desafiadores[s1.elemento] === s2.elemento) {
    return { nivel: 50, descricao: 'Relação desafiadora, mas com potencial de crescimento mútuo.' };
  }
  
  return { nivel: 65, descricao: 'Compatibilidade moderada. Requer esforço e compreensão.' };
}

export const SIGNIFICADOS_NUMEROS: Record<number, { titulo: string; descricao: string }> = {
  1: { titulo: 'O Líder', descricao: 'Independência, originalidade, pioneirismo. Você nasceu para liderar e iniciar novos caminhos.' },
  2: { titulo: 'O Diplomata', descricao: 'Cooperação, sensibilidade, parceria. Você tem o dom de unir pessoas e criar harmonia.' },
  3: { titulo: 'A Comunicadora', descricao: 'Criatividade, expressão, otimismo. Você inspira outros com sua alegria e talento artístico.' },
  4: { titulo: 'A Construtora', descricao: 'Estabilidade, organização, dedicação. Você constrói bases sólidas para o futuro.' },
  5: { titulo: 'A Aventureira', descricao: 'Liberdade, mudança, versatilidade. Você busca experiências e transformação constante.' },
  6: { titulo: 'A Cuidadora', descricao: 'Amor, responsabilidade, família. Você nutre e protege quem ama com dedicação.' },
  7: { titulo: 'A Mística', descricao: 'Sabedoria, introspecção, espiritualidade. Você busca verdades profundas e conhecimento.' },
  8: { titulo: 'A Realizadora', descricao: 'Poder, abundância, conquista. Você tem capacidade de manifestar seus objetivos materiais.' },
  9: { titulo: 'A Humanitária', descricao: 'Compaixão, generosidade, conclusão. Você veio para servir e elevar a humanidade.' },
  11: { titulo: 'A Iluminada', descricao: 'Intuição elevada, inspiração, missão espiritual. Número mestre de grande potencial.' },
  22: { titulo: 'A Mestra Construtora', descricao: 'Visão grandiosa, realização de sonhos impossíveis. Número mestre de poder manifestador.' },
  33: { titulo: 'A Mestra do Amor', descricao: 'Cura, serviço elevado, amor incondicional. Número mestre de compaixão suprema.' },
};

export const SIGNIFICADOS_ANO_PESSOAL: Record<number, { titulo: string; tema: string }> = {
  1: { titulo: 'Novos Começos', tema: 'Ano de plantar sementes, iniciar projetos, assumir a liderança da sua vida.' },
  2: { titulo: 'Parcerias', tema: 'Ano de cooperação, paciência, desenvolver relacionamentos e aguardar o momento certo.' },
  3: { titulo: 'Expressão', tema: 'Ano de criatividade, comunicação, alegria e expansão social.' },
  4: { titulo: 'Fundações', tema: 'Ano de trabalho duro, organização, construir bases sólidas para o futuro.' },
  5: { titulo: 'Mudanças', tema: 'Ano de transformação, liberdade, aventuras e novas experiências.' },
  6: { titulo: 'Amor e Família', tema: 'Ano de responsabilidades domésticas, relacionamentos e harmonia.' },
  7: { titulo: 'Introspecção', tema: 'Ano de reflexão, estudo, crescimento espiritual e autoconhecimento.' },
  8: { titulo: 'Abundância', tema: 'Ano de conquistas materiais, reconhecimento e poder pessoal.' },
  9: { titulo: 'Conclusões', tema: 'Ano de encerrar ciclos, perdoar, liberar o velho para receber o novo.' },
};

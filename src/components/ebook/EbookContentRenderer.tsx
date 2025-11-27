import ReactMarkdown from "react-markdown";
import { EbookWaterReminder } from "./EbookWaterReminder";
import { EbookInteractiveChecklist } from "./EbookInteractiveChecklist";
import { EbookInteractiveForm } from "./EbookInteractiveForm";
import { EbookBonusButton } from "./EbookBonusButton";
import { EbookMotivationalCard } from "./EbookMotivationalCard";

interface EbookContentRendererProps {
  content: string;
}

export const EbookContentRenderer = ({ content }: EbookContentRendererProps) => {
  // Custom components for ReactMarkdown with optimized mobile typography
  const markdownComponents = {
    h1: ({ children }: any) => (
      <h1 className="text-xl md:text-2xl font-bold text-primary mb-4 mt-6 leading-tight">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-lg md:text-xl font-semibold text-foreground mb-3 mt-5 leading-snug">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-base md:text-lg font-semibold text-foreground/90 mb-2 mt-4 leading-snug">
        {children}
      </h3>
    ),
    p: ({ children }: any) => (
      <p className="text-base leading-relaxed mb-4 text-foreground/90">
        {children}
      </p>
    ),
    ul: ({ children }: any) => (
      <ul className="pl-5 mb-4 space-y-2 list-disc">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="pl-5 mb-4 space-y-2 list-decimal">
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className="text-base leading-relaxed text-foreground/90">
        {children}
      </li>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary/30 pl-4 py-2 my-4 italic text-muted-foreground bg-muted/30 rounded-r">
        {children}
      </blockquote>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-foreground">
        {children}
      </strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-foreground/80">
        {children}
      </em>
    ),
    a: ({ children, href }: any) => (
      <a 
        href={href} 
        className="text-primary underline hover:text-primary/80 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    hr: () => (
      <hr className="my-6 border-border" />
    ),
  };

  // Parse custom interactive tags
  const parseCustomTags = (text: string) => {
    const elements: React.ReactNode[] = [];
    let remainingText = text;
    let keyCounter = 0;

    // Water reminder pattern: :::water-reminder ... :::
    const waterReminderRegex = /:::water-reminder\n([\s\S]*?)\n:::/g;
    let match;
    
    while ((match = waterReminderRegex.exec(text)) !== null) {
      const beforeMatch = remainingText.substring(0, remainingText.indexOf(match[0]));
      
      if (beforeMatch.trim()) {
        elements.push(
          <div key={keyCounter++} className="ebook-content">
            <ReactMarkdown components={markdownComponents}>
              {beforeMatch}
            </ReactMarkdown>
          </div>
        );
      }

      elements.push(
        <EbookWaterReminder key={keyCounter++}>
          {match[1].trim()}
        </EbookWaterReminder>
      );

      remainingText = remainingText.substring(remainingText.indexOf(match[0]) + match[0].length);
    }

    // Interactive checklist pattern: :::interactive-checklist:id ... :::
    const checklistRegex = /:::interactive-checklist:(\w+)\n([^\n]+)\n([\s\S]*?)\n:::/g;
    remainingText = text;
    
    while ((match = checklistRegex.exec(text)) !== null) {
      const id = match[1];
      const titulo = match[2];
      const opcoes = match[3].split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-\s*/, '').trim());

      elements.push(
        <EbookInteractiveChecklist
          key={keyCounter++}
          id={id}
          titulo={titulo}
          opcoes={opcoes}
        />
      );

      remainingText = remainingText.replace(match[0], '');
    }

    // Interactive form pattern: :::interactive-form:id ... :::
    const formRegex = /:::interactive-form:(\w+)\n([^\n]*?)\n([\s\S]*?)\n:::/g;
    
    while ((match = formRegex.exec(text)) !== null) {
      const id = match[1];
      const titulo = match[2];
      const camposText = match[3];
      
      const campos = camposText.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [tipo, ...rest] = line.split(':');
          const label = rest[0];
          const opcoes = rest.slice(1).join(':').split(',').map(o => o.trim()).filter(Boolean);

          return {
            tipo: tipo as 'text' | 'textarea' | 'number' | 'checklist',
            label,
            opcoes: opcoes.length > 0 ? opcoes : undefined,
          };
        });

      elements.push(
        <EbookInteractiveForm
          key={keyCounter++}
          id={id}
          titulo={titulo}
          campos={campos}
        />
      );

      remainingText = remainingText.replace(match[0], '');
    }

    // Bonus button pattern: :::bonus-button ... :::
    const bonusRegex = /:::bonus-button(?::(\w+))?\n([\s\S]*?)\n:::/g;
    
    while ((match = bonusRegex.exec(text)) !== null) {
      const capituloId = match[1];
      const texto = match[2].trim();

      elements.push(
        <EbookBonusButton
          key={keyCounter++}
          texto={texto}
          capituloId={capituloId}
        />
      );

      remainingText = remainingText.replace(match[0], '');
    }

    // Motivational cards pattern: :::motivational-cards ... :::
    const motivationalRegex = /:::motivational-cards\n([\s\S]*?)\n:::/g;
    
    while ((match = motivationalRegex.exec(text)) !== null) {
      const frases = match[1].split('\n')
        .filter(line => line.trim().startsWith('"'))
        .map(line => line.trim().replace(/^"(.*)"$/, '$1'));

      elements.push(
        <EbookMotivationalCard
          key={keyCounter++}
          frases={frases}
        />
      );

      remainingText = remainingText.replace(match[0], '');
    }

    // Remove all custom tags from remaining text
    remainingText = remainingText
      .replace(waterReminderRegex, '')
      .replace(checklistRegex, '')
      .replace(formRegex, '')
      .replace(bonusRegex, '')
      .replace(motivationalRegex, '');

    // Render remaining markdown content
    if (remainingText.trim() || elements.length === 0) {
      elements.push(
        <div key={keyCounter++} className="ebook-content">
          <ReactMarkdown components={markdownComponents}>
            {remainingText.trim() || text}
          </ReactMarkdown>
        </div>
      );
    }

    return <>{elements}</>;
  };

  return <div className="space-y-4">{parseCustomTags(content)}</div>;
};

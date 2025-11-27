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
  // Parse custom tags from the content
  const parseCustomTags = (text: string) => {
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let keyCounter = 0;

    // Water reminder pattern: :::water-reminder ... :::
    const waterReminderRegex = /:::water-reminder\n([\s\S]*?)\n:::/g;
    
    // Interactive checklist pattern: :::interactive-checklist:id ... :::
    const checklistRegex = /:::interactive-checklist:(\w+)\n([^\n]+)\n([\s\S]*?)\n:::/g;
    
    // Interactive form pattern: :::interactive-form:id ... :::
    const formRegex = /:::interactive-form:(\w+)\n([^\n]*?)\n([\s\S]*?)\n:::/g;
    
    // Bonus button pattern: :::bonus-button ... :::
    const bonusRegex = /:::bonus-button(?::(\w+))?\n([\s\S]*?)\n:::/g;
    
    // Motivational cards pattern: :::motivational-cards ... :::
    const motivationalRegex = /:::motivational-cards\n([\s\S]*?)\n:::/g;

    // Combine all patterns
    const combinedRegex = new RegExp(
      `(${waterReminderRegex.source}|${checklistRegex.source}|${formRegex.source}|${bonusRegex.source}|${motivationalRegex.source})`,
      'g'
    );

    let match;
    const processedContent = text;

    // Process water reminders
    let tempText = text;
    while ((match = waterReminderRegex.exec(text)) !== null) {
      const beforeMatch = tempText.substring(lastIndex, match.index);
      if (beforeMatch) {
        elements.push(
          <div key={keyCounter++} className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown>{beforeMatch}</ReactMarkdown>
          </div>
        );
      }

      elements.push(
        <EbookWaterReminder key={keyCounter++}>
          {match[1].trim()}
        </EbookWaterReminder>
      );

      lastIndex = match.index + match[0].length;
      tempText = tempText.replace(match[0], '');
    }

    // Process interactive checklists
    tempText = text;
    lastIndex = 0;
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

      tempText = tempText.replace(match[0], '');
    }

    // Process interactive forms
    tempText = text;
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

      tempText = tempText.replace(match[0], '');
    }

    // Process bonus buttons
    tempText = text;
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

      tempText = tempText.replace(match[0], '');
    }

    // Process motivational cards
    tempText = text;
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

      tempText = tempText.replace(match[0], '');
    }

    // If no custom tags found or there's remaining content, render as markdown
    if (elements.length === 0 || tempText.trim()) {
      return (
        <>
          {elements}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown>{tempText || text}</ReactMarkdown>
          </div>
        </>
      );
    }

    return <>{elements}</>;
  };

  return <div className="space-y-6">{parseCustomTags(content)}</div>;
};

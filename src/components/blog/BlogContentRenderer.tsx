import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, AlertTriangle, Heart, Quote, CheckCircle2, Info, Star, Sparkles } from 'lucide-react';

interface BlogContentRendererProps {
  content: string;
}

// Process custom blocks like :::tip, :::warning, etc.
const processCustomBlocks = (content: string): string => {
  // Convert custom block syntax to HTML-like markers for processing
  return content
    .replace(/:::tip\s*([\s\S]*?):::/g, '<custom-tip>$1</custom-tip>')
    .replace(/:::warning\s*([\s\S]*?):::/g, '<custom-warning>$1</custom-warning>')
    .replace(/:::important\s*([\s\S]*?):::/g, '<custom-important>$1</custom-important>')
    .replace(/:::quote\s*([\s\S]*?):::/g, '<custom-quote>$1</custom-quote>')
    .replace(/:::checklist\s*([\s\S]*?):::/g, '<custom-checklist>$1</custom-checklist>')
    .replace(/:::info\s*([\s\S]*?):::/g, '<custom-info>$1</custom-info>')
    .replace(/:::highlight\s*([\s\S]*?):::/g, '<custom-highlight>$1</custom-highlight>');
};

const TipCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Card className="my-6 border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/30">
    <CardContent className="p-4">
      <div className="flex gap-3">
        <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-900 dark:text-yellow-100 prose-p:my-1">{children}</div>
      </div>
    </CardContent>
  </Card>
);

const WarningCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Card className="my-6 border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/30">
    <CardContent className="p-4">
      <div className="flex gap-3">
        <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-orange-900 dark:text-orange-100 prose-p:my-1">{children}</div>
      </div>
    </CardContent>
  </Card>
);

const ImportantCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Card className="my-6 border-l-4 border-l-primary bg-primary/5">
    <CardContent className="p-4">
      <div className="flex gap-3">
        <Heart className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-sm text-foreground prose-p:my-1">{children}</div>
      </div>
    </CardContent>
  </Card>
);

const QuoteCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Card className="my-6 bg-muted/50 border-none">
    <CardContent className="p-6">
      <div className="flex gap-4">
        <Quote className="h-8 w-8 text-primary/40 flex-shrink-0" />
        <blockquote className="text-lg italic text-muted-foreground border-none pl-0">{children}</blockquote>
      </div>
    </CardContent>
  </Card>
);

const ChecklistCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Card className="my-6 border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/30">
    <CardContent className="p-4">
      <div className="flex gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-green-900 dark:text-green-100 prose-p:my-1">{children}</div>
      </div>
    </CardContent>
  </Card>
);

const InfoCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Card className="my-6 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/30">
    <CardContent className="p-4">
      <div className="flex gap-3">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900 dark:text-blue-100 prose-p:my-1">{children}</div>
      </div>
    </CardContent>
  </Card>
);

const HighlightCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Card className="my-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
    <CardContent className="p-6">
      <div className="flex gap-3">
        <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-foreground prose-p:my-1">{children}</div>
      </div>
    </CardContent>
  </Card>
);

export const BlogContentRenderer: React.FC<BlogContentRendererProps> = ({ content }) => {
  const processedContent = processCustomBlocks(content);
  
  // Split content by custom blocks and render accordingly
  const parts = processedContent.split(/(<custom-(?:tip|warning|important|quote|checklist|info|highlight)>[\s\S]*?<\/custom-(?:tip|warning|important|quote|checklist|info|highlight)>)/g);

  return (
    <div className="blog-content prose prose-slate dark:prose-invert max-w-none">
      {parts.map((part, index) => {
        // Check for custom blocks
        const tipMatch = part.match(/<custom-tip>([\s\S]*?)<\/custom-tip>/);
        if (tipMatch) {
          return <TipCard key={index}><ReactMarkdown>{tipMatch[1].trim()}</ReactMarkdown></TipCard>;
        }

        const warningMatch = part.match(/<custom-warning>([\s\S]*?)<\/custom-warning>/);
        if (warningMatch) {
          return <WarningCard key={index}><ReactMarkdown>{warningMatch[1].trim()}</ReactMarkdown></WarningCard>;
        }

        const importantMatch = part.match(/<custom-important>([\s\S]*?)<\/custom-important>/);
        if (importantMatch) {
          return <ImportantCard key={index}><ReactMarkdown>{importantMatch[1].trim()}</ReactMarkdown></ImportantCard>;
        }

        const quoteMatch = part.match(/<custom-quote>([\s\S]*?)<\/custom-quote>/);
        if (quoteMatch) {
          return <QuoteCard key={index}><ReactMarkdown>{quoteMatch[1].trim()}</ReactMarkdown></QuoteCard>;
        }

        const checklistMatch = part.match(/<custom-checklist>([\s\S]*?)<\/custom-checklist>/);
        if (checklistMatch) {
          return <ChecklistCard key={index}><ReactMarkdown>{checklistMatch[1].trim()}</ReactMarkdown></ChecklistCard>;
        }

        const infoMatch = part.match(/<custom-info>([\s\S]*?)<\/custom-info>/);
        if (infoMatch) {
          return <InfoCard key={index}><ReactMarkdown>{infoMatch[1].trim()}</ReactMarkdown></InfoCard>;
        }

        const highlightMatch = part.match(/<custom-highlight>([\s\S]*?)<\/custom-highlight>/);
        if (highlightMatch) {
          return <HighlightCard key={index}><ReactMarkdown>{highlightMatch[1].trim()}</ReactMarkdown></HighlightCard>;
        }

        // Regular markdown content
        if (part.trim()) {
          return (
            <ReactMarkdown
              key={index}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl md:text-3xl font-bold mt-8 mb-4 text-foreground">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl md:text-2xl font-semibold mt-8 mb-4 text-foreground flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg md:text-xl font-medium mt-6 mb-3 text-foreground">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-base leading-relaxed mb-4 text-muted-foreground">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="my-4 space-y-2 list-none pl-0">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-4 space-y-2 list-decimal pl-6">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-primary mt-1.5">•</span>
                    <span>{children}</span>
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-primary/80">{children}</em>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary/50 pl-4 my-4 italic text-muted-foreground bg-muted/30 py-2 rounded-r">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                hr: () => (
                  <hr className="my-8 border-border" />
                ),
              }}
            >
              {part}
            </ReactMarkdown>
          );
        }
        return null;
      })}
    </div>
  );
};

export default BlogContentRenderer;

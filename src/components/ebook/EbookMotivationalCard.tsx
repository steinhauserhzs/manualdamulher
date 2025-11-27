import { Quote } from "lucide-react";

interface EbookMotivationalCardProps {
  frases: string[];
}

export const EbookMotivationalCard = ({ frases }: EbookMotivationalCardProps) => {
  return (
    <div className="my-8 space-y-4 animate-fade-in">
      {frases.map((frase, index) => (
        <div
          key={index}
          className="p-5 rounded-xl bg-gradient-to-br from-primary/5 to-coral/5 border border-primary/20 shadow-sm hover-lift"
        >
          <div className="flex gap-3">
            <Quote className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm md:text-base text-foreground leading-relaxed font-medium italic">
              {frase}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

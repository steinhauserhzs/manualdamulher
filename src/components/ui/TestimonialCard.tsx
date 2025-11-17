import { Quote } from "lucide-react";

interface TestimonialCardProps {
  avatar: string;
  name: string;
  role: string;
  quote: string;
}

export const TestimonialCard = ({ avatar, name, role, quote }: TestimonialCardProps) => {
  return (
    <div className="gradient-card rounded-2xl p-4 md:p-6 shadow-card transition-transform hover:scale-105 w-full max-w-full">
      <Quote className="mb-4 h-6 w-6 md:h-8 md:w-8 text-primary/30" />
      <p className="mb-6 text-sm md:text-base text-muted-foreground italic break-words">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-primary text-xl md:text-2xl flex-shrink-0">
          {avatar}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground text-sm md:text-base break-words">{name}</p>
          <p className="text-xs md:text-sm text-muted-foreground break-words">{role}</p>
        </div>
      </div>
    </div>
  );
};

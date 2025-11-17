import { Quote } from "lucide-react";

interface TestimonialCardProps {
  avatar: string;
  name: string;
  role: string;
  quote: string;
}

export const TestimonialCard = ({ avatar, name, role, quote }: TestimonialCardProps) => {
  return (
    <div className="gradient-card rounded-2xl p-6 shadow-card transition-transform hover:scale-105">
      <Quote className="mb-4 h-8 w-8 text-primary/30" />
      <p className="mb-6 text-muted-foreground italic">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl">
          {avatar}
        </div>
        <div>
          <p className="font-semibold text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  );
};

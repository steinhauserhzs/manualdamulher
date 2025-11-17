import { LucideIcon } from "lucide-react";

interface StepCardProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const StepCard = ({ number, icon, title, description }: StepCardProps) => {
  return (
    <div className="relative text-center w-full max-w-full">
      <div className="mx-auto mb-4 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary/10 text-xl md:text-2xl font-bold text-primary">
        {number}
      </div>
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="mb-2 text-lg md:text-xl font-bold text-foreground break-words">{title}</h3>
      <p className="text-sm md:text-base text-muted-foreground break-words">{description}</p>
    </div>
  );
};

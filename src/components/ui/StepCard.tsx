import { LucideIcon } from "lucide-react";

interface StepCardProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const StepCard = ({ number, icon, title, description }: StepCardProps) => {
  return (
    <div className="relative text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
        {number}
      </div>
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="mb-2 text-xl font-bold text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

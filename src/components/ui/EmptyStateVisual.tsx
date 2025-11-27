import { LucideIcon } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface EmptyStateVisualProps {
  icon: LucideIcon;
  illustration?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyStateVisual = ({ 
  icon: Icon,
  illustration,
  title, 
  description, 
  actionLabel, 
  onAction,
  className 
}: EmptyStateVisualProps) => {
  return (
    <div className={cn("py-8 sm:py-12 text-center animate-fade-in", className)}>
      {illustration ? (
        <img 
          src={illustration} 
          alt={title}
          className="mx-auto h-32 w-32 sm:h-40 sm:w-40 object-cover rounded-full mb-4 opacity-80 shadow-lg"
          loading="lazy"
        />
      ) : (
        <div className="mx-auto mb-4 h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-muted/50 flex items-center justify-center">
          <Icon className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/70" />
        </div>
      )}
      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-muted-foreground max-w-xs mx-auto mb-4 px-4">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

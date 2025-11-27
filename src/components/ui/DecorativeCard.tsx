import { Card } from "./card";
import { cn } from "@/lib/utils";

interface DecorativeCardProps {
  children: React.ReactNode;
  illustration?: string;
  illustrationPosition?: "left" | "right";
  className?: string;
}

export const DecorativeCard = ({ 
  children, 
  illustration,
  illustrationPosition = "right",
  className 
}: DecorativeCardProps) => {
  return (
    <Card className={cn("relative overflow-hidden gradient-card shadow-card", className)}>
      {/* Decorative elements */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
      <div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-secondary/10 blur-xl" />
      
      {/* Illustration */}
      {illustration && (
        <img 
          src={illustration} 
          alt="decorative"
          className={cn(
            "absolute h-full w-1/3 object-cover opacity-20",
            illustrationPosition === "right" ? "right-0" : "left-0"
          )}
          loading="lazy"
        />
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </Card>
  );
};

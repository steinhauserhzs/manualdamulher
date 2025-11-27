import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  gradient: "casa" | "saude" | "bem-estar" | "financas" | "ebook";
  className?: string;
}

export const ModuleHeader = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  gradient,
  className 
}: ModuleHeaderProps) => {
  const gradientClasses = {
    casa: "gradient-casa",
    saude: "gradient-saude", 
    "bem-estar": "gradient-bem-estar",
    financas: "gradient-financas",
    ebook: "gradient-primary"
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-b-3xl p-6 pb-8 shadow-lg",
      gradientClasses[gradient],
      className
    )}>
      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {title}
          </h1>
        </div>
        {subtitle && (
          <p className="text-white/90 text-sm sm:text-base ml-14">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

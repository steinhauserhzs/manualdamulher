interface StatDisplayProps {
  number: string;
  label: string;
  icon?: React.ReactNode;
}

export const StatDisplay = ({ number, label, icon }: StatDisplayProps) => {
  return (
    <div className="flex flex-col items-center gap-2 p-3 md:p-4 w-full max-w-full">
      {icon && <div className="text-primary">{icon}</div>}
      <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary break-words">{number}</div>
      <div className="text-xs md:text-sm text-muted-foreground text-center break-words">{label}</div>
    </div>
  );
};

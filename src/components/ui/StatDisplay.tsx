interface StatDisplayProps {
  number: string;
  label: string;
  icon?: React.ReactNode;
}

export const StatDisplay = ({ number, label, icon }: StatDisplayProps) => {
  return (
    <div className="flex flex-col items-center gap-2 p-4">
      {icon && <div className="text-primary">{icon}</div>}
      <div className="text-4xl font-bold text-primary">{number}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
};

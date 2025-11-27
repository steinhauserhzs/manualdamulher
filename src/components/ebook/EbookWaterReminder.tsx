import { Droplets } from "lucide-react";

interface EbookWaterReminderProps {
  children: React.ReactNode;
}

export const EbookWaterReminder = ({ children }: EbookWaterReminderProps) => {
  return (
    <div className="my-6 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <Droplets className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
          {children}
        </p>
      </div>
    </div>
  );
};

import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EmergencyModal } from "./EmergencyModal";

export const EmergencyButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative hover:bg-rose-100 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400"
        title="Contatos de Emergência"
      >
        <Shield className="h-5 w-5" />
      </Button>
      <EmergencyModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface EbookBonusButtonProps {
  texto?: string;
  capituloId?: string;
}

export const EbookBonusButton = ({
  texto = "Ver método dos 5 minutos",
  capituloId,
}: EbookBonusButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (capituloId) {
      navigate(`/ebook/${capituloId}`);
    } else {
      // Se não tiver ID específico, vai para o último capítulo (bônus)
      navigate('/ebook');
      setTimeout(() => {
        const bonusElement = document.querySelector('[data-bonus="true"]');
        if (bonusElement) {
          bonusElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  return (
    <div className="my-6 flex justify-center animate-fade-in">
      <Button
        onClick={handleClick}
        size="lg"
        className="gap-2 bg-gradient-to-r from-coral to-primary hover:opacity-90 transition-all hover-lift shadow-lg"
      >
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">{texto}</span>
        <ArrowRight className="w-5 h-5" />
      </Button>
    </div>
  );
};

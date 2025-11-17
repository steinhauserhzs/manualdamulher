import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TutorialContextType {
  activeTutorial: string | null;
  startTutorial: (modulo: string) => void;
  endTutorial: () => void;
  currentStep: number;
  nextStep: () => void;
  previousStep: () => void;
  isTutorialComplete: (modulo: string) => boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider = ({ children }: { children: ReactNode }) => {
  const [activeTutorial, setActiveTutorial] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadProgress = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('tutorial_progress')
        .select('modulo, completed')
        .eq('user_id', session.user.id);

      if (data) {
        const completed = new Set(data.filter(t => t.completed).map(t => t.modulo));
        setCompletedTutorials(completed);
      }
    };

    loadProgress();
  }, []);

  const startTutorial = (modulo: string) => {
    setActiveTutorial(modulo);
    setCurrentStep(0);
  };

  const endTutorial = async () => {
    if (!activeTutorial) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase
      .from('tutorial_progress')
      .upsert({
        user_id: session.user.id,
        modulo: activeTutorial,
        completed: true,
        step_atual: currentStep,
      });

    setCompletedTutorials(prev => new Set([...prev, activeTutorial]));
    setActiveTutorial(null);
    setCurrentStep(0);
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const previousStep = () => setCurrentStep(prev => Math.max(0, prev - 1));
  const isTutorialComplete = (modulo: string) => completedTutorials.has(modulo);

  return (
    <TutorialContext.Provider value={{
      activeTutorial,
      startTutorial,
      endTutorial,
      currentStep,
      nextStep,
      previousStep,
      isTutorialComplete,
    }}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial must be used within TutorialProvider");
  }
  return context;
};

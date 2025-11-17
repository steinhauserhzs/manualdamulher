import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingContextType {
  isOnboardingComplete: boolean;
  showOnboarding: () => void;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('onboarding_progress')
        .select('completed')
        .eq('user_id', session.user.id)
        .maybeSingle();

      setIsOnboardingComplete(data?.completed ?? false);
      setLoading(false);
    };

    checkOnboarding();
  }, []);

  const showOnboarding = () => setIsOnboardingComplete(false);

  const completeOnboarding = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase
      .from('onboarding_progress')
      .upsert({
        user_id: session.user.id,
        completed: true,
        step: 'complete',
      });

    setIsOnboardingComplete(true);
  };

  if (loading) {
    return null;
  }

  return (
    <OnboardingContext.Provider value={{
      isOnboardingComplete,
      showOnboarding,
      completeOnboarding,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
};

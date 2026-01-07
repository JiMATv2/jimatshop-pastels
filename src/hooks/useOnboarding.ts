import { useEffect, useState } from "react";

const ONBOARDING_SEEN_KEY = "jimatshop_onboarding_seen";

export function useOnboarding() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const seen = localStorage.getItem(ONBOARDING_SEEN_KEY) === "true";
    setHasSeenOnboarding(seen);
  }, []);

  const markOnboardingSeen = () => {
    localStorage.setItem(ONBOARDING_SEEN_KEY, "true");
    setHasSeenOnboarding(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_SEEN_KEY);
    setHasSeenOnboarding(false);
  };

  return {
    hasSeenOnboarding,
    isLoading: hasSeenOnboarding === null,
    markOnboardingSeen,
    resetOnboarding,
  };
}

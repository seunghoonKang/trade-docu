import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GUIDE_STEPS, isOnGuideRoute } from "../lib/steps";
import { ServiceGuideContext, type ServiceGuideContextValue } from "../hooks/useServiceGuide";
import { ServiceGuideOverlay } from "./ServiceGuideOverlay";

export function ServiceGuideProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const openGuide = useCallback(() => {
    setStepIndex(0);
    setIsOpen(true);
  }, []);

  const closeGuide = useCallback(() => {
    setIsOpen(false);
  }, []);

  const nextStep = useCallback(() => {
    setStepIndex((current) => {
      if (current >= GUIDE_STEPS.length - 1) {
        setIsOpen(false);
        return current;
      }
      return current + 1;
    });
  }, []);

  const prevStep = useCallback(() => {
    setStepIndex((current) => (current > 0 ? current - 1 : current));
  }, []);

  const goToStepRoute = useCallback(() => {
    const step = GUIDE_STEPS[stepIndex];
    if (step?.route && !isOnGuideRoute(pathname, step.route)) {
      navigate(step.route);
    }
  }, [navigate, pathname, stepIndex]);

  const finishGuide = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo<ServiceGuideContextValue>(
    () => ({
      isOpen,
      stepIndex,
      totalSteps: GUIDE_STEPS.length,
      openGuide,
      closeGuide,
      nextStep,
      prevStep,
      goToStepRoute,
      finishGuide,
    }),
    [closeGuide, finishGuide, goToStepRoute, isOpen, nextStep, openGuide, prevStep, stepIndex],
  );

  return (
    <ServiceGuideContext.Provider value={value}>
      {children}
      <ServiceGuideOverlay
        isOpen={isOpen}
        stepIndex={stepIndex}
        totalSteps={GUIDE_STEPS.length}
        onClose={closeGuide}
        onNext={nextStep}
        onPrev={prevStep}
        onNavigate={goToStepRoute}
        onFinish={finishGuide}
      />
    </ServiceGuideContext.Provider>
  );
}

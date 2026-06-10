import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/entities/session";
import { getGuideSteps, isOnGuideRoute } from "../lib/steps";
import { ServiceGuideContext, type ServiceGuideContextValue } from "../lib/useServiceGuide";
import { ServiceGuideOverlay } from "./ServiceGuideOverlay";

/** 계층형 가이드(#28): 로그인 여부로 게스트 미니/멤버 해피패스 플로우를 고른다. */
export function ServiceGuideProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = useMemo(() => getGuideSteps(user ? "member" : "guest"), [user]);

  const openGuide = useCallback(() => {
    setStepIndex(0);
    setIsOpen(true);
  }, []);

  const closeGuide = useCallback(() => {
    setIsOpen(false);
  }, []);

  const nextStep = useCallback(() => {
    setStepIndex((current) => {
      if (current >= steps.length - 1) {
        setIsOpen(false);
        return current;
      }
      return current + 1;
    });
  }, [steps]);

  const prevStep = useCallback(() => {
    setStepIndex((current) => (current > 0 ? current - 1 : current));
  }, []);

  const goToStepRoute = useCallback(() => {
    const step = steps[stepIndex];
    if (step?.route && !isOnGuideRoute(pathname, step.route)) {
      navigate(step.route);
    }
  }, [navigate, pathname, stepIndex, steps]);

  const finishGuide = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo<ServiceGuideContextValue>(
    () => ({
      isOpen,
      stepIndex,
      totalSteps: steps.length,
      currentStep: steps[stepIndex],
      openGuide,
      closeGuide,
      nextStep,
      prevStep,
      goToStepRoute,
      finishGuide,
    }),
    [closeGuide, finishGuide, goToStepRoute, isOpen, nextStep, openGuide, prevStep, stepIndex, steps],
  );

  return (
    <ServiceGuideContext.Provider value={value}>
      {children}
      <ServiceGuideOverlay
        isOpen={isOpen}
        steps={steps}
        stepIndex={stepIndex}
        onClose={closeGuide}
        onNext={nextStep}
        onPrev={prevStep}
        onNavigate={goToStepRoute}
        onFinish={finishGuide}
      />
    </ServiceGuideContext.Provider>
  );
}

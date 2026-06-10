import { createContext, useContext } from "react";
import type { GuideStep } from "./steps";

export interface ServiceGuideContextValue {
  isOpen: boolean;
  stepIndex: number;
  totalSteps: number;
  currentStep: GuideStep | undefined;
  openGuide: () => void;
  closeGuide: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStepRoute: () => void;
  finishGuide: () => void;
}

export const ServiceGuideContext = createContext<ServiceGuideContextValue | null>(null);

export function useServiceGuide(): ServiceGuideContextValue {
  const value = useContext(ServiceGuideContext);
  if (!value) {
    throw new Error("useServiceGuide must be used within ServiceGuideProvider");
  }
  return value;
}

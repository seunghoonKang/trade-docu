import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Button } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { getCardStyle, shouldSkipScrollIntoView } from "../lib/cardPosition";
import {
  getGuideStep,
  getNavigateLabelKey,
  isOnGuideRoute,
} from "../lib/steps";

const SPOTLIGHT_PADDING = 8;
const DESKTOP_MEDIA = "(min-width: 768px)";

interface ServiceGuideOverlayProps {
  isOpen: boolean;
  stepIndex: number;
  totalSteps: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onNavigate: () => void;
  onFinish: () => void;
}

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(DESKTOP_MEDIA).matches : true,
  );

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_MEDIA);
    const handler = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  return isDesktop;
}

function useTargetRect(target: string | undefined, enabled: boolean, stepIndex: number) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  const update = useCallback(() => {
    if (!enabled || !target) {
      setRect(null);
      return;
    }
    const element = document.querySelector(target);
    if (!element) {
      setRect(null);
      return;
    }
    if (!shouldSkipScrollIntoView(target)) {
      element.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    setRect(element.getBoundingClientRect());
  }, [enabled, target]);

  useEffect(() => {
    if (!enabled || !target) {
      setRect(null);
      return;
    }

    update();
    const retryTimer = window.setTimeout(update, 350);
    const retryTimer2 = window.setTimeout(update, 700);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      window.clearTimeout(retryTimer);
      window.clearTimeout(retryTimer2);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [enabled, target, stepIndex, update]);

  return rect;
}

export function ServiceGuideOverlay({
  isOpen,
  stepIndex,
  totalSteps,
  onClose,
  onNext,
  onPrev,
  onNavigate,
  onFinish,
}: ServiceGuideOverlayProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const isDesktop = useIsDesktop();
  const step = getGuideStep(stepIndex);

  const isCenterStep = step?.placement === "center";
  const onCorrectRoute = step ? isOnGuideRoute(pathname, step.route) : true;
  const needsNavigation = Boolean(step?.route && !onCorrectRoute);
  const waitingForTarget = Boolean(
    isOpen && step?.target && onCorrectRoute && !needsNavigation,
  );
  const targetRect = useTargetRect(step?.target, waitingForTarget, stepIndex);
  const targetMissing = Boolean(waitingForTarget && !targetRect);
  const showCenterCard = isCenterStep || needsNavigation || targetMissing;
  const showSpotlight = Boolean(waitingForTarget && targetRect && !targetMissing);

  const isCompleteStep = step?.id === "complete";
  const isFirstStep = stepIndex === 0;

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !isDesktop || !step) return null;

  const navigateLabelKey = getNavigateLabelKey(step.route);
  const cardStyle = showCenterCard ? undefined : getCardStyle(step, targetRect);

  return (
    <div className="fixed inset-0 z-[60]" aria-hidden={false}>
      {showSpotlight && targetRect ? (
        <div
          className="pointer-events-none absolute rounded-lg transition-all duration-200"
          style={{
            top: targetRect.top - SPOTLIGHT_PADDING,
            left: targetRect.left - SPOTLIGHT_PADDING,
            width: targetRect.width + SPOTLIGHT_PADDING * 2,
            height: targetRect.height + SPOTLIGHT_PADDING * 2,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-black/55" />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-guide-title"
        className={cn(
          "absolute w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg",
          showCenterCard && "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          !showCenterCard && "w-sm",
        )}
        style={cardStyle}
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("guide.stepOf", { current: stepIndex + 1, total: totalSteps })}
        </p>
        <h2 id="service-guide-title" className="mt-2 text-lg font-semibold text-primary">
          {t(`guide.steps.${step.id}.title`)}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{t(`guide.steps.${step.id}.body`)}</p>

        {needsNavigation && navigateLabelKey && (
          <div className="mt-4">
            <Button type="button" size="lg" className="h-11 w-full text-sm font-semibold" onClick={onNavigate}>
              {t(navigateLabelKey)}
            </Button>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("guide.close")}
          </Button>
          <div className="flex gap-2">
            {!isFirstStep && (
              <Button type="button" variant="outline" onClick={onPrev}>
                {t("guide.prev")}
              </Button>
            )}
            {isCompleteStep ? (
              <Button type="button" onClick={onFinish}>
                {t("guide.finish")}
              </Button>
            ) : needsNavigation ? null : (
              <Button type="button" onClick={onNext}>
                {t("guide.next")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

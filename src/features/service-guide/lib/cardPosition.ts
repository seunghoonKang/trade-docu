import type { GuidePlacement, GuideStep } from "./steps";

export const CARD_WIDTH = 384;
export const CARD_ESTIMATED_HEIGHT = 280;
const VIEWPORT_MARGIN = 16;
const SIDEBAR_CARD_LEFT = 88;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function clampPoint(top: number, left: number) {
  return {
    top: clamp(top, VIEWPORT_MARGIN, window.innerHeight - CARD_ESTIMATED_HEIGHT - VIEWPORT_MARGIN),
    left: clamp(left, VIEWPORT_MARGIN, window.innerWidth - CARD_WIDTH - VIEWPORT_MARGIN),
  };
}

const SIDEBAR_GUIDE_TARGETS = new Set([
  '[data-guide="nav-invoices"]',
  '[data-guide="nav-history"]',
]);

function isSidebarTarget(target: string | undefined): boolean {
  return Boolean(target && SIDEBAR_GUIDE_TARGETS.has(target));
}

export function shouldSkipScrollIntoView(target: string | undefined): boolean {
  return isSidebarTarget(target);
}

export function getCardStyle(step: GuideStep, rect: DOMRect | null): React.CSSProperties | undefined {
  if (step.placement === "center" || !rect) {
    return undefined;
  }

  const margin = VIEWPORT_MARGIN;

  if (isSidebarTarget(step.target)) {
    return clampPoint(rect.top, SIDEBAR_CARD_LEFT);
  }

  switch (step.placement) {
    case "right":
      return clampPoint(rect.top, rect.right + margin);
    case "left":
      return clampPoint(rect.top, rect.left - CARD_WIDTH - margin);
    case "bottom":
      return clampPoint(
        rect.bottom + margin,
        rect.left + rect.width / 2 - CARD_WIDTH / 2,
      );
    case "top":
      return clampPoint(
        rect.top - margin,
        rect.left + rect.width / 2 - CARD_WIDTH / 2,
      );
    default:
      return undefined;
  }
}

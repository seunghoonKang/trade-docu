export type GuideStepId =
  | "welcome"
  | "nav-invoices"
  | "invoice-form"
  | "export-toolbar"
  | "preview"
  | "nav-history"
  | "history-actions"
  | "nav-profile"
  | "profile-seller"
  | "profile-bank"
  | "complete";

export type GuidePlacement = "center" | "right" | "bottom" | "left" | "top";

export interface GuideStep {
  id: GuideStepId;
  route?: string;
  target?: string;
  placement: GuidePlacement;
}

export const GUIDE_STEPS: GuideStep[] = [
  { id: "welcome", placement: "center" },
  { id: "nav-invoices", route: "/", target: '[data-guide="nav-invoices"]', placement: "right" },
  { id: "invoice-form", route: "/", target: '[data-guide="invoice-form"]', placement: "right" },
  { id: "export-toolbar", route: "/", target: '[data-guide="export-toolbar"]', placement: "left" },
  { id: "preview", route: "/", target: '[data-guide="preview"]', placement: "left" },
  { id: "nav-history", route: "/history", target: '[data-guide="nav-history"]', placement: "right" },
  {
    id: "history-actions",
    route: "/history",
    target: '[data-guide="history-actions"]',
    placement: "right",
  },
  { id: "nav-profile", route: "/profile", target: '[data-guide="nav-profile"]', placement: "left" },
  {
    id: "profile-seller",
    route: "/profile",
    target: '[data-guide="profile-seller"]',
    placement: "right",
  },
  { id: "profile-bank", route: "/profile", target: '[data-guide="profile-bank"]', placement: "left" },
  { id: "complete", placement: "center" },
];

export function getGuideStep(index: number): GuideStep | undefined {
  return GUIDE_STEPS[index];
}

export function isOnGuideRoute(pathname: string, route: string | undefined): boolean {
  if (!route) return true;
  if (route === "/") return pathname === "/";
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function getNavigateLabelKey(route: string | undefined): string | null {
  if (route === "/") return "guide.navigateToInvoices";
  if (route === "/history") return "guide.navigateToHistory";
  if (route === "/profile") return "guide.navigateToProfile";
  return null;
}

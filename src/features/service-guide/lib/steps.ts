/**
 * 계층형 가이드(#28) — 선형 11단계 투어를 대체한다.
 * - 게스트 미니(3스텝): 템플릿(미리보기) → 작성 → 내보내기.
 * - 로그인 핵심 해피패스(5스텝): 환영(한 거래 = 여러 문서) → 새 문서 → 저장=거래 건
 *   → History 거래 건 구조 → 거래 상세에서 CI/PL 추가 발행.
 * 컨텍스트 코치마크(분할선적/양식 탭/표시항목)는 coachmarks.ts.
 */

export type GuideStepId =
  | "guest-template"
  | "guest-form"
  | "guest-export"
  | "member-welcome"
  | "member-new-doc"
  | "member-save-deal"
  | "member-history"
  | "member-deal-docs";

export type GuidePlacement = "center" | "right" | "bottom" | "left" | "top";

export type GuideFlow = "guest" | "member";

export interface GuideStep {
  id: GuideStepId;
  route?: string;
  target?: string;
  placement: GuidePlacement;
}

export const GUEST_GUIDE_STEPS: GuideStep[] = [
  { id: "guest-template", route: "/", target: '[data-guide="template-gallery"]', placement: "bottom" },
  { id: "guest-form", route: "/new", target: '[data-guide="invoice-form"]', placement: "right" },
  { id: "guest-export", route: "/new", target: '[data-guide="export-toolbar"]', placement: "left" },
];

export const MEMBER_GUIDE_STEPS: GuideStep[] = [
  { id: "member-welcome", placement: "center" },
  { id: "member-new-doc", route: "/new", target: '[data-guide="invoice-form"]', placement: "right" },
  { id: "member-save-deal", route: "/new", target: '[data-guide="export-toolbar"]', placement: "left" },
  { id: "member-history", route: "/history", target: '[data-guide="history-actions"]', placement: "right" },
  { id: "member-deal-docs", placement: "center" },
];

export function getGuideSteps(flow: GuideFlow): GuideStep[] {
  return flow === "member" ? MEMBER_GUIDE_STEPS : GUEST_GUIDE_STEPS;
}

export function isOnGuideRoute(pathname: string, route: string | undefined): boolean {
  if (!route) return true;
  if (route === "/") return pathname === "/";
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function getNavigateLabelKey(route: string | undefined): string | null {
  if (route === "/" || route === "/new") return "guide.navigateToInvoices";
  if (route === "/history") return "guide.navigateToHistory";
  if (route === "/profile") return "guide.navigateToProfile";
  return null;
}

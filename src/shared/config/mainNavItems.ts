import { BookUser, FileText, History, Wrench, type LucideIcon } from "lucide-react";

export interface MainNavItem {
  id: string;
  icon: LucideIcon;
  labelKey: string;
  href: string;
  /** 사이드바 배치 구역 — primary=본 콘텐츠(상단), secondary=보조 도구(하단). 기본 primary. */
  section?: "primary" | "secondary";
}

export const mainNavItems: MainNavItem[] = [
  { id: "invoices", icon: FileText, labelKey: "nav.invoices", href: "/" },
  { id: "history", icon: History, labelKey: "nav.history", href: "/history" },
  { id: "buyers", icon: BookUser, labelKey: "nav.buyers", href: "/buyers" },
  { id: "tools", icon: Wrench, labelKey: "nav.tools", href: "/tools", section: "secondary" },
];

export type AppPageId = "home" | "documents" | "history" | "historyDetail" | "buyers" | "tools";

const pageIdToNavId: Record<AppPageId, MainNavItem["id"]> = {
  home: "invoices",
  documents: "invoices",
  history: "history",
  historyDetail: "history",
  buyers: "buyers",
  tools: "tools",
};

const pageTitleKeyOverrides: Partial<Record<AppPageId, string>> = {
  historyDetail: "history.detailPageTitle",
};

export function getPageTitleKey(page: AppPageId): string {
  const override = pageTitleKeyOverrides[page];
  if (override) return override;
  const navId = pageIdToNavId[page];
  return mainNavItems.find((item) => item.id === navId)?.labelKey ?? "nav.invoices";
}

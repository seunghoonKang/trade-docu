import { BookUser, FileText, History, type LucideIcon } from "lucide-react";

export interface MainNavItem {
  id: string;
  icon: LucideIcon;
  labelKey: string;
  href: string;
}

export const mainNavItems: MainNavItem[] = [
  { id: "invoices", icon: FileText, labelKey: "nav.invoices", href: "/" },
  { id: "history", icon: History, labelKey: "nav.history", href: "/history" },
  { id: "buyers", icon: BookUser, labelKey: "nav.buyers", href: "/buyers" },
];

export type AppPageId = "home" | "documents" | "history" | "historyDetail" | "buyers";

const pageIdToNavId: Record<AppPageId, MainNavItem["id"]> = {
  home: "invoices",
  documents: "invoices",
  history: "history",
  historyDetail: "history",
  buyers: "buyers",
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

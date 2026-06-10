import { FileText, History, type LucideIcon } from "lucide-react";

export interface MainNavItem {
  id: string;
  icon: LucideIcon;
  labelKey: string;
  href: string;
}

export const mainNavItems: MainNavItem[] = [
  { id: "invoices", icon: FileText, labelKey: "nav.invoices", href: "/" },
  { id: "history", icon: History, labelKey: "nav.history", href: "/history" },
];

export type AppPageId = "home" | "documents" | "history" | "historyDetail";

const pageIdToNavId: Record<AppPageId, MainNavItem["id"]> = {
  home: "invoices",
  documents: "invoices",
  history: "history",
  historyDetail: "history",
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

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

export type AppPageId = "documents" | "history";

const pageIdToNavId: Record<AppPageId, MainNavItem["id"]> = {
  documents: "invoices",
  history: "history",
};

export function getPageTitleKey(page: AppPageId): string {
  const navId = pageIdToNavId[page];
  return mainNavItems.find((item) => item.id === navId)?.labelKey ?? "nav.invoices";
}

import { ArrowRightLeft, Container, FileSpreadsheet, type LucideIcon } from "lucide-react";

/** 도구 섹션의 개별 도구 — /tools 랜딩 카드 목록의 단일 소스. */
export interface ToolItem {
  id: string;
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  href: string;
}

export const toolItems: ToolItem[] = [
  {
    id: "pdf-to-excel",
    icon: FileSpreadsheet,
    titleKey: "tools.pdfToExcel.title",
    descKey: "tools.pdfToExcel.desc",
    href: "/tools/pdf-to-excel",
  },
  {
    id: "cbm",
    icon: Container,
    titleKey: "tools.cbm.title",
    descKey: "tools.cbm.desc",
    href: "/tools/cbm",
  },
  {
    id: "exchange-rate",
    icon: ArrowRightLeft,
    titleKey: "tools.fx.title",
    descKey: "tools.fx.desc",
    href: "/tools/exchange-rate",
  },
];

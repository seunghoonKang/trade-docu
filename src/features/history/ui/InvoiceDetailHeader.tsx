import {
  ArrowLeft,
  Calendar,
  FileSpreadsheet,
  FileText,
  FolderInput,
  Printer,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui";
import type { Invoice } from "@/entities/invoice";

interface Props {
  invoice: Invoice;
  onBack: () => void;
  onPdf: () => void;
  onExcel: () => void;
  onPrint: () => void;
  onLoad: () => void;
  onDelete: () => void;
}

export function InvoiceDetailHeader({
  invoice,
  onBack,
  onPdf,
  onExcel,
  onPrint,
  onLoad,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const title = invoice.invoiceNo || t("history.noNumber");
  const documentDate = invoice.date.trim() !== "" ? invoice.date : t("history.noDocumentDate");

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="-ml-2.5 gap-1.5 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("history.backToList")}
      </Button>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("history.detailPageTitle")}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-primary truncate">{title}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
            <Calendar className="size-4 shrink-0" aria-hidden />
            {t("history.issuedOn", {
              date: documentDate,
              type: t("history.proformaInvoice"),
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onPdf}>
            <FileText className="size-4" aria-hidden />
            {t("export.pdf")}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onExcel}>
            <FileSpreadsheet className="size-4" aria-hidden />
            {t("export.excel")}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onPrint}>
            <Printer className="size-4" aria-hidden />
            {t("export.print")}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onLoad}>
            <FolderInput className="size-4" aria-hidden />
            {t("history.load")}
          </Button>
          <Button variant="destructive" size="sm" className="gap-1.5" onClick={onDelete}>
            <Trash2 className="size-4" aria-hidden />
            {t("history.delete")}
          </Button>
        </div>
      </div>
    </div>
  );
}

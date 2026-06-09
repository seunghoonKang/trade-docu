import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Invoice } from "@/entities/invoice";

interface Props {
  invoice: Invoice;
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-border last:border-b-0">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-semibold text-primary text-right">{value}</span>
    </div>
  );
}

export function InvoiceDetailMetadata({ invoice }: Props) {
  const { t } = useTranslation();

  const documentDate = invoice.date.trim() !== "" ? invoice.date : t("history.noDocumentDate");
  const savedDate = new Date(invoice.createdAt).toLocaleString();
  const buyer = invoice.buyerSnapshot.companyName || t("history.noBuyer");
  const seller = invoice.sellerCompanyName || "—";
  const refNo = invoice.refNo || "—";
  const orderNo = invoice.orderNo || "—";
  const total = `${invoice.currency} ${invoice.totalAmount.toFixed(2)}`;

  return (
    <section className="bg-card/80 backdrop-blur border border-border rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
        <Info className="size-5 shrink-0" aria-hidden />
        {t("history.documentMetadata")}
      </h3>
      <div className="space-y-0">
        <MetadataRow label={t("history.savedDate")} value={savedDate} />
        <MetadataRow label={t("history.documentDate")} value={documentDate} />
        <MetadataRow label={t("history.buyer")} value={buyer} />
        <MetadataRow label={t("history.seller")} value={seller} />
        <MetadataRow label={t("form.refNo")} value={refNo} />
        <MetadataRow label={t("form.orderNo")} value={orderNo} />
        <MetadataRow label={t("form.currency")} value={invoice.currency} />
        <MetadataRow label={t("history.totalAmount")} value={total} />
      </div>
    </section>
  );
}

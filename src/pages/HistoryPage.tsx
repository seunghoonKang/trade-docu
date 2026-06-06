import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/app/providers/AuthProvider";
import { deleteInvoice, listInvoices, toInvoiceFormData } from "@/features/invoice-crud";
import { HistoryPageSkeleton, HistorySummaryCards } from "@/features/history";
import { InvoiceHistoryList } from "@/widgets/InvoiceHistory";
import { ExportToolbar } from "@/widgets/ExportToolbar";
import { ConfirmDialog, Layout } from "@/shared/ui";
import type { Invoice } from "@/entities/invoice/model";

const RECENT_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

type ConfirmAction = { type: "load" | "delete"; invoice: Invoice };

function countRecentlySaved(invoices: Invoice[]): number {
  const cutoff = Date.now() - RECENT_DAYS_MS;
  return invoices.filter((inv) => new Date(inv.createdAt).getTime() >= cutoff).length;
}

export function HistoryPage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [fetching, setFetching] = useState(true);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  useEffect(() => {
    if (!user) {
      setInvoices([]);
      setFetching(false);
      return;
    }
    setFetching(true);
    listInvoices(user.id)
      .then(setInvoices)
      .finally(() => setFetching(false));
  }, [user]);

  const recentCount = useMemo(() => countRecentlySaved(invoices), [invoices]);

  async function handleDelete(id: string) {
    await deleteInvoice(id);
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    toast.success(t("history.deleted"));
  }

  function handleLoad(inv: Invoice) {
    const formData = toInvoiceFormData(inv);
    navigate("/", { state: { restoreInvoice: formData } });
  }

  function handleConfirm() {
    if (!confirmAction) return;
    const { type, invoice } = confirmAction;
    setConfirmAction(null);
    if (type === "load") {
      handleLoad(invoice);
    } else {
      void handleDelete(invoice.id);
    }
  }

  if (!loading && !user) return <Navigate to="/login" replace />;

  const isLoading = loading || fetching;
  const confirmInvoiceNo = confirmAction?.invoice.invoiceNo || t("history.noNumber");

  return (
    <Layout toolbar={<ExportToolbar page="history" />}>
      <div className="max-w-6xl mx-auto px-4 py-6 md:p-8 space-y-6 md:space-y-8 pb-8">
        {isLoading ? (
          <HistoryPageSkeleton />
        ) : (
          <>
            <HistorySummaryCards totalCount={invoices.length} recentCount={recentCount} />

            <InvoiceHistoryList
              invoices={invoices}
              onLoadRequest={(invoice) => setConfirmAction({ type: "load", invoice })}
              onDeleteRequest={(invoice) => setConfirmAction({ type: "delete", invoice })}
            />
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmAction?.type === "load"}
        title={t("history.confirmLoadTitle")}
        description={t("history.confirmLoadDescription", { id: confirmInvoiceNo })}
        confirmLabel={t("history.load")}
        cancelLabel={t("history.cancel")}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        open={confirmAction?.type === "delete"}
        title={t("history.confirmDeleteTitle")}
        description={t("history.confirmDeleteDescription", { id: confirmInvoiceNo })}
        confirmLabel={t("history.delete")}
        cancelLabel={t("history.cancel")}
        destructive
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </Layout>
  );
}

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/entities/session";
import { generateExcel } from "@/features/export-excel";
import { generatePdf } from "@/features/export-pdf";
import {
  InvoiceDetailHeader,
  InvoiceDetailMetadata,
  InvoiceDetailSkeleton,
} from "@/features/history";
import { clearHistoryFocusInvoiceId } from "@/features/history";
import type { HistoryDetailLocationState } from "@/features/history";
import {
  deleteInvoice,
  getInvoice,
  toInvoiceFormData,
} from "@/features/invoice-crud";
import { triggerPrint } from "@/features/print";
import { validateInvoice } from "@/entities/invoice";
import type { Invoice } from "@/entities/invoice";
import { InvoicePreviewPanel } from "@/widgets/InvoicePreview";
import { ExportToolbar } from "@/widgets/ExportToolbar";
import { Button, ConfirmDialog, Layout } from "@/shared/ui";

type ConfirmAction = "load" | "delete";

export function InvoiceDetailPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const locationState = location.state as HistoryDetailLocationState | null;
  const stateInvoice = locationState?.invoice as Invoice | undefined;
  const historySearch = locationState?.historySearch ?? "";

  function goBackToHistory(focusInvoiceId?: string) {
    navigate(
      { pathname: "/history", search: historySearch },
      focusInvoiceId ? { state: { focusInvoiceId } } : undefined,
    );
  }

  const [invoice, setInvoice] = useState<Invoice | null>(stateInvoice ?? null);
  const [fetching, setFetching] = useState(!stateInvoice);
  const [notFound, setNotFound] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [invoiceId]);

  useEffect(() => {
    if (!invoiceId || stateInvoice) return;

    setFetching(true);
    setNotFound(false);
    getInvoice(invoiceId)
      .then((result) => {
        if (!result) {
          setNotFound(true);
          setInvoice(null);
          return;
        }
        setInvoice(result);
      })
      .finally(() => setFetching(false));
  }, [invoiceId, stateInvoice]);

  const formData = useMemo(
    () => (invoice ? toInvoiceFormData(invoice) : null),
    [invoice],
  );

  function passesValidation(): boolean {
    if (!formData) return false;
    const { blocking, warnings } = validateInvoice(formData);
    if (blocking.length > 0) {
      toast.error(
        `${t("validation.blockedTitle")}: ${blocking.map((k) => t(`validation.${k}`)).join(", ")}`,
      );
      return false;
    }
    if (warnings.length > 0) {
      toast.warning(warnings.map((k) => t(`validation.${k}`)).join(", "));
    }
    return true;
  }

  async function handlePdf() {
    if (!formData || !passesValidation()) return;
    try {
      await generatePdf(formData);
    } catch {
      toast.error(t("export.pdfFailed"));
    }
  }

  function handleExcel() {
    if (formData && passesValidation()) generateExcel(formData);
  }

  function handlePrint() {
    if (passesValidation()) triggerPrint();
  }

  function handleLoad() {
    if (!invoice) return;
    navigate("/new", { state: { restoreInvoice: toInvoiceFormData(invoice) } });
  }

  async function handleDelete() {
    if (!invoice) return;
    await deleteInvoice(invoice.id);
    toast.success(t("history.deleted"));
    clearHistoryFocusInvoiceId();
    goBackToHistory();
  }

  function handleConfirm() {
    if (!confirmAction) return;
    const action = confirmAction;
    setConfirmAction(null);
    if (action === "load") {
      handleLoad();
    } else {
      void handleDelete();
    }
  }

  if (!authLoading && !user) return <Navigate to="/login" replace />;

  const isLoading = authLoading || fetching;
  const confirmInvoiceNo = invoice?.invoiceNo || t("history.noNumber");

  return (
    <Layout showSidebar={Boolean(user)} toolbar={<ExportToolbar page="historyDetail" />}>
      <div className="max-w-6xl mx-auto px-4 py-6 md:p-8 space-y-6 md:space-y-8 pb-8">
        {isLoading ? (
          <InvoiceDetailSkeleton />
        ) : notFound || !invoice || !formData ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <p className="text-muted-foreground">{t("history.detailNotFound")}</p>
            <Button variant="outline" className="gap-1.5" onClick={() => goBackToHistory()}>
              <ArrowLeft className="size-4" aria-hidden />
              {t("history.backToList")}
            </Button>
          </div>
        ) : (
          <>
            <InvoiceDetailHeader
              invoice={invoice}
              onBack={() => goBackToHistory(invoice.id)}
              onPdf={() => void handlePdf()}
              onExcel={handleExcel}
              onPrint={handlePrint}
              onLoad={() => setConfirmAction("load")}
              onDelete={() => setConfirmAction("delete")}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 min-h-[500px] rounded-xl border border-border bg-accent overflow-hidden">
                <InvoicePreviewPanel data={formData} />
              </div>
              <div className="lg:col-span-4">
                <InvoiceDetailMetadata invoice={invoice} />
              </div>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmAction === "load"}
        title={t("history.confirmLoadTitle")}
        description={t("history.confirmLoadDescription", { id: confirmInvoiceNo })}
        descriptionNote={t("history.confirmLoadNote")}
        confirmLabel={t("history.load")}
        cancelLabel={t("history.cancel")}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        open={confirmAction === "delete"}
        title={t("history.confirmDeleteTitle")}
        description={t("history.confirmDeleteDescription", { id: confirmInvoiceNo })}
        descriptionNote={t("history.confirmDeleteNote")}
        confirmLabel={t("history.delete")}
        cancelLabel={t("history.cancel")}
        destructive
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </Layout>
  );
}

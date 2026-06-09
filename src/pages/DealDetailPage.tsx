import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
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
import { deleteDeal, getDealWithPi, dealToForm } from "@/features/deal-crud";
import type { DealWithPi } from "@/features/deal-crud";
import { triggerPrint } from "@/features/print";
import { validateInvoice } from "@/entities/invoice";
import type { Invoice } from "@/entities/invoice";
import { InvoicePreviewPanel } from "@/widgets/InvoicePreview";
import { ExportToolbar } from "@/widgets/ExportToolbar";
import { Button, ConfirmDialog, Layout } from "@/shared/ui";

export function DealDetailPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { dealId } = useParams<{ dealId: string }>();

  const [result, setResult] = useState<DealWithPi | null>(null);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [dealId]);

  useEffect(() => {
    if (!dealId) return;
    setFetching(true);
    setNotFound(false);
    getDealWithPi(dealId)
      .then((data) => {
        if (!data) {
          setNotFound(true);
          setResult(null);
          return;
        }
        setResult(data);
      })
      .finally(() => setFetching(false));
  }, [dealId]);

  // PI 문서 snapshot으로 폼 데이터를 복원(불변). 프리뷰·내보내기·검증에 그대로 쓴다.
  const formData = useMemo(
    () => (result ? dealToForm(result.deal, result.pi) : null),
    [result],
  );

  // 상세 헤더/메타데이터는 Invoice 표시 필드만 사용 → 거래 건 식별자와 합성해 재사용.
  const invoiceView = useMemo<Invoice | null>(
    () =>
      result && formData
        ? { ...formData, id: result.deal.id, userId: result.deal.userId, createdAt: result.deal.createdAt }
        : null,
    [result, formData],
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
    if (!formData) return;
    navigate("/", { state: { restoreInvoice: formData } });
  }

  async function handleDelete() {
    if (!result) return;
    await deleteDeal(result.deal.id);
    toast.success(t("history.deleted"));
    navigate("/");
  }

  if (!authLoading && !user) return <Navigate to="/login" replace />;

  const isLoading = authLoading || fetching;

  return (
    <Layout showSidebar={Boolean(user)} toolbar={<ExportToolbar page="historyDetail" />}>
      <div className="max-w-6xl mx-auto px-4 py-6 md:p-8 space-y-6 md:space-y-8 pb-8">
        {isLoading ? (
          <InvoiceDetailSkeleton />
        ) : notFound || !invoiceView || !formData ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <p className="text-muted-foreground">{t("history.detailNotFound")}</p>
            <Button variant="outline" className="gap-1.5" onClick={() => navigate("/")}>
              <ArrowLeft className="size-4" aria-hidden />
              {t("history.backToList")}
            </Button>
          </div>
        ) : (
          <>
            <InvoiceDetailHeader
              invoice={invoiceView}
              onBack={() => navigate("/")}
              onPdf={() => void handlePdf()}
              onExcel={handleExcel}
              onPrint={handlePrint}
              onLoad={handleLoad}
              onDelete={() => setConfirmDelete(true)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 min-h-[500px] rounded-xl border border-border bg-accent overflow-hidden">
                <InvoicePreviewPanel data={formData} />
              </div>
              <div className="lg:col-span-4">
                <InvoiceDetailMetadata invoice={invoiceView} />
              </div>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={t("history.confirmDeleteTitle")}
        description={t("history.confirmDeleteDescription", {
          id: invoiceView?.invoiceNo || t("history.noNumber"),
        })}
        descriptionNote={t("history.confirmDeleteNote")}
        confirmLabel={t("history.delete")}
        cancelLabel={t("history.cancel")}
        destructive
        onConfirm={() => {
          setConfirmDelete(false);
          void handleDelete();
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </Layout>
  );
}

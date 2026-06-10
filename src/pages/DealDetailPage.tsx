import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ArrowLeft, FileText, FolderInput, Printer, Trash2 } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/entities/session";
import { generatePdf } from "@/features/export-pdf";
import { InvoiceDetailSkeleton } from "@/features/history";
import {
  deleteDeal,
  dealToForm,
  ensureDefaultShipment,
  getDealBundle,
  issueDocument,
} from "@/features/deal-crud";
import type { DealBundle } from "@/features/deal-crud";
import { triggerPrint } from "@/features/print";
import { validateInvoice } from "@/entities/invoice";
import type { DocType } from "@/entities/document";
import { InvoicePreviewPanel } from "@/widgets/InvoicePreview";
import { ExportToolbar } from "@/widgets/ExportToolbar";
import { Button, ConfirmDialog, Layout } from "@/shared/ui";

const TEMPLATES: DocType[] = ["PI", "CI", "PL"];

export function DealDetailPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { dealId } = useParams<{ dealId: string }>();

  const [bundle, setBundle] = useState<DealBundle | null>(null);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [variant, setVariant] = useState<DocType>("PI");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [issuing, setIssuing] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [dealId]);

  const loadBundle = useCallback(async () => {
    if (!dealId) return;
    setFetching(true);
    setNotFound(false);
    try {
      const data = await getDealBundle(dealId);
      if (!data) {
        setNotFound(true);
        setBundle(null);
      } else {
        setBundle(data);
      }
    } finally {
      setFetching(false);
    }
  }, [dealId]);

  useEffect(() => {
    void loadBundle();
  }, [loadBundle]);

  // PI 문서 snapshot으로 폼 데이터를 복원(불변). 같은 데이터를 PI/CI/PL 양식으로 렌더한다.
  const pi = useMemo(
    () => bundle?.documents.find((d) => d.docType === "PI") ?? null,
    [bundle],
  );
  const formData = useMemo(
    () => (bundle ? dealToForm(bundle.deal, pi) : null),
    [bundle, pi],
  );
  const issuedTypes = useMemo(
    () => new Set(bundle?.documents.map((d) => d.docType) ?? []),
    [bundle],
  );
  // 단일 선적이면 선적 선택 UI를 숨기고 PI + CI/PL을 평평하게 보인다(CONTEXT.md).
  const isSingleShipment = (bundle?.shipments.length ?? 0) <= 1;

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
      await generatePdf(formData, variant);
    } catch {
      toast.error(t("export.pdfFailed"));
    }
  }

  function handlePrint() {
    if (passesValidation()) triggerPrint();
  }

  async function handleIssue() {
    if (!user || !bundle || !formData || variant === "PI") return;
    setIssuing(true);
    try {
      const shipmentId = await ensureDefaultShipment(user.id, bundle.deal, bundle.shipments);
      await issueDocument(user.id, {
        dealId: bundle.deal.id,
        shipmentId,
        docType: variant,
        docNo: formData.invoiceNo,
        docDate: formData.date,
        snapshot: formData as unknown as Record<string, unknown>,
      });
      toast.success(t("history.saved"));
      await loadBundle();
    } finally {
      setIssuing(false);
    }
  }

  async function handleDelete() {
    if (!bundle) return;
    await deleteDeal(bundle.deal.id);
    toast.success(t("history.deleted"));
    navigate("/");
  }

  if (!authLoading && !user) return <Navigate to="/login" replace />;

  const isLoading = authLoading || fetching;
  const dealTitle = formData?.buyerSnapshot.companyName || formData?.invoiceNo || t("history.noNumber");

  return (
    <Layout showSidebar={Boolean(user)} toolbar={<ExportToolbar page="historyDetail" />}>
      <div className="max-w-6xl mx-auto px-4 py-6 md:p-8 space-y-6 md:space-y-8 pb-8">
        {isLoading ? (
          <InvoiceDetailSkeleton />
        ) : notFound || !bundle || !formData ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <p className="text-muted-foreground">{t("history.detailNotFound")}</p>
            <Button variant="outline" className="gap-1.5" onClick={() => navigate("/")}>
              <ArrowLeft className="size-4" aria-hidden />
              {t("history.backToList")}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="-ml-2.5 gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" aria-hidden />
                {t("history.backToList")}
              </Button>

              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("deal.documents")}
                  </p>
                  <h1 className="text-2xl md:text-3xl font-bold text-primary truncate">{dealTitle}</h1>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1.5 shrink-0"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="size-4" aria-hidden />
                  {t("history.delete")}
                </Button>
              </div>
            </div>

            {/* 양식 탭 — 같은 거래 데이터를 PI/CI/PL로 전환. 단일 선적이라 선적 선택 UI는 숨김. */}
            <div className="flex items-center gap-1 border-b border-border">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl}
                  type="button"
                  onClick={() => setVariant(tpl)}
                  className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
                    variant === tpl
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tpl}
                  {issuedTypes.has(tpl) && <span className="ml-1.5 text-green-600">✓</span>}
                </button>
              ))}
              {!isSingleShipment && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {bundle.shipments.length} shipments
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => void handlePdf()}>
                <FileText className="size-4" aria-hidden />
                {t("export.pdf")}
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePrint}>
                <Printer className="size-4" aria-hidden />
                {t("export.print")}
              </Button>
              {variant !== "PI" && !issuedTypes.has(variant) && (
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1.5"
                  disabled={issuing}
                  onClick={() => void handleIssue()}
                >
                  <FolderInput className="size-4" aria-hidden />
                  {t("deal.issue")} {variant}
                </Button>
              )}
              {variant !== "PI" && issuedTypes.has(variant) && (
                <span className="text-sm text-green-600">{t("deal.issued")}</span>
              )}
            </div>

            <div className="min-h-[500px] rounded-xl border border-border bg-accent overflow-hidden">
              <InvoicePreviewPanel data={formData} variant={variant} />
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={t("history.confirmDeleteTitle")}
        description={t("history.confirmDeleteDescription", {
          id: formData?.invoiceNo || t("history.noNumber"),
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

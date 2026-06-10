import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ArrowLeft, FileText, Printer } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/entities/session";
import { generatePdf } from "@/features/export-pdf";
import { InvoiceDetailSkeleton } from "@/features/history";
import { documentPreviewData, getDealBundle } from "@/features/deal-crud";
import type { DealBundle } from "@/features/deal-crud";
import { triggerPrint } from "@/features/print";
import { InvoicePreviewPanel } from "@/widgets/InvoicePreview";
import { ExportToolbar } from "@/widgets/ExportToolbar";
import { Button, Layout } from "@/shared/ui";

/**
 * 발행 문서 보기 — 조회 전용(상세/발행 분리). 발행 시점 박제 snapshot을 그대로 렌더하고
 * PDF/인쇄만 제공한다(수정·재발행 없음 — 문서는 불변).
 */
export function DealDocumentPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { dealId, docId } = useParams<{ dealId: string; docId: string }>();

  const [bundle, setBundle] = useState<DealBundle | null>(null);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [dealId, docId]);

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

  const doc = useMemo(() => bundle?.documents.find((d) => d.id === docId) ?? null, [bundle, docId]);
  const preview = useMemo(() => (doc ? documentPreviewData(doc) : null), [doc]);
  const shipmentSeq = useMemo(
    () => bundle?.shipments.find((s) => s.id === doc?.shipmentId)?.seq ?? null,
    [bundle, doc],
  );

  async function handlePdf() {
    if (!preview || !doc) return;
    try {
      await generatePdf(preview.form, doc.docType);
    } catch {
      toast.error(t("export.pdfFailed"));
    }
  }

  if (!authLoading && !user) return <Navigate to="/login" replace />;

  const isLoading = authLoading || fetching;
  const missing = notFound || !bundle || !doc || !preview;

  return (
    <Layout showSidebar={Boolean(user)} toolbar={<ExportToolbar page="historyDetail" />}>
      <div className="max-w-6xl mx-auto px-4 py-6 md:p-8 space-y-6 pb-8">
        {isLoading ? (
          <InvoiceDetailSkeleton />
        ) : missing ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <p className="text-muted-foreground">{t("history.detailNotFound")}</p>
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={() => navigate(dealId ? `/deals/${dealId}` : "/history")}
            >
              <ArrowLeft className="size-4" aria-hidden />
              {t("deal.backToDeal")}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/deals/${bundle.deal.id}`)}
                className="-ml-2.5 gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" aria-hidden />
                {t("deal.backToDeal")}
              </Button>

              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {doc.docType}
                    {shipmentSeq != null && ` · ${t("deal.shipment")} ${shipmentSeq}`}
                    {doc.docDate && ` · ${doc.docDate}`}
                  </p>
                  <h1 className="text-2xl md:text-3xl font-bold text-primary truncate">
                    {doc.docNo || t("history.noNumber")}
                  </h1>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => void handlePdf()}>
                    <FileText className="size-4" aria-hidden />
                    {t("export.pdf")}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={triggerPrint}>
                    <Printer className="size-4" aria-hidden />
                    {t("export.print")}
                  </Button>
                </div>
              </div>
            </div>

            <div className="min-h-[500px] rounded-xl border border-border bg-accent overflow-hidden">
              <InvoicePreviewPanel
                data={preview.form}
                variant={doc.docType}
                packingLines={preview.packingLines}
                showPrice={preview.showPrice}
              />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

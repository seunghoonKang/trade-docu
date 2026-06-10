import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ArrowLeft, FileText, Info, Printer } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/entities/session";
import { generatePdf } from "@/features/export-pdf";
import { documentPreviewData, getDealBundle } from "@/features/deal-crud";
import type { DealBundle } from "@/features/deal-crud";
import { triggerPrint } from "@/features/print";
import { InvoicePreviewPanel } from "@/widgets/InvoicePreview";
import { ExportToolbar } from "@/widgets/ExportToolbar";
import { Button, Layout, Skeleton } from "@/shared/ui";

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
          <DealDocumentSkeleton />
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

            {/* 기존 인보이스 상세와 같은 구도: 미리보기(좌) + 문서 정보 패널(우). */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 min-h-[500px] rounded-xl border border-border bg-accent overflow-hidden">
                <InvoicePreviewPanel
                  data={preview.form}
                  variant={doc.docType}
                  packingLines={preview.packingLines}
                  showPrice={preview.showPrice}
                />
              </div>
              <div className="lg:col-span-4">
                <section className="bg-card/80 backdrop-blur border border-border rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                    <Info className="size-5 shrink-0" aria-hidden />
                    {t("history.documentMetadata")}
                  </h3>
                  <div className="space-y-0">
                    <MetadataRow label={t("history.type")} value={doc.docType} />
                    <MetadataRow
                      label={t("history.documentDate")}
                      value={doc.docDate || t("history.noDocumentDate")}
                    />
                    <MetadataRow
                      label={t("history.savedDate")}
                      value={new Date(doc.createdAt).toLocaleString()}
                    />
                    {shipmentSeq != null && (
                      <MetadataRow label={t("deal.shipment")} value={String(shipmentSeq)} />
                    )}
                    <MetadataRow
                      label={t("history.buyer")}
                      value={preview.form.buyerSnapshot.companyName || t("history.noBuyer")}
                    />
                    <MetadataRow
                      label={t("history.seller")}
                      value={preview.form.sellerCompanyName || "—"}
                    />
                    <MetadataRow label={t("form.currency")} value={preview.form.currency} />
                    {(doc.docType !== "PL" || preview.showPrice) && (
                      <MetadataRow
                        label={t("history.totalAmount")}
                        value={`${preview.form.currency} ${preview.form.totalAmount.toFixed(2)}`}
                      />
                    )}
                  </div>
                </section>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-border last:border-b-0">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-semibold text-primary text-right">{value}</span>
    </div>
  );
}

/** 문서 보기 레이아웃에 맞춘 스켈레톤(헤더 + 미리보기/메타 8:4 그리드). */
function DealDocumentSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-64" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Skeleton className="lg:col-span-8 h-[500px] rounded-xl" />
        <Skeleton className="lg:col-span-4 h-80 rounded-xl" />
      </div>
    </div>
  );
}

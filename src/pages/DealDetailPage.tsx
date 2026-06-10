import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, FolderInput, Trash2 } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/entities/session";
import {
  computeBalance,
  dealToForm,
  deleteDeal,
  getDealBundle,
  setDealStatus,
} from "@/features/deal-crud";
import type { DealBundle } from "@/features/deal-crud";
import { Coachmark } from "@/features/service-guide";
import type { DocType } from "@/entities/document";
import { ExportToolbar } from "@/widgets/ExportToolbar";
import { DealDocumentList } from "@/widgets/DealDocumentList";
import { Button, ConfirmDialog, Layout, Skeleton } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

const ISSUABLE: DocType[] = ["CI", "PL"];

/**
 * 거래 상세 — 조회 전용(상세/발행 분리). 요약·잔량 현황·발행 문서 리스트만 보여주고,
 * 발행은 /deals/:id/issue/:docType, 문서 열람은 /deals/:id/docs/:docId 로 보낸다.
 */
export function DealDetailPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { dealId } = useParams<{ dealId: string }>();

  const [bundle, setBundle] = useState<DealBundle | null>(null);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const pi = useMemo(() => bundle?.documents.find((d) => d.docType === "PI") ?? null, [bundle]);
  const dealForm = useMemo(() => (bundle ? dealToForm(bundle.deal, pi) : null), [bundle, pi]);
  const balance = useMemo(
    () => (bundle ? computeBalance(bundle.deal, bundle.shipments) : null),
    [bundle],
  );

  // 양식별 미발행 현황: 발행된 선적 수 < 전체 선적 수인 양식만(전부 발행되면 카드 숨김).
  const unissued = useMemo(() => {
    if (!bundle) return [];
    return ISSUABLE.map((docType) => ({
      docType,
      issuedShipments: new Set(
        bundle.documents.filter((d) => d.docType === docType && d.shipmentId).map((d) => d.shipmentId),
      ).size,
    })).filter(({ issuedShipments }) => issuedShipments < bundle.shipments.length);
  }, [bundle]);

  async function handleCompleteDeal() {
    if (!bundle) return;
    if (computeBalance(bundle.deal, bundle.shipments).hasRemaining) {
      toast.warning(t("deal.remainingWarning"));
    }
    await setDealStatus(bundle.deal.id, "closed");
    toast.success(t("deal.complete"));
    await loadBundle();
  }

  async function handleDelete() {
    if (!bundle) return;
    await deleteDeal(bundle.deal.id);
    toast.success(t("history.deleted"));
    navigate("/history");
  }

  if (!authLoading && !user) return <Navigate to="/login" replace />;

  const isLoading = authLoading || fetching;
  const dealTitle = dealForm?.buyerSnapshot.companyName || dealForm?.invoiceNo || t("history.noNumber");

  return (
    <Layout showSidebar={Boolean(user)} toolbar={<ExportToolbar page="historyDetail" />}>
      <div className="max-w-6xl mx-auto px-4 py-6 md:p-8 space-y-6 pb-8">
        {isLoading ? (
          <DealDetailSkeleton />
        ) : notFound || !bundle || !dealForm || !balance ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <p className="text-muted-foreground">{t("history.detailNotFound")}</p>
            <Button variant="outline" className="gap-1.5" onClick={() => navigate("/history")}>
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
                onClick={() => navigate("/history")}
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
                  <div className="flex items-center gap-3 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-primary truncate">{dealTitle}</h1>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        bundle.deal.status === "closed"
                          ? "bg-muted text-muted-foreground"
                          : "bg-green-100 text-green-700",
                      )}
                    >
                      {bundle.deal.status === "closed" ? t("deal.statusClosed") : t("deal.statusOpen")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={bundle.deal.status === "closed"}
                    onClick={() => void handleCompleteDeal()}
                  >
                    <CheckCircle2 className="size-4" aria-hidden />
                    {t("deal.complete")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    {t("history.delete")}
                  </Button>
                </div>
              </div>
            </div>

            {/* 선적/잔량 현황 — 읽기 전용. 편집은 발행 플로우에서. */}
            <div className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  {t("history.shipments")} {bundle.shipments.length} · {t("deal.remaining")}
                </h3>
                {balance.hasOver && (
                  <span className="text-xs text-red-600">{t("deal.overAllocated")}</span>
                )}
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="py-1 font-medium">{t("deal.item")}</th>
                    <th className="py-1 text-right font-medium">{t("deal.ordered")}</th>
                    <th className="py-1 text-right font-medium">{t("deal.allocated")}</th>
                    <th className="py-1 text-right font-medium">{t("deal.remaining")}</th>
                  </tr>
                </thead>
                <tbody>
                  {balance.items.map((row) => (
                    <tr key={row.itemId} className="border-t border-border/60">
                      <td className="py-1.5">{row.description || "—"}</td>
                      <td className="py-1.5 text-right tabular-nums">{row.ordered}</td>
                      <td className="py-1.5 text-right tabular-nums">{row.allocated}</td>
                      <td
                        className={cn(
                          "py-1.5 text-right font-medium tabular-nums",
                          row.over ? "text-red-600" : row.remaining > 0 ? "text-amber-600" : "text-muted-foreground",
                        )}
                      >
                        {row.remaining}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* '한 거래 = 여러 문서' 각인 — 발행 흐름 1회 안내(#28). */}
            <Coachmark id="doc-tabs" />

            {/* 발행된 문서 — 클릭하면 박제 스냅샷 보기로 이동. */}
            <DealDocumentList
              documents={bundle.documents}
              shipments={bundle.shipments}
              onOpen={(doc) => navigate(`/deals/${bundle.deal.id}/docs/${doc.id}`)}
            />

            {/* 미발행 문서 — 양식별 발행 현황 + 발행 플로우 유도. 전부 발행되면 숨김. */}
            {unissued.length > 0 && (
              <div className="rounded-lg border border-border p-4">
                <h3 className="mb-3 text-sm font-semibold">{t("deal.unissuedDocuments")}</h3>
                <ul className="divide-y divide-border/60">
                  {unissued.map(({ docType, issuedShipments }) => (
                    <li key={docType} className="flex items-center gap-3 py-2">
                      <span className="inline-flex items-center rounded border border-border px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        {docType}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {t("deal.issuedCount", {
                          issued: issuedShipments,
                          total: bundle.shipments.length,
                        })}
                      </span>
                      <Button
                        variant="default"
                        size="sm"
                        className="ml-auto gap-1.5"
                        onClick={() => navigate(`/deals/${bundle.deal.id}/issue/${docType}`)}
                      >
                        <FolderInput className="size-4" aria-hidden />
                        {t("deal.goIssue")}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={t("history.confirmDeleteDealTitle")}
        description={t("history.confirmDeleteDescription", {
          id: dealForm?.invoiceNo || t("history.noNumber"),
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

/** 조회 전용 상세 레이아웃에 맞춘 스켈레톤(헤더 + 잔량 카드 + 문서 리스트). */
function DealDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-72" />
      </div>
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  );
}

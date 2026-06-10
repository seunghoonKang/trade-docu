import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/entities/session";
import { deleteDeal, listDealSummaries } from "@/features/deal-crud";
import type { DealSummary } from "@/features/deal-crud";
import { HistoryPageSkeleton, HistorySummaryCards } from "@/features/history";
import { consumeHistoryFocusInvoiceId, setHistoryFocusInvoiceId } from "@/features/history";
import type { HistoryListLocationState } from "@/features/history";
import { DealHistoryList } from "@/widgets/DealHistory";
import { ExportToolbar } from "@/widgets/ExportToolbar";
import { ConfirmDialog, Layout } from "@/shared/ui";

const RECENT_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function countRecentlySaved(summaries: DealSummary[]): number {
  const cutoff = Date.now() - RECENT_DAYS_MS;
  return summaries.filter((s) => new Date(s.deal.createdAt).getTime() >= cutoff).length;
}

/** History — 거래 건 단위(#26). 행 클릭 → /deals/:id, 검색·페이지네이션은 URL 유지. */
export function HistoryPage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [summaries, setSummaries] = useState<DealSummary[]>([]);
  const [fetching, setFetching] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<DealSummary | null>(null);
  const [focusDealId, setFocusDealId] = useState<string | null>(null);

  useEffect(() => {
    const fromState = (location.state as HistoryListLocationState | null)?.focusInvoiceId;
    const id = fromState ?? consumeHistoryFocusInvoiceId();
    if (!id) return;

    setFocusDealId(id);

    if (fromState) {
      navigate(
        { pathname: location.pathname, search: location.search },
        { replace: true, state: null },
      );
    }
  }, [location.key, location.pathname, location.search, location.state, navigate]);

  useEffect(() => {
    if (!user) {
      setSummaries([]);
      setFetching(false);
      return;
    }
    setFetching(true);
    listDealSummaries(user.id)
      .then(setSummaries)
      .finally(() => setFetching(false));
  }, [user]);

  const recentCount = useMemo(() => countRecentlySaved(summaries), [summaries]);

  async function handleDelete(summary: DealSummary) {
    await deleteDeal(summary.deal.id);
    setSummaries((prev) => prev.filter((s) => s.deal.id !== summary.deal.id));
    toast.success(t("history.deleted"));
  }

  if (!loading && !user) return <Navigate to="/login" replace />;

  const isLoading = loading || fetching;
  const confirmDealNo = confirmDelete?.piNo || t("history.noNumber");

  return (
    <Layout showSidebar={Boolean(user)} toolbar={<ExportToolbar page="history" />}>
      <div className="max-w-6xl mx-auto px-4 py-6 md:p-8 space-y-6 md:space-y-8 pb-8">
        {isLoading ? (
          <HistoryPageSkeleton />
        ) : (
          <>
            <HistorySummaryCards totalCount={summaries.length} recentCount={recentCount} />

            <DealHistoryList
              summaries={summaries}
              focusDealId={focusDealId}
              onFocusHandled={() => setFocusDealId(null)}
              onViewRequest={(summary) => {
                setHistoryFocusInvoiceId(summary.deal.id);
                navigate(`/deals/${summary.deal.id}`);
              }}
              onDeleteRequest={setConfirmDelete}
            />
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        title={t("history.confirmDeleteDealTitle")}
        description={t("history.confirmDeleteDescription", { id: confirmDealNo })}
        descriptionNote={t("history.confirmDeleteNote")}
        confirmLabel={t("history.delete")}
        cancelLabel={t("history.cancel")}
        destructive
        onConfirm={() => {
          if (!confirmDelete) return;
          setConfirmDelete(null);
          void handleDelete(confirmDelete);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </Layout>
  );
}

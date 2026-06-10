import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { historyRowId } from "@/features/history";
import { patchHistoryListParams, readHistoryListParams } from "@/features/history";
import { matchesDealSummary } from "@/features/deal-crud";
import type { DealSummary } from "@/features/deal-crud";
import type { DocType } from "@/entities/document";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { cn } from "@/shared/lib/utils";

const PAGE_SIZE = 20;
const DOC_TYPES: DocType[] = ["PI", "CI", "PL"];

interface Props {
  summaries: DealSummary[];
  focusDealId?: string | null;
  onFocusHandled?: () => void;
  onViewRequest: (summary: DealSummary) => void;
  onDeleteRequest: (summary: DealSummary) => void;
}

function getSavedTimestamp(summary: DealSummary): number {
  return new Date(summary.deal.createdAt).getTime();
}

const iconActionClass =
  "flex items-center justify-center size-8 rounded-md text-primary hover:bg-accent transition-colors active:opacity-80";

/**
 * 거래 건 단위 History(#26): 검색(PI/PO 번호·구매자)·저장일 정렬·페이지네이션을
 * URL 쿼리(q/page/sort)로 유지한다. 행 = 거래 건 + 선적 수 + 양식별 발행 배지.
 */
export function DealHistoryList({
  summaries,
  focusDealId,
  onFocusHandled,
  onViewRequest,
  onDeleteRequest,
}: Props) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, query: urlQuery, sort: savedDateSort } = readHistoryListParams(searchParams);
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const debouncedQuery = useDebouncedValue(searchQuery, 200);

  useEffect(() => {
    setSearchQuery(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed !== urlQuery.trim()) {
      patchHistoryListParams(setSearchParams, { query: trimmed, page: 1 });
    }
  }, [debouncedQuery, urlQuery, setSearchParams]);

  const sortedSummaries = useMemo(() => {
    const filtered = summaries.filter((s) => matchesDealSummary(s, debouncedQuery));
    filtered.sort((a, b) => {
      const diff = getSavedTimestamp(a) - getSavedTimestamp(b);
      return savedDateSort === "desc" ? -diff : diff;
    });
    return filtered;
  }, [summaries, debouncedQuery, savedDateSort]);

  const totalPages = Math.max(1, Math.ceil(sortedSummaries.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      patchHistoryListParams(setSearchParams, { page: Math.max(1, totalPages) });
    }
  }, [page, totalPages, setSearchParams]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedSummaries.slice(start, start + PAGE_SIZE);
  }, [sortedSummaries, page]);

  useEffect(() => {
    if (!focusDealId) return;
    if (!pageItems.some((s) => s.deal.id === focusDealId)) return;

    const row = document.getElementById(historyRowId(focusDealId));
    if (!row) return;

    const frame = requestAnimationFrame(() => {
      row.scrollIntoView({ block: "center", behavior: "instant" });
      onFocusHandled?.();
    });
    return () => cancelAnimationFrame(frame);
  }, [focusDealId, onFocusHandled, pageItems]);

  const rangeStart = sortedSummaries.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, sortedSummaries.length);

  return (
    <section className="bg-card/80 backdrop-blur border border-border rounded-xl overflow-hidden flex flex-col">
      <div
        className="px-6 py-4 bg-muted/30 border-b border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        data-guide="history-actions"
      >
        <h4 className="text-lg font-semibold text-primary shrink-0">{t("history.dealRepository")}</h4>
        <div className="flex items-center bg-card border border-border rounded-lg px-3 h-10 w-full sm:w-80 md:w-96 shrink-0">
          <Search className="size-4 text-muted-foreground shrink-0" aria-hidden />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("history.searchPlaceholder")}
            className="min-w-0 flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm ml-2 placeholder:text-muted-foreground/60"
            aria-label={t("history.searchPlaceholder")}
          />
        </div>
      </div>

      {sortedSummaries.length === 0 ? (
        <p className="px-6 py-12 text-center text-muted-foreground">
          {debouncedQuery.trim() ? t("history.noSearchResults") : t("history.noDeals")}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground border-b border-border">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                    {t("history.dealNo")}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                    {t("history.buyer")}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                    {t("history.status")}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                    {t("history.shipments")}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                    {t("deal.documents")}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                      onClick={() =>
                        patchHistoryListParams(setSearchParams, {
                          sort: savedDateSort === "desc" ? "asc" : "desc",
                          page: 1,
                        })
                      }
                      aria-label={
                        savedDateSort === "desc"
                          ? t("history.sortSavedNewest")
                          : t("history.sortSavedOldest")
                      }
                    >
                      {t("history.savedDate")}
                      {savedDateSort === "desc" ? (
                        <ArrowDown className="size-3.5" aria-hidden />
                      ) : (
                        <ArrowUp className="size-3.5" aria-hidden />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider w-[100px]">
                    {t("history.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {pageItems.map((summary) => (
                  <tr
                    key={summary.deal.id}
                    id={historyRowId(summary.deal.id)}
                    className="hover:bg-muted/20 transition-colors group cursor-pointer"
                    onClick={() => onViewRequest(summary)}
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-primary">
                      {summary.piNo || t("history.noNumber")}
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground">
                      {summary.deal.buyerSnapshot.companyName || t("history.noBuyer")}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          summary.deal.status === "closed"
                            ? "bg-muted text-muted-foreground"
                            : "bg-green-100 text-green-700",
                        )}
                      >
                        {summary.deal.status === "closed"
                          ? t("deal.statusClosed")
                          : t("deal.statusOpen")}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground tabular-nums">
                      {summary.shipmentCount}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex gap-1.5">
                        {DOC_TYPES.map((docType) => {
                          const count = summary.issuedCount[docType];
                          return (
                            <span
                              key={docType}
                              className={cn(
                                "inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-semibold",
                                count > 0
                                  ? "border-primary/30 bg-accent text-primary"
                                  : "border-border text-muted-foreground/50",
                              )}
                            >
                              {docType}
                              {count > 1 && <span className="ml-0.5">×{count}</span>}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(summary.deal.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div
                        className="flex gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className={iconActionClass}
                          title={t("history.view")}
                          aria-label={t("history.view")}
                          onClick={() => onViewRequest(summary)}
                        >
                          <Eye className="size-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          className={cn(iconActionClass, "hover:text-destructive hover:bg-destructive/10")}
                          title={t("history.delete")}
                          aria-label={t("history.delete")}
                          onClick={() => onDeleteRequest(summary)}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedSummaries.length > PAGE_SIZE && (
            <div className="px-6 py-4 bg-muted/20 border-t border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {t("history.paginationRange", {
                  from: rangeStart,
                  to: rangeEnd,
                  total: sortedSummaries.length,
                })}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="size-8 flex items-center justify-center border border-border rounded hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  onClick={() => patchHistoryListParams(setSearchParams, { page: page - 1 })}
                  disabled={page <= 1}
                  aria-label={t("history.previousPage")}
                >
                  <ChevronLeft className="size-4" aria-hidden />
                </button>
                {totalPages <= 7 ? (
                  Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      className={cn(
                        "size-8 flex items-center justify-center border rounded text-xs font-semibold transition-colors",
                        pageNum === page
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted text-muted-foreground",
                      )}
                      onClick={() => patchHistoryListParams(setSearchParams, { page: pageNum })}
                      aria-current={pageNum === page ? "page" : undefined}
                    >
                      {pageNum}
                    </button>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground px-2 min-w-[5rem] text-center">
                    {t("history.pageOf", { page, total: totalPages })}
                  </span>
                )}
                <button
                  type="button"
                  className="size-8 flex items-center justify-center border border-border rounded hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  onClick={() => patchHistoryListParams(setSearchParams, { page: page + 1 })}
                  disabled={page >= totalPages}
                  aria-label={t("history.nextPage")}
                >
                  <ChevronRight className="size-4" aria-hidden />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

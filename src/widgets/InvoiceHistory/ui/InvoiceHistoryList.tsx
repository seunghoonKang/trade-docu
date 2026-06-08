import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  FolderInput,
  Search,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { historyRowId } from "@/features/history";
import {
  patchHistoryListParams,
  readHistoryListParams,
} from "@/features/history";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { cn } from "@/shared/lib/utils";
import type { Invoice } from "@/entities/invoice";

const PAGE_SIZE = 20;

interface Props {
  invoices: Invoice[];
  focusInvoiceId?: string | null;
  onFocusHandled?: () => void;
  onViewRequest: (invoice: Invoice) => void;
  onLoadRequest: (invoice: Invoice) => void;
  onDeleteRequest: (invoice: Invoice) => void;
}

function formatDocumentDate(invoice: Invoice): string | null {
  return invoice.date.trim() !== "" ? invoice.date : null;
}

function formatSavedDate(invoice: Invoice): string {
  return new Date(invoice.createdAt).toLocaleDateString();
}

function getSavedTimestamp(invoice: Invoice): number {
  return new Date(invoice.createdAt).getTime();
}

function matchesSearch(invoice: Invoice, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    invoice.invoiceNo.toLowerCase().includes(q) ||
    invoice.refNo.toLowerCase().includes(q) ||
    invoice.buyerSnapshot.companyName.toLowerCase().includes(q)
  );
}

const iconActionClass =
  "flex items-center justify-center size-8 rounded-md text-primary hover:bg-accent transition-colors active:opacity-80";

export function InvoiceHistoryList({
  invoices,
  focusInvoiceId,
  onFocusHandled,
  onViewRequest,
  onLoadRequest,
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

  const filteredInvoices = useMemo(
    () => invoices.filter((inv) => matchesSearch(inv, debouncedQuery)),
    [invoices, debouncedQuery],
  );

  const sortedInvoices = useMemo(() => {
    const sorted = [...filteredInvoices];
    sorted.sort((a, b) => {
      const diff = getSavedTimestamp(a) - getSavedTimestamp(b);
      return savedDateSort === "desc" ? -diff : diff;
    });
    return sorted;
  }, [filteredInvoices, savedDateSort]);

  const totalPages = Math.max(1, Math.ceil(sortedInvoices.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      patchHistoryListParams(setSearchParams, { page: Math.max(1, totalPages) });
    }
  }, [page, totalPages, setSearchParams]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedInvoices.slice(start, start + PAGE_SIZE);
  }, [sortedInvoices, page]);

  useEffect(() => {
    if (!focusInvoiceId) return;
    if (!pageItems.some((inv) => inv.id === focusInvoiceId)) return;

    const row = document.getElementById(historyRowId(focusInvoiceId));
    if (!row) return;

    const frame = requestAnimationFrame(() => {
      row.scrollIntoView({ block: "center", behavior: "instant" });
      onFocusHandled?.();
    });
    return () => cancelAnimationFrame(frame);
  }, [focusInvoiceId, onFocusHandled, pageItems]);

  const rangeStart = sortedInvoices.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, sortedInvoices.length);

  return (
    <section className="bg-card/80 backdrop-blur border border-border rounded-xl overflow-hidden flex flex-col">
      <div
        className="px-6 py-4 bg-muted/30 border-b border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        data-guide="history-actions"
      >
        <h4 className="text-lg font-semibold text-primary shrink-0">{t("history.documentRepository")}</h4>
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

      {sortedInvoices.length === 0 ? (
        <p className="px-6 py-12 text-center text-muted-foreground">
          {debouncedQuery.trim() ? t("history.noSearchResults") : t("history.noInvoices")}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground border-b border-border">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                    {t("history.documentId")}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                    {t("history.type")}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                    {t("history.documentDate")}
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
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                    {t("history.buyer")}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider w-[120px]">
                    {t("history.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {pageItems.map((inv) => (
                  <tr
                    key={inv.id}
                    id={historyRowId(inv.id)}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-primary">
                      {inv.invoiceNo || t("history.noNumber")}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground whitespace-nowrap">
                      {t("history.proformaInvoice")}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground whitespace-nowrap">
                      {formatDocumentDate(inv) ?? t("history.noDocumentDate")}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground whitespace-nowrap">
                      {formatSavedDate(inv)}
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground">
                      {inv.buyerSnapshot.companyName || t("history.noBuyer")}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          className={iconActionClass}
                          title={t("history.view")}
                          aria-label={t("history.view")}
                          onClick={() => onViewRequest(inv)}
                        >
                          <Eye className="size-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          className={iconActionClass}
                          title={t("history.load")}
                          aria-label={t("history.load")}
                          onClick={() => onLoadRequest(inv)}
                        >
                          <FolderInput className="size-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          className={cn(iconActionClass, "hover:text-destructive hover:bg-destructive/10")}
                          title={t("history.delete")}
                          aria-label={t("history.delete")}
                          onClick={() => onDeleteRequest(inv)}
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

          {sortedInvoices.length > PAGE_SIZE && (
            <div className="px-6 py-4 bg-muted/20 border-t border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {t("history.paginationRange", {
                  from: rangeStart,
                  to: rangeEnd,
                  total: sortedInvoices.length,
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

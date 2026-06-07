import type { SetURLSearchParams } from "react-router-dom";

export type SavedDateSort = "desc" | "asc";

const PAGE_KEY = "page";
const QUERY_KEY = "q";
const SORT_KEY = "sort";

export function parseHistoryPage(value: string | null): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

export function parseHistorySort(value: string | null): SavedDateSort {
  return value === "asc" ? "asc" : "desc";
}

export function readHistoryListParams(searchParams: URLSearchParams) {
  return {
    page: parseHistoryPage(searchParams.get(PAGE_KEY)),
    query: searchParams.get(QUERY_KEY) ?? "",
    sort: parseHistorySort(searchParams.get(SORT_KEY)),
  };
}

export function patchHistoryListParams(
  setSearchParams: SetURLSearchParams,
  updates: Partial<{ page: number; query: string; sort: SavedDateSort }>,
) {
  setSearchParams(
    (prev) => {
      const next = new URLSearchParams(prev);
      if (updates.page !== undefined) {
        if (updates.page <= 1) next.delete(PAGE_KEY);
        else next.set(PAGE_KEY, String(updates.page));
      }
      if (updates.query !== undefined) {
        if (!updates.query) next.delete(QUERY_KEY);
        else next.set(QUERY_KEY, updates.query);
      }
      if (updates.sort !== undefined) {
        if (updates.sort === "desc") next.delete(SORT_KEY);
        else next.set(SORT_KEY, updates.sort);
      }
      return next;
    },
    { replace: true },
  );
}

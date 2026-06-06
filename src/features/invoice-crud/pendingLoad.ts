import type { Invoice } from "@/entities/invoice/model";

type PendingLoad = Omit<Invoice, "id" | "userId" | "createdAt">;

const KEY = "pi-pending-load-v1";

export function peekPendingInvoiceLoad(): boolean {
  return sessionStorage.getItem(KEY) !== null;
}

export function setPendingInvoiceLoad(data: PendingLoad): void {
  sessionStorage.setItem(KEY, JSON.stringify(data));
}

export function clearPendingInvoiceLoad(): void {
  sessionStorage.removeItem(KEY);
}

export function consumePendingInvoiceLoad(): PendingLoad | null {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  sessionStorage.removeItem(KEY);
  try {
    return JSON.parse(raw) as PendingLoad;
  } catch {
    return null;
  }
}

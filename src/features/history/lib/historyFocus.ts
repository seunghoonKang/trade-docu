const STORAGE_KEY = "history:focusInvoiceId";

export function setHistoryFocusInvoiceId(id: string) {
  sessionStorage.setItem(STORAGE_KEY, id);
}

export function consumeHistoryFocusInvoiceId(): string | null {
  const id = sessionStorage.getItem(STORAGE_KEY);
  if (id) sessionStorage.removeItem(STORAGE_KEY);
  return id;
}

export function clearHistoryFocusInvoiceId() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function historyRowId(invoiceId: string) {
  return `history-row-${invoiceId}`;
}

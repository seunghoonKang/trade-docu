import type { Invoice } from "@/entities/invoice/model";

export type InvoiceDraft = Omit<Invoice, "id" | "userId" | "createdAt">;

const DRAFT_KEY = "pi-draft-v1";

// A draft counts as "empty" when it holds no user-entered content. Seller and
// bank fields are ignored on purpose: they are auto-filled from the saved
// profile, so a profile-only form should not trigger a restore prompt.
export function isEmptyDraft(form: InvoiceDraft): boolean {
  const docFields = [
    form.invoiceNo,
    form.refNo,
    form.orderNo,
    form.validity,
    form.commodity,
    form.paymentTerms,
    form.delivery,
    form.packing,
    form.remarks,
    form.buyerSnapshot.companyName,
    form.buyerSnapshot.address,
    form.buyerSnapshot.tel,
    form.buyerSnapshot.contactPerson,
  ];
  if (docFields.some((v) => v.trim() !== "")) return false;

  const hasItemContent = form.items.some(
    (item) => item.description.trim() !== "" || item.qty !== 0 || item.unitPrice !== 0,
  );
  if (hasItemContent) return false;

  if (form.additionalCharges.length > 0) return false;

  return true;
}

export function saveDraft(form: InvoiceDraft): void {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
}

export function loadDraft(): InvoiceDraft | null {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as InvoiceDraft;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}

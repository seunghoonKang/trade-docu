import type { Invoice } from "./model";

export type InvoiceDraft = Omit<Invoice, "id" | "userId" | "createdAt">;

type StoredDraft = {
  ownerId: string | null;
  form: InvoiceDraft;
};

const DRAFT_KEY = "pi-draft-v1";

function normalizeOwnerId(ownerId?: string | null): string | null {
  return ownerId ?? null;
}

function readStoredDraft(): StoredDraft | null {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredDraft | InvoiceDraft;
    if (parsed && typeof parsed === "object" && "form" in parsed && "ownerId" in parsed) {
      return parsed as StoredDraft;
    }
    return { ownerId: null, form: parsed as InvoiceDraft };
  } catch {
    return null;
  }
}

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

export function saveDraft(form: InvoiceDraft, ownerId?: string | null): void {
  const payload: StoredDraft = {
    ownerId: normalizeOwnerId(ownerId),
    form,
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
}

export function loadDraft(ownerId?: string | null): InvoiceDraft | null {
  const stored = readStoredDraft();
  if (!stored) return null;
  if (stored.ownerId !== normalizeOwnerId(ownerId)) return null;
  return stored.form;
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}

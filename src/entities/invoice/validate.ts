import type { Invoice } from "./model";

type InvoiceDraft = Omit<Invoice, "id" | "userId" | "createdAt">;

export interface ValidationResult {
  blocking: string[];
  warnings: string[];
}

export function validateInvoice(form: InvoiceDraft): ValidationResult {
  const blocking: string[] = [];
  const warnings: string[] = [];

  if (!form.invoiceNo.trim()) blocking.push("invoiceNo");
  if (!form.buyerSnapshot.companyName.trim()) blocking.push("buyerCompanyName");

  const hasValidItem = form.items.some(
    (item) => item.description.trim() && item.qty > 0 && item.unitPrice > 0,
  );
  if (!hasValidItem) blocking.push("items");

  const hasBankInfo = form.bankInfo.bankName.trim() || form.bankInfo.accountNo.trim();
  if (!hasBankInfo) warnings.push("bankInfo");

  return { blocking, warnings };
}

import type { InvoiceItem, AdditionalCharge } from "./model";

export function calcItemAmount(qty: number, unitPrice: number): number {
  return Math.round(qty * unitPrice * 100) / 100;
}

export function calcSubtotal(items: InvoiceItem[]): number {
  return Math.round(items.reduce((sum, item) => sum + item.amount, 0) * 100) / 100;
}

export function calcAdditionalChargesTotal(charges: AdditionalCharge[]): number {
  return Math.round(charges.reduce((sum, c) => sum + c.amount, 0) * 100) / 100;
}

export function calcTotalAmount(
  items: InvoiceItem[],
  charges: AdditionalCharge[]
): number {
  return Math.round((calcSubtotal(items) + calcAdditionalChargesTotal(charges)) * 100) / 100;
}

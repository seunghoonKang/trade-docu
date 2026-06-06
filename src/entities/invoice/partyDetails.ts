import type { BuyerSnapshot } from "./model";
import { INVOICE_DOCUMENT_LABELS as L } from "./documentLabels";

interface SellerSnapshot {
  companyName: string;
  address: string;
  tel: string;
  fax: string;
  representative: string;
}

export function buildBuyerDetailLines(buyer: BuyerSnapshot): string[] {
  const lines: string[] = [];
  if (buyer.address) lines.push(buyer.address);
  if (buyer.contactPerson) lines.push(`${L.attn}: ${buyer.contactPerson}`);
  if (buyer.tel) lines.push(`${L.tel}: ${buyer.tel}`);
  return lines;
}

export function buildSellerDetailLines(seller: SellerSnapshot): string[] {
  const lines: string[] = [];
  if (seller.address) lines.push(seller.address);
  if (seller.representative) lines.push(`${L.representative}: ${seller.representative}`);

  const contacts = [
    seller.tel && `${L.tel}: ${seller.tel}`,
    seller.fax && `${L.fax}: ${seller.fax}`,
  ].filter(Boolean);

  if (contacts.length > 0) lines.push(contacts.join("  /  "));
  return lines;
}

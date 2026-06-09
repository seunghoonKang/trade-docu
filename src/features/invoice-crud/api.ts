import { supabase } from "@/shared/lib/supabase";
import type { Invoice } from "@/entities/invoice";

// S2(#30): 기존 invoices는 거래 건 모델로 백필된 뒤 invoices_legacy로 보존(rename)된다.
// 신규 저장은 거래 건(features/deal-crud)로 가고, 여기서는 과거 문서(legacy)만 읽는다.
const LEGACY_TABLE = "invoices_legacy";

type InvoiceRow = {
  id: string;
  user_id: string;
  invoice_no: string;
  ref_no: string;
  order_no: string;
  date: string | null;
  validity: string | null;
  seller_company_name: string;
  seller_address: string;
  seller_tel: string;
  seller_fax: string;
  seller_representative: string;
  seller_signature_url: string | null;
  buyer_snapshot: Invoice["buyerSnapshot"];
  commodity: string;
  currency: string;
  payment_terms: string;
  incoterms: string;
  delivery: string;
  packing: string;
  remarks: string;
  items: Invoice["items"];
  additional_charges: Invoice["additionalCharges"];
  total_amount: number;
  bank_info: Invoice["bankInfo"];
  created_at: string;
};

function mapInvoiceRow(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    userId: row.user_id,
    invoiceNo: row.invoice_no,
    refNo: row.ref_no,
    orderNo: row.order_no,
    date: row.date ?? "",
    validity: row.validity ?? "",
    sellerCompanyName: row.seller_company_name,
    sellerAddress: row.seller_address,
    sellerTel: row.seller_tel,
    sellerFax: row.seller_fax,
    sellerRepresentative: row.seller_representative,
    sellerSignatureUrl: row.seller_signature_url ?? "",
    buyerSnapshot: row.buyer_snapshot,
    commodity: row.commodity,
    currency: row.currency,
    paymentTerms: row.payment_terms,
    incoterms: row.incoterms,
    delivery: row.delivery,
    packing: row.packing,
    remarks: row.remarks,
    items: row.items,
    additionalCharges: row.additional_charges,
    totalAmount: Number(row.total_amount),
    bankInfo: row.bank_info,
    createdAt: row.created_at,
  };
}

export async function listInvoices(userId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from(LEGACY_TABLE).select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapInvoiceRow(row as InvoiceRow));
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from(LEGACY_TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapInvoiceRow(data as InvoiceRow);
}

export async function deleteInvoice(id: string) {
  const { error } = await supabase.from(LEGACY_TABLE).delete().eq("id", id);
  if (error) throw error;
}

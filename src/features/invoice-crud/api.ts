import { supabase } from "@/shared/lib/supabase";
import type { Invoice } from "@/entities/invoice";

type InvoiceData = Omit<Invoice, "id" | "userId" | "createdAt">;

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

export async function saveInvoice(userId: string, invoice: InvoiceData) {
  const { error } = await supabase.from("invoices").insert({
    user_id: userId, invoice_no: invoice.invoiceNo,
    ref_no: invoice.refNo, order_no: invoice.orderNo,
    date: invoice.date || null, validity: invoice.validity || null,
    seller_company_name: invoice.sellerCompanyName,
    seller_address: invoice.sellerAddress, seller_tel: invoice.sellerTel,
    seller_fax: invoice.sellerFax, seller_representative: invoice.sellerRepresentative,
    seller_signature_url: invoice.sellerSignatureUrl,
    buyer_snapshot: invoice.buyerSnapshot, commodity: invoice.commodity,
    currency: invoice.currency, payment_terms: invoice.paymentTerms,
    incoterms: invoice.incoterms, delivery: invoice.delivery,
    packing: invoice.packing, remarks: invoice.remarks,
    items: invoice.items, additional_charges: invoice.additionalCharges,
    total_amount: invoice.totalAmount, bank_info: invoice.bankInfo,
  });
  if (error) throw error;
}

export async function listInvoices(userId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("invoices").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapInvoiceRow(row as InvoiceRow));
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from("invoices").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapInvoiceRow(data as InvoiceRow);
}

export async function deleteInvoice(id: string) {
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) throw error;
}

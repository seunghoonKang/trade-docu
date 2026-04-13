import { supabase } from "../../shared/lib/supabase";
import type { Invoice } from "../../entities/invoice/model";

type InvoiceData = Omit<Invoice, "id" | "userId" | "createdAt">;

export async function saveInvoice(userId: string, invoice: InvoiceData) {
  const { error } = await supabase.from("invoices").insert({
    user_id: userId, invoice_no: invoice.invoiceNo,
    ref_no: invoice.refNo, order_no: invoice.orderNo,
    date: invoice.date || null, validity: invoice.validity || null,
    seller_company_name: invoice.sellerCompanyName,
    seller_address: invoice.sellerAddress, seller_tel: invoice.sellerTel,
    seller_fax: invoice.sellerFax, seller_representative: invoice.sellerRepresentative,
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
  return (data ?? []).map((row) => ({
    id: row.id, userId: row.user_id,
    invoiceNo: row.invoice_no, refNo: row.ref_no, orderNo: row.order_no,
    date: row.date ?? "", validity: row.validity ?? "",
    sellerCompanyName: row.seller_company_name, sellerAddress: row.seller_address,
    sellerTel: row.seller_tel, sellerFax: row.seller_fax,
    sellerRepresentative: row.seller_representative,
    buyerSnapshot: row.buyer_snapshot, commodity: row.commodity,
    currency: row.currency, paymentTerms: row.payment_terms,
    incoterms: row.incoterms, delivery: row.delivery,
    packing: row.packing, remarks: row.remarks,
    items: row.items, additionalCharges: row.additional_charges,
    totalAmount: Number(row.total_amount), bankInfo: row.bank_info,
    createdAt: row.created_at,
  }));
}

export async function deleteInvoice(id: string) {
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) throw error;
}

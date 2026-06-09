import { supabase } from "@/shared/lib/supabase";
import type { InvoiceDraft } from "@/entities/invoice";
import type { Deal, DealInput, PartySnapshot } from "@/entities/deal";
import type { TradeDocument, DocType, DocStatus } from "@/entities/document";
import { formToDeal } from "./lib/mapping";

// ── Row 타입 (Supabase snake_case) ──────────────────────────────────────────
type DealRow = {
  id: string;
  user_id: string;
  po_no: string;
  po_date: string | null;
  seller_company_name: string;
  seller_address: string;
  seller_tel: string;
  seller_fax: string;
  seller_representative: string;
  seller_signature_url: string;
  buyer_snapshot: PartySnapshot;
  consignee_snapshot: PartySnapshot | null;
  notify_snapshot: PartySnapshot | null;
  currency: string;
  incoterms: string;
  incoterms_place: string;
  payment_terms: string;
  payment_method: string;
  lc_info: Deal["lcInfo"];
  commodity: string;
  origin_country: string;
  validity: string | null;
  bank_info: Deal["bankInfo"];
  charges: Deal["charges"];
  items: Deal["items"];
  remarks: string;
  status: Deal["status"];
  created_at: string;
};

type DocumentRow = {
  id: string;
  user_id: string;
  deal_id: string;
  shipment_id: string | null;
  doc_type: DocType;
  doc_no: string;
  doc_date: string | null;
  status: DocStatus;
  field_options: Record<string, unknown>;
  snapshot: Record<string, unknown>;
  created_at: string;
};

function isEmptyParty(p: PartySnapshot | null): boolean {
  return !p || Object.keys(p).length === 0;
}

function mapDealRow(row: DealRow): Deal {
  return {
    id: row.id,
    userId: row.user_id,
    poNo: row.po_no,
    poDate: row.po_date ?? "",
    sellerCompanyName: row.seller_company_name,
    sellerAddress: row.seller_address,
    sellerTel: row.seller_tel,
    sellerFax: row.seller_fax,
    sellerRepresentative: row.seller_representative,
    sellerSignatureUrl: row.seller_signature_url,
    buyerSnapshot: row.buyer_snapshot,
    consigneeSnapshot: isEmptyParty(row.consignee_snapshot) ? null : row.consignee_snapshot,
    notifySnapshot: isEmptyParty(row.notify_snapshot) ? null : row.notify_snapshot,
    currency: row.currency,
    incoterms: row.incoterms,
    incotermsPlace: row.incoterms_place,
    paymentTerms: row.payment_terms,
    paymentMethod: row.payment_method,
    lcInfo: row.lc_info ?? {},
    commodity: row.commodity,
    originCountry: row.origin_country,
    validity: row.validity ?? "",
    bankInfo: row.bank_info,
    charges: row.charges ?? [],
    items: row.items ?? [],
    remarks: row.remarks,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapDocumentRow(row: DocumentRow): TradeDocument {
  return {
    id: row.id,
    userId: row.user_id,
    dealId: row.deal_id,
    shipmentId: row.shipment_id,
    docType: row.doc_type,
    docNo: row.doc_no,
    docDate: row.doc_date ?? "",
    status: row.status,
    fieldOptions: row.field_options ?? {},
    snapshot: row.snapshot ?? {},
    createdAt: row.created_at,
  };
}

function dealInsertPayload(userId: string, deal: DealInput) {
  return {
    user_id: userId,
    po_no: deal.poNo,
    po_date: deal.poDate || null,
    seller_company_name: deal.sellerCompanyName,
    seller_address: deal.sellerAddress,
    seller_tel: deal.sellerTel,
    seller_fax: deal.sellerFax,
    seller_representative: deal.sellerRepresentative,
    seller_signature_url: deal.sellerSignatureUrl,
    buyer_snapshot: deal.buyerSnapshot,
    consignee_snapshot: deal.consigneeSnapshot ?? {},
    notify_snapshot: deal.notifySnapshot ?? {},
    currency: deal.currency,
    incoterms: deal.incoterms,
    incoterms_place: deal.incotermsPlace,
    payment_terms: deal.paymentTerms,
    payment_method: deal.paymentMethod,
    lc_info: deal.lcInfo,
    commodity: deal.commodity,
    origin_country: deal.originCountry,
    validity: deal.validity || null,
    bank_info: deal.bankInfo,
    charges: deal.charges,
    items: deal.items,
    remarks: deal.remarks,
    status: deal.status,
  };
}

export type DealWithPi = { deal: Deal; pi: TradeDocument | null };

/**
 * 첫 명시적 저장(ADR-0002): PI 폼 → 거래 건 1 + PI 문서 1 생성. dealId 반환.
 * 문서 생성에 실패하면 고아 거래 건을 남기지 않도록 보정한다.
 */
export async function saveDeal(userId: string, form: InvoiceDraft): Promise<string> {
  const { data: dealData, error: dealError } = await supabase
    .from("deals")
    .insert(dealInsertPayload(userId, formToDeal(form)))
    .select("id")
    .single();
  if (dealError) throw dealError;

  const dealId = (dealData as { id: string }).id;

  const { error: docError } = await supabase.from("documents").insert({
    user_id: userId,
    deal_id: dealId,
    shipment_id: null,
    doc_type: "PI",
    doc_no: form.invoiceNo,
    doc_date: form.date || null,
    status: "issued",
    field_options: {},
    snapshot: form,
  });
  if (docError) {
    await supabase.from("deals").delete().eq("id", dealId);
    throw docError;
  }

  return dealId;
}

/** 거래 상세: 거래 건 + 그 PI 문서를 함께 조회. */
export async function getDealWithPi(dealId: string): Promise<DealWithPi | null> {
  const { data: dealData, error: dealError } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .maybeSingle();
  if (dealError) throw dealError;
  if (!dealData) return null;

  const { data: docData, error: docError } = await supabase
    .from("documents")
    .select("*")
    .eq("deal_id", dealId)
    .eq("doc_type", "PI")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (docError) throw docError;

  return {
    deal: mapDealRow(dealData as DealRow),
    pi: docData ? mapDocumentRow(docData as DocumentRow) : null,
  };
}

export async function listDeals(userId: string): Promise<Deal[]> {
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapDealRow(row as DealRow));
}

/** 거래 건 삭제. documents/shipments는 FK on delete cascade로 함께 삭제된다. */
export async function deleteDeal(dealId: string): Promise<void> {
  const { error } = await supabase.from("deals").delete().eq("id", dealId);
  if (error) throw error;
}

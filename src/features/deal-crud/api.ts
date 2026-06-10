import { supabase } from "@/shared/lib/supabase";
import type { InvoiceDraft } from "@/entities/invoice";
import type { Deal, DealInput, PartySnapshot } from "@/entities/deal";
import type { TradeDocument, DocType, DocStatus } from "@/entities/document";
import type { Shipment, ShipmentInput, Allocation } from "@/entities/shipment";
import { createDefaultShipment } from "@/entities/shipment";
import { formToDeal } from "./lib/mapping";
import { buildDealSummaries } from "./lib/summary";
import type { DealDocRef, DealSummary } from "./lib/summary";

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

type ShipmentRow = {
  id: string;
  user_id: string;
  deal_id: string;
  seq: number;
  ship_date: string | null;
  transport_mode: string;
  carrier: string;
  vessel_flight: string;
  container_no: string;
  seal_no: string;
  port_loading: string;
  port_discharge: string;
  final_destination: string;
  bl_no: string;
  bl_date: string | null;
  net_weight: string;
  gross_weight: string;
  total_cbm: string;
  package_count: string;
  carton_size: string;
  marks: string;
  allocations: Shipment["allocations"];
  charges: Shipment["charges"];
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

function mapShipmentRow(row: ShipmentRow): Shipment {
  return {
    id: row.id,
    userId: row.user_id,
    dealId: row.deal_id,
    seq: row.seq,
    shipDate: row.ship_date ?? "",
    transportMode: row.transport_mode,
    carrier: row.carrier,
    vesselFlight: row.vessel_flight,
    containerNo: row.container_no,
    sealNo: row.seal_no,
    portLoading: row.port_loading,
    portDischarge: row.port_discharge,
    finalDestination: row.final_destination,
    blNo: row.bl_no,
    blDate: row.bl_date ?? "",
    netWeight: row.net_weight,
    grossWeight: row.gross_weight,
    totalCbm: row.total_cbm,
    packageCount: row.package_count,
    cartonSize: row.carton_size,
    marks: row.marks,
    allocations: row.allocations ?? [],
    charges: row.charges ?? [],
    createdAt: row.created_at,
  };
}

function shipmentInsertPayload(userId: string, ship: ShipmentInput) {
  return {
    user_id: userId,
    deal_id: ship.dealId,
    seq: ship.seq,
    ship_date: ship.shipDate || null,
    transport_mode: ship.transportMode,
    carrier: ship.carrier,
    vessel_flight: ship.vesselFlight,
    container_no: ship.containerNo,
    seal_no: ship.sealNo,
    port_loading: ship.portLoading,
    port_discharge: ship.portDischarge,
    final_destination: ship.finalDestination,
    bl_no: ship.blNo,
    bl_date: ship.blDate || null,
    net_weight: ship.netWeight,
    gross_weight: ship.grossWeight,
    total_cbm: ship.totalCbm,
    package_count: ship.packageCount,
    carton_size: ship.cartonSize,
    marks: ship.marks,
    allocations: ship.allocations,
    charges: ship.charges,
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

export type DealBundle = { deal: Deal; shipments: Shipment[]; documents: TradeDocument[] };

function fullAllocations(deal: Deal | DealInput): Allocation[] {
  return deal.items.map((it) => ({ itemId: it.id, qty: it.orderedQty }));
}

/**
 * 첫 명시적 저장(ADR-0002): PI 폼 → 거래 건 1 + 기본 선적 1(전량 배분) + PI 문서 1 생성.
 * dealId 반환. 중간 단계 실패 시 고아 거래 건을 남기지 않도록 보정(선적/문서는 FK cascade).
 */
export async function saveDeal(userId: string, form: InvoiceDraft): Promise<string> {
  const dealInput = formToDeal(form);
  const { data: dealData, error: dealError } = await supabase
    .from("deals")
    .insert(dealInsertPayload(userId, dealInput))
    .select("id")
    .single();
  if (dealError) throw dealError;

  const dealId = (dealData as { id: string }).id;

  // 기본 선적 1개(전량 배분) — CI/PL 발행의 선적 레벨 컨테이너(거래 건은 최소 1선적).
  const { error: shipError } = await supabase
    .from("shipments")
    .insert(shipmentInsertPayload(userId, createDefaultShipment(dealId, fullAllocations(dealInput))));
  if (shipError) {
    await supabase.from("deals").delete().eq("id", dealId);
    throw shipError;
  }

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

/** 거래 상세: 거래 건 + 선적들 + 문서들을 함께 조회. */
export async function getDealBundle(dealId: string): Promise<DealBundle | null> {
  const { data: dealData, error: dealError } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .maybeSingle();
  if (dealError) throw dealError;
  if (!dealData) return null;

  const [shipResult, docResult] = await Promise.all([
    supabase.from("shipments").select("*").eq("deal_id", dealId).order("seq", { ascending: true }),
    supabase.from("documents").select("*").eq("deal_id", dealId).order("created_at", { ascending: true }),
  ]);
  if (shipResult.error) throw shipResult.error;
  if (docResult.error) throw docResult.error;

  return {
    deal: mapDealRow(dealData as DealRow),
    shipments: (shipResult.data ?? []).map((r) => mapShipmentRow(r as ShipmentRow)),
    documents: (docResult.data ?? []).map((r) => mapDocumentRow(r as DocumentRow)),
  };
}

/**
 * CI/PL 발행 시 선적이 필요하다. 기본 선적이 없으면(예: 본 슬라이스 이전에 저장된 거래 건)
 * 전량 배분으로 하나 만들어 그 id를 반환한다.
 */
export async function ensureDefaultShipment(
  userId: string,
  deal: Deal,
  existing: Shipment[],
): Promise<string> {
  if (existing.length > 0) return existing[0].id;
  const { data, error } = await supabase
    .from("shipments")
    .insert(shipmentInsertPayload(userId, createDefaultShipment(deal.id, fullAllocations(deal))))
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export type IssueDocumentParams = {
  dealId: string;
  shipmentId: string | null; // PI=null, CI/PL=선적 id
  docType: DocType;
  docNo: string;
  docDate: string;
  fieldOptions?: Record<string, unknown>; // 양식 표시항목 오버라이드 (예: PL {showPrice})
  snapshot: Record<string, unknown>;
};

/** 문서 발행: 같은 거래 데이터로 양식(PI/CI/PL) 문서 1건을 생성. doc_id 반환. */
export async function issueDocument(userId: string, params: IssueDocumentParams): Promise<string> {
  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: userId,
      deal_id: params.dealId,
      shipment_id: params.shipmentId,
      doc_type: params.docType,
      doc_no: params.docNo,
      doc_date: params.docDate || null,
      status: "issued",
      field_options: params.fieldOptions ?? {},
      snapshot: params.snapshot,
    })
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
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

/** 거래 건 단위 History: 거래 건 + 선적 수 + 양식별 발행 수(#26). 최신 저장 순. */
export async function listDealSummaries(userId: string): Promise<DealSummary[]> {
  const [dealsRes, shipsRes, docsRes] = await Promise.all([
    supabase.from("deals").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("shipments").select("deal_id").eq("user_id", userId),
    supabase.from("documents").select("deal_id, doc_type, doc_no").eq("user_id", userId),
  ]);
  if (dealsRes.error) throw dealsRes.error;
  if (shipsRes.error) throw shipsRes.error;
  if (docsRes.error) throw docsRes.error;

  const deals = (dealsRes.data ?? []).map((row) => mapDealRow(row as DealRow));
  const shipmentDealIds = ((shipsRes.data ?? []) as { deal_id: string }[]).map((r) => r.deal_id);
  const docs: DealDocRef[] = (
    (docsRes.data ?? []) as { deal_id: string; doc_type: DocType; doc_no: string }[]
  ).map((r) => ({ dealId: r.deal_id, docType: r.doc_type, docNo: r.doc_no }));
  return buildDealSummaries(deals, shipmentDealIds, docs);
}

/** 거래 건 삭제. documents/shipments는 FK on delete cascade로 함께 삭제된다. */
export async function deleteDeal(dealId: string): Promise<void> {
  const { error } = await supabase.from("deals").delete().eq("id", dealId);
  if (error) throw error;
}

/** 분할선적: 새 선적 생성(차수 seq, 품목별 배분). shipment id 반환. */
export async function createShipment(
  userId: string,
  dealId: string,
  seq: number,
  allocations: Allocation[],
): Promise<string> {
  const ship: ShipmentInput = { ...createDefaultShipment(dealId, allocations), seq };
  const { data, error } = await supabase
    .from("shipments")
    .insert(shipmentInsertPayload(userId, ship))
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

/** 선적의 품목별 배분 수량 갱신. */
export async function updateShipmentAllocations(
  shipmentId: string,
  allocations: Allocation[],
): Promise<void> {
  const { error } = await supabase.from("shipments").update({ allocations }).eq("id", shipmentId);
  if (error) throw error;
}

/** 선적 삭제. 그 선적의 CI/PL 문서는 FK on delete cascade로 함께 삭제된다. */
export async function deleteShipment(shipmentId: string): Promise<void> {
  const { error } = await supabase.from("shipments").delete().eq("id", shipmentId);
  if (error) throw error;
}

/** CI용 선적 비용 라인 갱신(운임/보험/세금 등). */
export async function updateShipmentCharges(
  shipmentId: string,
  charges: Shipment["charges"],
): Promise<void> {
  const { error } = await supabase.from("shipments").update({ charges }).eq("id", shipmentId);
  if (error) throw error;
}

/** 원산지 갱신(거래 건 레벨) — CI 발행 플로우에서 입력한다. */
export async function updateDealOriginCountry(dealId: string, originCountry: string): Promise<void> {
  const { error } = await supabase
    .from("deals")
    .update({ origin_country: originCountry })
    .eq("id", dealId);
  if (error) throw error;
}

/** 거래 건 상태(open/closed). '완료' 시 잔여 경고는 호출부에서 처리. */
export async function setDealStatus(dealId: string, status: "open" | "closed"): Promise<void> {
  const { error } = await supabase.from("deals").update({ status }).eq("id", dealId);
  if (error) throw error;
}

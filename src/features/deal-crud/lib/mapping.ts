import type { InvoiceDraft } from "@/entities/invoice";
import { createEmptyInvoice } from "@/entities/invoice";
import type { Deal, DealInput, DealItem, ChargeLine } from "@/entities/deal";
import { createEmptyDeal } from "@/entities/deal";
import type { TradeDocument } from "@/entities/document";

/**
 * 브리지: PI 편집 폼(InvoiceDraft) ↔ 거래 건(Deal) + PI 문서(Document).
 *
 * S1은 기존 PI 폼/프리뷰/PDF UI를 그대로 두고 영속 표현만 deals+documents로 바꾼다.
 * - formToDeal: 구조화된 거래 건 컬럼으로 매핑(향후 선적 배분·잔량 추적의 기준).
 * - 발행 시 PI 문서 snapshot에는 폼 전체를 박제(불변) → 무손실 복원.
 * - dealToForm: snapshot이 있으면 그대로 복원(불변), 없으면 거래 건 컬럼으로 재구성.
 */

function newId(): string {
  return crypto.randomUUID();
}

export function formToDeal(form: InvoiceDraft): DealInput {
  return {
    ...createEmptyDeal(),
    poNo: form.orderNo,
    sellerCompanyName: form.sellerCompanyName,
    sellerAddress: form.sellerAddress,
    sellerTel: form.sellerTel,
    sellerFax: form.sellerFax,
    sellerRepresentative: form.sellerRepresentative,
    sellerSignatureUrl: form.sellerSignatureUrl,
    buyerSnapshot: { ...form.buyerSnapshot },
    consigneeSnapshot: form.consignee ?? null,
    notifySnapshot: form.notify ?? null,
    currency: form.currency,
    incoterms: form.incoterms,
    paymentTerms: form.paymentTerms,
    paymentMethod: form.paymentMethod ?? "",
    lcInfo: form.lcInfo ?? {},
    commodity: form.commodity,
    originCountry: form.originCountry ?? "",
    validity: form.validity,
    bankInfo: { ...form.bankInfo },
    remarks: form.remarks,
    charges: form.additionalCharges.map<ChargeLine>((c) => ({
      type: c.type ?? "other",
      label: c.description,
      amount: c.amount,
    })),
    items: form.items.map<DealItem>((it) => ({
      id: newId(),
      description: it.description,
      hsCode: it.hsCode,
      unit: it.unit,
      unitPrice: it.unitPrice,
      orderedQty: it.qty,
      remarks: it.remarks,
    })),
  };
}

export function dealToForm(deal: Deal, doc: TradeDocument | null): InvoiceDraft {
  // 발행 문서는 snapshot에 폼 데이터를 박제한다(불변). 있으면 그대로 복원.
  if (doc && doc.snapshot && Object.keys(doc.snapshot).length > 0) {
    return doc.snapshot as unknown as InvoiceDraft;
  }

  // 폴백: 구조화된 거래 건 + 문서 필드로 재구성(snapshot이 없는 경우).
  return {
    ...createEmptyInvoice(),
    invoiceNo: doc?.docNo ?? "",
    orderNo: deal.poNo,
    date: doc?.docDate || createEmptyInvoice().date,
    validity: deal.validity,
    sellerCompanyName: deal.sellerCompanyName,
    sellerAddress: deal.sellerAddress,
    sellerTel: deal.sellerTel,
    sellerFax: deal.sellerFax,
    sellerRepresentative: deal.sellerRepresentative,
    sellerSignatureUrl: deal.sellerSignatureUrl,
    buyerSnapshot: { ...deal.buyerSnapshot },
    consignee: deal.consigneeSnapshot,
    notify: deal.notifySnapshot,
    commodity: deal.commodity,
    originCountry: deal.originCountry,
    currency: deal.currency,
    paymentTerms: deal.paymentTerms,
    paymentMethod: deal.paymentMethod,
    lcInfo: {
      no: deal.lcInfo.no ?? "",
      issuingBank: deal.lcInfo.issuingBank ?? "",
      date: deal.lcInfo.date ?? "",
    },
    incoterms: deal.incoterms,
    remarks: deal.remarks,
    bankInfo: { ...deal.bankInfo },
    items: deal.items.map((it) => ({
      description: it.description,
      hsCode: it.hsCode,
      qty: it.orderedQty,
      unit: it.unit,
      unitPrice: it.unitPrice,
      amount: it.orderedQty * it.unitPrice,
      remarks: it.remarks,
    })),
    additionalCharges: deal.charges.map((c) => ({
      type: (c.type as InvoiceDraft["additionalCharges"][number]["type"]) ?? "other",
      description: c.label,
      amount: c.amount,
    })),
  };
}

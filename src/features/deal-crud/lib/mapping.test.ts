import { describe, expect, it } from "vitest";
import { createEmptyInvoice } from "@/entities/invoice";
import type { InvoiceDraft } from "@/entities/invoice";
import type { Deal } from "@/entities/deal";
import { createEmptyDeal } from "@/entities/deal";
import type { TradeDocument } from "@/entities/document";
import { dealToForm, formToDeal } from "./mapping";

function sampleForm(): InvoiceDraft {
  return {
    ...createEmptyInvoice(),
    invoiceNo: "PI-2026-001",
    orderNo: "PO-42",
    currency: "USD",
    incoterms: "CIF",
    buyerSnapshot: { companyName: "Buyer Co.", address: "Busan", tel: "051", contactPerson: "Lee" },
    items: [
      { description: "Widget", hsCode: "1234", qty: 100, unit: "PCS", unitPrice: 5, amount: 500, remarks: "" },
    ],
    additionalCharges: [{ description: "Freight", amount: 50 }],
  };
}

describe("formToDeal", () => {
  it("PO 번호를 거래 건 po_no로, 주문 수량을 orderedQty로 매핑한다", () => {
    const deal = formToDeal(sampleForm());
    expect(deal.poNo).toBe("PO-42");
    expect(deal.items).toHaveLength(1);
    expect(deal.items[0]).toMatchObject({ description: "Widget", orderedQty: 100, unitPrice: 5 });
    expect(deal.items[0].id).toBeTruthy(); // 선적 배분이 참조할 안정 id 부여
  });

  it("추가 비용을 비용 라인(type=other)으로 옮긴다", () => {
    const deal = formToDeal(sampleForm());
    expect(deal.charges).toEqual([{ type: "other", label: "Freight", amount: 50 }]);
  });

  it("비용 유형을 보존한다(운임/보험 등)", () => {
    const deal = formToDeal({
      ...sampleForm(),
      additionalCharges: [{ type: "freight", description: "Sea freight", amount: 60 }],
    });
    expect(deal.charges).toEqual([{ type: "freight", label: "Sea freight", amount: 60 }]);
  });

  it("거래 건 전용 필드는 기본값으로 둔다", () => {
    const deal = formToDeal(sampleForm());
    expect(deal.consigneeSnapshot).toBeNull();
    expect(deal.paymentMethod).toBe("");
    expect(deal.status).toBe("open");
  });
});

describe("dealToForm", () => {
  function sampleDeal(): Deal {
    return {
      ...createEmptyDeal(),
      id: "deal-1",
      userId: "user-1",
      createdAt: "2026-06-09T00:00:00.000Z",
      poNo: "PO-42",
      buyerSnapshot: { companyName: "Buyer Co.", address: "Busan", tel: "051", contactPerson: "Lee" },
      items: [
        { id: "i1", description: "Widget", hsCode: "1234", unit: "PCS", unitPrice: 5, orderedQty: 100, remarks: "" },
      ],
      charges: [{ type: "other", label: "Freight", amount: 50 }],
    };
  }

  function piDoc(snapshot: Record<string, unknown>): TradeDocument {
    return {
      id: "doc-1",
      userId: "user-1",
      dealId: "deal-1",
      shipmentId: null,
      docType: "PI",
      docNo: "PI-2026-001",
      docDate: "2026-06-09",
      status: "issued",
      fieldOptions: {},
      snapshot,
      createdAt: "2026-06-09T00:00:00.000Z",
    };
  }

  it("snapshot이 있으면 발행 당시 폼을 그대로 복원한다(불변)", () => {
    const original = sampleForm();
    const restored = dealToForm(sampleDeal(), piDoc(original as unknown as Record<string, unknown>));
    expect(restored).toEqual(original);
  });

  it("snapshot이 없으면 거래 건 컬럼으로 재구성한다", () => {
    const form = dealToForm(sampleDeal(), piDoc({}));
    expect(form.orderNo).toBe("PO-42");
    expect(form.items[0]).toMatchObject({ description: "Widget", qty: 100, amount: 500 });
    expect(form.additionalCharges).toEqual([{ type: "other", description: "Freight", amount: 50 }]);
  });

  it("문서가 없어도(null) 거래 건만으로 폼을 만든다", () => {
    const form = dealToForm(sampleDeal(), null);
    expect(form.orderNo).toBe("PO-42");
    expect(form.items).toHaveLength(1);
  });
});

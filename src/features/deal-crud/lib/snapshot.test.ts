import { describe, expect, it } from "vitest";
import type { TradeDocument } from "@/entities/document";
import { documentPreviewData } from "./snapshot";

function doc(overrides: Partial<TradeDocument>): TradeDocument {
  return {
    id: "doc-1",
    userId: "u1",
    dealId: "d1",
    shipmentId: null,
    docType: "PI",
    docNo: "INV-001",
    docDate: "2026-06-01",
    status: "issued",
    fieldOptions: {},
    snapshot: { invoiceNo: "INV-001" },
    createdAt: "2026-06-01T00:00:00Z",
    ...overrides,
  };
}

describe("documentPreviewData", () => {
  it("snapshot이 비어 있으면 null", () => {
    expect(documentPreviewData(doc({ snapshot: {} }))).toBeNull();
  });

  it("PI는 snapshot 폼만 복원하고 packingLines는 빈 배열", () => {
    const data = documentPreviewData(doc({}));
    expect(data?.form.invoiceNo).toBe("INV-001");
    expect(data?.packingLines).toEqual([]);
    expect(data?.showPrice).toBe(false);
  });

  it("PL은 snapshot.packingLines와 fieldOptions.showPrice를 함께 복원", () => {
    const data = documentPreviewData(
      doc({
        docType: "PL",
        snapshot: { invoiceNo: "INV-001-1", packingLines: [{ cartonQty: 5 }] },
        fieldOptions: { showPrice: true },
      }),
    );
    expect(data?.packingLines).toEqual([{ cartonQty: 5 }]);
    expect(data?.showPrice).toBe(true);
  });

  it("PL이라도 fieldOptions.showPrice가 없으면 가격 숨김", () => {
    const data = documentPreviewData(doc({ docType: "PL", snapshot: { invoiceNo: "x" } }));
    expect(data?.showPrice).toBe(false);
    expect(data?.packingLines).toEqual([]);
  });
});

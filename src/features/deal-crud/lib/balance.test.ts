import { describe, expect, it } from "vitest";
import { createEmptyDeal } from "@/entities/deal";
import type { Deal, DealItem } from "@/entities/deal";
import type { Shipment, Allocation } from "@/entities/shipment";
import { computeBalance, quantityWarningKeys, remainingAllocations, nextSeq, suggestDocNo } from "./balance";

function item(id: string, orderedQty: number): DealItem {
  return { id, description: id, hsCode: "", unit: "PCS", unitPrice: 1, orderedQty, remarks: "" };
}

function deal(items: DealItem[]): Deal {
  return { ...createEmptyDeal(), id: "deal-1", userId: "u1", createdAt: "", items };
}

function shipment(id: string, seq: number, allocations: Allocation[]): Shipment {
  return {
    id, userId: "u1", dealId: "deal-1", seq, shipDate: "", transportMode: "", carrier: "",
    vesselFlight: "", containerNo: "", sealNo: "", portLoading: "", portDischarge: "",
    finalDestination: "", blNo: "", blDate: "", netWeight: "", grossWeight: "", totalCbm: "",
    packageCount: "", cartonSize: "", marks: "", allocations, charges: [], createdAt: "",
  };
}

describe("computeBalance", () => {
  it("잔여 = 주문 − Σ배분 을 품목별로 계산한다", () => {
    const d = deal([item("a", 1000), item("b", 500)]);
    const ships = [
      shipment("s1", 1, [{ itemId: "a", qty: 300 }, { itemId: "b", qty: 500 }]),
      shipment("s2", 2, [{ itemId: "a", qty: 400 }]),
    ];
    const bal = computeBalance(d, ships);

    expect(bal.items.find((i) => i.itemId === "a")).toMatchObject({ ordered: 1000, allocated: 700, remaining: 300, over: false });
    expect(bal.items.find((i) => i.itemId === "b")).toMatchObject({ allocated: 500, remaining: 0 });
    expect(bal.hasRemaining).toBe(true);
    expect(bal.hasOver).toBe(false);
  });

  it("초과 배분이면 over=true, remaining<0", () => {
    const d = deal([item("a", 100)]);
    const bal = computeBalance(d, [shipment("s1", 1, [{ itemId: "a", qty: 120 }])]);
    expect(bal.items[0]).toMatchObject({ allocated: 120, remaining: -20, over: true });
    expect(bal.hasOver).toBe(true);
  });

  it("excludeShipmentId로 특정 선적 배분을 제외한다", () => {
    const d = deal([item("a", 1000)]);
    const ships = [
      shipment("s1", 1, [{ itemId: "a", qty: 300 }]),
      shipment("s2", 2, [{ itemId: "a", qty: 400 }]),
    ];
    const bal = computeBalance(d, ships, { excludeShipmentId: "s2" });
    expect(bal.items[0]).toMatchObject({ allocated: 300, remaining: 700 });
  });
});

describe("remainingAllocations", () => {
  it("잔여(>0)만 새 선적 기본 배분으로 만든다", () => {
    const d = deal([item("a", 1000), item("b", 500)]);
    const ships = [shipment("s1", 1, [{ itemId: "a", qty: 300 }, { itemId: "b", qty: 500 }])];
    expect(remainingAllocations(d, ships)).toEqual([{ itemId: "a", qty: 700 }]);
  });
});

describe("nextSeq", () => {
  it("기존 최대 seq + 1", () => {
    expect(nextSeq([shipment("s1", 1, []), shipment("s3", 3, [])])).toBe(4);
    expect(nextSeq([])).toBe(1);
  });
});

describe("suggestDocNo", () => {
  it("seq 1은 접미사 없음, 2부터 -seq 접미사", () => {
    expect(suggestDocNo("CI-141", 1)).toBe("CI-141");
    expect(suggestDocNo("CI-141", 2)).toBe("CI-141-2");
    expect(suggestDocNo("", 2)).toBe("");
  });
});

describe("quantityWarningKeys (#27)", () => {
  it("초과 배분이면 overAllocated 경고", () => {
    const d = deal([item("a", 100)]);
    const ships = [shipment("s1", 1, [{ itemId: "a", qty: 150 }])];
    expect(quantityWarningKeys(d, ships)).toContain("overAllocated");
  });

  it("완료(closed) 거래에 잔여가 있으면 unshippedRemaining 경고", () => {
    const d = { ...deal([item("a", 100)]), status: "closed" as const };
    const ships = [shipment("s1", 1, [{ itemId: "a", qty: 40 }])];
    expect(quantityWarningKeys(d, ships)).toContain("unshippedRemaining");
  });

  it("진행중(open) 거래의 잔여는 경고하지 않는다", () => {
    const d = deal([item("a", 100)]);
    const ships = [shipment("s1", 1, [{ itemId: "a", qty: 40 }])];
    expect(quantityWarningKeys(d, ships)).toEqual([]);
  });

  it("전량 배분 + 완료면 경고 없음", () => {
    const d = { ...deal([item("a", 100)]), status: "closed" as const };
    const ships = [shipment("s1", 1, [{ itemId: "a", qty: 100 }])];
    expect(quantityWarningKeys(d, ships)).toEqual([]);
  });
});

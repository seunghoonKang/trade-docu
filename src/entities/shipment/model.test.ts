import { describe, expect, it } from "vitest";
import { createDefaultShipment } from "./model";

describe("createDefaultShipment", () => {
  it("기본 선적은 seq 1이고 주어진 배분을 그대로 가진다", () => {
    const ship = createDefaultShipment("deal-1", [
      { itemId: "i1", qty: 100 },
      { itemId: "i2", qty: 50 },
    ]);

    expect(ship.dealId).toBe("deal-1");
    expect(ship.seq).toBe(1);
    expect(ship.allocations).toEqual([
      { itemId: "i1", qty: 100 },
      { itemId: "i2", qty: 50 },
    ]);
  });

  it("운송/포장 필드는 비어 있다(상세 입력은 후속 슬라이스)", () => {
    const ship = createDefaultShipment("deal-1", []);
    expect(ship.transportMode).toBe("");
    expect(ship.netWeight).toBe("");
    expect(ship.charges).toEqual([]);
  });
});

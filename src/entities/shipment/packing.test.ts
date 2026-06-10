import { describe, expect, it } from "vitest";
import { normalizeAllocation, visiblePackingColumns } from "./packing";

describe("normalizeAllocation", () => {
  it("빈 포장 항목(빈 문자열·0)은 키를 남기지 않는다", () => {
    expect(
      normalizeAllocation({
        itemId: "i1",
        qty: 100,
        cartonQty: 0,
        netWeight: "",
        grossWeight: "  ",
        cbm: "",
        cartonNo: "",
      }),
    ).toEqual({ itemId: "i1", qty: 100 });
  });

  it("채운 포장 항목은 trim해서 보존한다", () => {
    expect(
      normalizeAllocation({
        itemId: "i1",
        qty: 100,
        cartonQty: 10,
        netWeight: " 120.5 ",
        cartonNo: "1-10",
      }),
    ).toEqual({ itemId: "i1", qty: 100, cartonQty: 10, netWeight: "120.5", cartonNo: "1-10" });
  });
});

describe("visiblePackingColumns", () => {
  it("라인이 없으면 모든 컬럼이 숨김", () => {
    expect(visiblePackingColumns([])).toEqual({
      cartonQty: false,
      netWeight: false,
      grossWeight: false,
      cbm: false,
      cartonNo: false,
    });
  });

  it("한 라인이라도 채운 컬럼만 보인다", () => {
    const cols = visiblePackingColumns([
      {},
      { cartonQty: 5, cbm: "1.2" },
      { netWeight: "  " }, // 공백뿐이면 비운 것
    ]);
    expect(cols).toEqual({
      cartonQty: true,
      netWeight: false,
      grossWeight: false,
      cbm: true,
      cartonNo: false,
    });
  });
});

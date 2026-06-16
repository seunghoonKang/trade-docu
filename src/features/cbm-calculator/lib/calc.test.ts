import { describe, expect, it } from "vitest";
import { cartonCbm, chargeableWeightAir, containerFill, sumTotals, volumetricWeightAir } from "./calc";
import type { CartonRow } from "../model/types";

function row(p: Partial<CartonRow>): CartonRow {
  return { id: "x", length: "", width: "", height: "", qty: "", weight: "", ...p };
}

describe("cbm calc", () => {
  it("100×100×100 cm 카톤 = 1 m³", () => {
    expect(cartonCbm(100, 100, 100, "cm")).toBeCloseTo(1, 6);
  });

  it("단위 환산 — 1000mm = 100cm", () => {
    expect(cartonCbm(1000, 1000, 1000, "mm")).toBeCloseTo(1, 6);
  });

  it("항공 부피중량 = cm³/6000", () => {
    expect(volumetricWeightAir(100, 100, 100, "cm")).toBeCloseTo(1_000_000 / 6000, 4);
  });

  it("청구중량 = max(실중량, 부피중량)", () => {
    expect(chargeableWeightAir(100, 166.67)).toBeCloseTo(166.67, 2);
    expect(chargeableWeightAir(200, 166.67)).toBe(200);
  });

  it("sumTotals — 수량 곱 합산", () => {
    const rows = [row({ length: "100", width: "100", height: "100", qty: "2", weight: "50" })];
    const t = sumTotals(rows, "cm");
    expect(t.totalCbm).toBeCloseTo(2, 6);
    expect(t.totalGrossWeight).toBe(100);
    expect(t.totalCartons).toBe(2);
    expect(t.totalVolumetricAir).toBeCloseTo((1_000_000 / 6000) * 2, 2);
    expect(t.chargeableAir).toBeCloseTo((1_000_000 / 6000) * 2, 2); // 부피중량 > 실중량
  });

  it("빈/이상 입력은 0으로 처리", () => {
    const t = sumTotals([row({ length: "abc", qty: "" })], "cm");
    expect(t.totalCbm).toBe(0);
    expect(t.totalCartons).toBe(0);
  });

  it("containerFill — 60 CBM 적재 추정", () => {
    const fits = containerFill(60);
    const ft20 = fits.find((f) => f.name === "20ft")!;
    const hc40 = fits.find((f) => f.name === "40HC")!;
    expect(ft20.containersNeeded).toBe(3); // ceil(60/28)
    expect(ft20.utilizationPercent).toBeCloseTo((60 / (3 * 28)) * 100, 2);
    expect(hc40.containersNeeded).toBe(1); // ceil(60/68)
  });

  it("총 CBM 0이면 컨테이너 0", () => {
    expect(containerFill(0).every((f) => f.containersNeeded === 0)).toBe(true);
  });
});

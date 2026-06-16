import { describe, expect, it } from "vitest";
import { convert, rateFor } from "./convert";
import type { FxRate } from "../model/types";

const rates: FxRate[] = [
  { currency: "USD", rate: 1380 },
  { currency: "EUR", rate: 1500 },
];

describe("fx convert", () => {
  it("KRW은 환율 1", () => {
    expect(rateFor("KRW", rates)).toBe(1);
  });

  it("목록에 없는 통화는 null", () => {
    expect(rateFor("JPY", rates)).toBeNull();
  });

  it("외화 → KRW", () => {
    expect(convert(100, "USD", "KRW", rates)).toBe(138_000);
  });

  it("KRW → 외화", () => {
    expect(convert(138_000, "KRW", "USD", rates)).toBe(100);
  });

  it("외화 → 외화(KRW 교차)", () => {
    expect(convert(100, "USD", "EUR", rates)).toBeCloseTo((100 * 1380) / 1500, 6);
  });

  it("환율 없는 통화 환산은 null", () => {
    expect(convert(100, "USD", "JPY", rates)).toBeNull();
  });
});

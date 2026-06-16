import type { FxRate } from "../model/types";

/** 통화 1단위의 KRW 환율. KRW는 1, 목록에 없으면 null. */
export function rateFor(currency: string, rates: FxRate[]): number | null {
  if (currency === "KRW") return 1;
  const found = rates.find((r) => r.currency === currency);
  return found ? found.rate : null;
}

/** from→to 환산(KRW 기준 교차). 환율 없는 통화면 null. */
export function convert(amount: number, from: string, to: string, rates: FxRate[]): number | null {
  const rf = rateFor(from, rates);
  const rt = rateFor(to, rates);
  if (rf == null || rt == null || rt === 0) return null;
  const krw = amount * rf;
  return krw / rt;
}

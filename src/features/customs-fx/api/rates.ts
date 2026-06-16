import type { FxResponse, FxType } from "../model/types";

/** 관세청 고시환율 조회 — 서버 함수(`/api/customs-fx`) 프록시 경유. */
export async function fetchFxRates(type: FxType, date?: string): Promise<FxResponse> {
  const params = new URLSearchParams({ type });
  if (date) params.set("date", date);
  const res = await fetch(`/api/customs-fx?${params.toString()}`);
  if (!res.ok) throw new Error("fx_fetch_failed");
  return (await res.json()) as FxResponse;
}

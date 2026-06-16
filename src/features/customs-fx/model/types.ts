/** 환율 도구 타입 — `/api/customs-fx`의 JSON 계약과 일치(서버 코드는 import하지 않음). */
export type FxType = "export" | "import";

export interface FxRate {
  currency: string;
  rate: number; // KRW per 1 unit
  name?: string; // 화폐단위명 (e.g., "US Dollar")
}

export interface FxResponse {
  baseDate: string; // YYYYMMDD
  type: FxType;
  source: "customs" | "fixture";
  rates: FxRate[];
}

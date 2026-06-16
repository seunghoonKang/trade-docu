import { XMLParser } from "fast-xml-parser";

/**
 * 관세청 관세환율 조회 코어 — Vercel 함수(customs-fx.ts)와 Vite dev 미들웨어가 공유한다.
 * `src` 밖이라 FSD/Steiger 비대상. 프런트는 이 파일을 import하지 않고 JSON 계약만 맞춘다.
 */

export type FxType = "export" | "import";
export interface CustomsFxRate {
  currency: string;
  rate: number; // KRW per 1 unit
}
export interface CustomsFxResponse {
  baseDate: string; // YYYYMMDD
  type: FxType;
  source: "customs" | "fixture";
  rates: CustomsFxRate[];
}

// ⚠️ data.go.kr / UNIPASS 관세청 관세환율 API. 정확한 엔드포인트·파라미터·필드명은
// 실제 서비스 스펙으로 확정 후 조정한다(키 발급 시 검증). 키 없으면 fixture로 동작.
const ENDPOINT = "https://unipass.customs.go.kr:38010/ext/rest/trifFxrtInfoQry/retrieveTrifFxrtInfo";
const CURRENCY_FIELDS = ["currSgn", "mtryUtNm", "currNm"];
const RATE_FIELDS = ["fxrt", "basESTrnrt"];

/** 키 없을 때 UI/개발용 샘플(실데이터 아님 — source: "fixture"로 표시). */
const FIXTURE: Record<FxType, CustomsFxRate[]> = {
  export: [
    { currency: "USD", rate: 1380.5 },
    { currency: "EUR", rate: 1495.2 },
    { currency: "JPY", rate: 9.12 },
    { currency: "CNY", rate: 190.3 },
    { currency: "GBP", rate: 1745.0 },
  ],
  import: [
    { currency: "USD", rate: 1392.0 },
    { currency: "EUR", rate: 1508.4 },
    { currency: "JPY", rate: 9.21 },
    { currency: "CNY", rate: 192.1 },
    { currency: "GBP", rate: 1760.5 },
  ],
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function pick(obj: Record<string, unknown>, fields: string[]): unknown {
  for (const f of fields) if (obj[f] != null) return obj[f];
  return undefined;
}

/** 파싱 트리에서 환율 행처럼 보이는(통화 필드를 가진) 첫 배열을 찾는다. */
function findItems(node: unknown): Record<string, unknown>[] {
  if (Array.isArray(node)) {
    if (node.some((n) => isRecord(n) && pick(n, CURRENCY_FIELDS) != null)) {
      return node.filter(isRecord);
    }
    for (const n of node) {
      const found = findItems(n);
      if (found.length) return found;
    }
    return [];
  }
  if (isRecord(node)) {
    for (const v of Object.values(node)) {
      const found = findItems(v);
      if (found.length) return found;
    }
  }
  return [];
}

function defaultDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

export async function fetchCustomsFxRates(opts: {
  date?: string;
  type: FxType;
  apiKey?: string;
}): Promise<CustomsFxResponse> {
  const type = opts.type;
  const baseDate = opts.date && /^\d{8}$/.test(opts.date) ? opts.date : defaultDate();

  if (!opts.apiKey) {
    return { baseDate, type, source: "fixture", rates: FIXTURE[type] };
  }

  const params = new URLSearchParams({
    crkyCn: opts.apiKey,
    imexTp: type === "import" ? "1" : "2",
    qryYr: baseDate.slice(0, 4),
    qryMm: baseDate.slice(4, 6),
  });
  const res = await fetch(`${ENDPOINT}?${params.toString()}`);
  const xml = await res.text();
  const parsed: unknown = new XMLParser().parse(xml);

  const rates: CustomsFxRate[] = findItems(parsed)
    .map((it) => ({
      currency: String(pick(it, CURRENCY_FIELDS) ?? "").trim().toUpperCase(),
      rate: Number(pick(it, RATE_FIELDS) ?? 0),
    }))
    .filter((r) => r.currency && Number.isFinite(r.rate) && r.rate > 0);

  return { baseDate, type, source: "customs", rates };
}

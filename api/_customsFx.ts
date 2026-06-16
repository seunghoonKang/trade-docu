import { XMLParser } from "fast-xml-parser";

/**
 * 관세청 관세환율 조회 코어 — Vercel 함수(customs-fx.ts)와 Vite dev 미들웨어가 공유한다.
 * `src` 밖이라 FSD/Steiger 비대상. 프런트는 이 파일을 import하지 않고 JSON 계약만 맞춘다.
 *
 * data.go.kr "관세청_관세환율정보(GW)" (검증 완료):
 *   GET .../getRetrieveTrifFxrtInfo?serviceKey=&aplyBgnDt=YYYYMMDD&weekFxrtTpcd=1|2
 *   - aplyBgnDt: 적용개시일(주간환율은 일요일 시작 → 해당 주 일요일로 스냅)
 *   - weekFxrtTpcd: 수출=1, 수입=2
 *   - 응답 item: currSgn(통화부호), fxrt(환율, KRW/1단위), mtryUtNm(화폐단위명), aplyBgnDt
 */

export type FxType = "export" | "import";
export interface CustomsFxRate {
  currency: string;
  rate: number; // KRW per 1 unit
  name?: string;
}
export interface CustomsFxResponse {
  baseDate: string; // YYYYMMDD (실제 적용개시일)
  type: FxType;
  source: "customs" | "fixture";
  rates: CustomsFxRate[];
}

const ENDPOINT = "https://apis.data.go.kr/1220000/retrieveTrifFxrtInfo/getRetrieveTrifFxrtInfo";

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

/** 트리에서 환율 행처럼 보이는(currSgn을 가진) 첫 배열을 찾는다. */
function findItems(node: unknown): Record<string, unknown>[] {
  if (Array.isArray(node)) {
    if (node.some((n) => isRecord(n) && "currSgn" in n)) return node.filter(isRecord);
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

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

/** 주어진 날짜(없으면 오늘)를 그 주 일요일(적용개시일)로 스냅. */
function weekStart(date?: string): string {
  let base: Date;
  if (date && /^\d{8}$/.test(date)) {
    base = new Date(Number(date.slice(0, 4)), Number(date.slice(4, 6)) - 1, Number(date.slice(6, 8)));
  } else {
    base = new Date();
  }
  base.setDate(base.getDate() - base.getDay()); // getDay 0=일요일
  return ymd(base);
}

export async function fetchCustomsFxRates(opts: {
  date?: string;
  type: FxType;
  apiKey?: string;
}): Promise<CustomsFxResponse> {
  const type = opts.type;
  const baseDate = weekStart(opts.date);

  if (!opts.apiKey) {
    return { baseDate, type, source: "fixture", rates: FIXTURE[type] };
  }

  const params = new URLSearchParams({
    serviceKey: opts.apiKey,
    aplyBgnDt: baseDate,
    weekFxrtTpcd: type === "export" ? "1" : "2",
    numOfRows: "1000",
  });
  const res = await fetch(`${ENDPOINT}?${params.toString()}`);
  const xml = await res.text();
  const parsed: unknown = new XMLParser().parse(xml);

  const rates: CustomsFxRate[] = findItems(parsed)
    .map((it) => ({
      currency: String(it.currSgn ?? "").trim().toUpperCase(),
      rate: Number(it.fxrt ?? 0),
      name: it.mtryUtNm != null ? String(it.mtryUtNm) : undefined,
    }))
    .filter((r) => r.currency && Number.isFinite(r.rate) && r.rate > 0);

  return { baseDate, type, source: "customs", rates };
}

import { fetchCustomsFxRates, type FxType } from "./_customsFx";

/**
 * 관세청 고시환율 프록시 — 이 앱의 첫 Vercel 서버 함수.
 * 표준 Node 핸들러(@vercel/node) 시그니처. data.go.kr 키는 process.env(서버 전용)로만 읽어
 * 브라우저에 노출하지 않는다. 주간 데이터라 CDN 캐시(s-maxage)로 호출을 아낀다.
 */
interface ApiRequest {
  url?: string;
}
interface ApiResponse {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(chunk: string): void;
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const url = new URL(req.url ?? "", "http://localhost");
  const type: FxType = url.searchParams.get("type") === "import" ? "import" : "export";
  const date = url.searchParams.get("date") ?? undefined;
  const apiKey = process.env.DATA_GO_KR_SERVICE_KEY;

  try {
    const data = await fetchCustomsFxRates({ date, type, apiKey });
    res.setHeader("content-type", "application/json");
    res.setHeader("cache-control", "public, s-maxage=86400, stale-while-revalidate=86400");
    res.statusCode = 200;
    res.end(JSON.stringify(data));
  } catch (err) {
    res.statusCode = 502;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: "fx_failed", message: String(err) }));
  }
}

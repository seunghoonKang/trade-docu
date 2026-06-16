import { fetchCustomsFxRates, type FxType } from "./_customsFx";

/**
 * 관세청 고시환율 프록시 — 이 앱의 첫 Vercel 서버 함수.
 * data.go.kr/UNIPASS 키는 process.env(서버 전용)로만 읽어 브라우저에 노출하지 않는다.
 * 주간 데이터라 CDN 캐시(s-maxage)로 호출을 아낀다.
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const type: FxType = url.searchParams.get("type") === "import" ? "import" : "export";
  const date = url.searchParams.get("date") ?? undefined;
  const apiKey = process.env.DATA_GO_KR_SERVICE_KEY;

  try {
    const data = await fetchCustomsFxRates({ date, type, apiKey });
    return new Response(JSON.stringify(data), {
      headers: {
        "content-type": "application/json",
        "cache-control": "public, s-maxage=86400, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "fx_failed" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
}

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Select } from "@/shared/ui";
import { CURRENCY_OPTIONS } from "@/shared/config";
import { cn } from "@/shared/lib/utils";
import type { FxResponse, FxType } from "../model/types";
import { fetchFxRates } from "../api/rates";
import { convert } from "../lib/convert";

/** YYYYMMDD → YYYY-MM-DD (date input 표시용). */
function toDateInput(yyyymmdd: string): string {
  return /^\d{8}$/.test(yyyymmdd) ? `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}` : "";
}

/**
 * 관세청 고시환율 조회 + 통화 환산(plan). 서버 함수 프록시로 공식 과세환율을 받아
 * 환율표와 환산기를 제공한다. 수출자 앱이므로 수출용 기본.
 */
export function CustomsFxTool() {
  const { t } = useTranslation();
  const [type, setType] = useState<FxType>("export");
  const [date, setDate] = useState<string>(""); // YYYYMMDD, ""=최근
  const [data, setData] = useState<FxResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 환산기 상태
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("KRW");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(false);
    fetchFxRates(type, date || undefined)
      .then((res) => {
        if (alive) setData(res);
      })
      .catch(() => {
        if (alive) setError(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [type, date]);

  const converted = useMemo(() => {
    if (!data) return null;
    const n = Number(amount.replace(/,/g, ""));
    if (!Number.isFinite(n)) return null;
    return convert(n, from, to, data.rates);
  }, [amount, from, to, data]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:p-8 space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{t("tools.fx.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("tools.fx.desc")}</p>
      </div>

      {/* 수출/수입 토글 + 기준일 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
          {(["export", "import"] as FxType[]).map((ty) => (
            <button
              key={ty}
              type="button"
              onClick={() => setType(ty)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                type === ty ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`fx.${ty}`)}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          {t("fx.baseDate")}
          <input
            type="date"
            value={data ? toDateInput(date || data.baseDate) : toDateInput(date)}
            onChange={(e) => setDate(e.target.value.replace(/-/g, ""))}
            className="rounded-md border border-input bg-card px-2 py-1 text-foreground"
          />
        </label>
      </div>

      {data?.source === "fixture" && (
        <p className="flex items-center gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          {t("fx.fixtureNotice")}
        </p>
      )}

      {/* 환산기 */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">{t("fx.converter")}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            {t("fx.amount")}
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-md border border-input bg-card px-3 py-2 text-base text-foreground"
            />
          </label>
          <Select label={t("fx.from")} options={CURRENCY_OPTIONS} value={from} onChange={(e) => setFrom(e.target.value)} />
          <Select label={t("fx.to")} options={CURRENCY_OPTIONS} value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">{t("fx.result")}</p>
          <p className="text-2xl font-semibold text-primary">
            {converted == null
              ? t("fx.noRate")
              : `${converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${to}`}
          </p>
        </div>
      </div>

      {/* 환율표 */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2">{t("fx.currency")}</th>
              <th className="px-4 py-2 text-right">{t("fx.rate")} (KRW)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="px-4 py-10 text-center text-muted-foreground">
                  <Loader2 className="mx-auto size-5 animate-spin" aria-hidden />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-destructive">
                  {t("fx.loadFailed")}
                </td>
              </tr>
            ) : (
              data?.rates.map((r) => (
                <tr key={r.currency} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-2 font-medium text-foreground">{r.currency}</td>
                  <td className="px-4 py-2 text-right font-mono text-foreground">
                    {r.rate.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

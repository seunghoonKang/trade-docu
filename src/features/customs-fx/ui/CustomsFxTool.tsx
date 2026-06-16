import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import { DatePicker, Input, Select, Skeleton } from "@/shared/ui";
import { CURRENCY_OPTIONS } from "@/shared/config";
import type { FxResponse, FxType } from "../model/types";
import { fetchFxRates } from "../api/rates";
import { convert } from "../lib/convert";

/** YYYYMMDD → YYYY-MM-DD (DatePicker 표시용). */
function toDateInput(yyyymmdd: string): string {
  return /^\d{8}$/.test(yyyymmdd)
    ? `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`
    : "";
}

/**
 * 관세청 고시환율 조회 + 통화 환산(plan). 서버 함수 프록시로 공식 과세환율을 받아
 * 환율표와 환산기를 제공한다. 수출자 앱이므로 수출용 기본.
 */
export function CustomsFxTool() {
  const { t } = useTranslation();
  const [type, setType] = useState<FxType>("export");
  const [date, setDate] = useState<string>(""); // YYYY-MM-DD, ""=최근
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
    fetchFxRates(type, date ? date.replace(/-/g, "") : undefined)
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

  const typeOptions = [
    { value: "export", label: t("fx.export") },
    { value: "import", label: t("fx.import") },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:p-8 space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{t("tools.fx.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("tools.fx.desc")}</p>
      </div>

      {/* 수출/수입 + 기준일 (공용 Select·DatePicker) */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-36">
          <Select
            variant="editor"
            label={t("fx.type")}
            options={typeOptions}
            value={type}
            onChange={(e) => setType(e.target.value as FxType)}
          />
        </div>
        <div className="w-48">
          <DatePicker
            variant="editor"
            label={t("fx.baseDate")}
            value={date || toDateInput(data?.baseDate ?? "")}
            onChange={(v) => setDate(v)}
          />
        </div>
      </div>

      {data?.source === "fixture" && (
        <p className="flex items-center gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          {t("fx.fixtureNotice")}
        </p>
      )}

      {/* 환산기 (공용 Input·Select) */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">{t("fx.converter")}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            variant="editor"
            label={t("fx.amount")}
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Select
            variant="editor"
            label={t("fx.from")}
            options={CURRENCY_OPTIONS}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <Select
            variant="editor"
            label={t("fx.to")}
            options={CURRENCY_OPTIONS}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
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
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-2.5">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end">
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-destructive">
                  {t("fx.loadFailed")}
                </td>
              </tr>
            ) : (
              data?.rates.map((r) => (
                <tr key={r.currency} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-2 font-medium text-foreground">
                    {r.currency}
                    {r.name ? <span className="ml-2 text-xs text-muted-foreground">{r.name}</span> : null}
                  </td>
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

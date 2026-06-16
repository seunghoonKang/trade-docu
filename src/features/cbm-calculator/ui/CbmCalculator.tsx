import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import { Button, Input, Select } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import type { CartonRow, LengthUnit } from "../model/types";
import { containerFill, sumTotals } from "../lib/calc";

const UNITS: LengthUnit[] = ["cm", "mm", "inch"];

function emptyRow(id: string): CartonRow {
  return { id, length: "", width: "", height: "", qty: "", weight: "" };
}

function fmt(n: number, digits: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

/**
 * CBM·부피중량·컨테이너 적재 계산기(plan: 순수 클라이언트, 일회성, 무역 특화).
 * 다중 카톤행을 합산해 총 CBM, 실/부피/청구중량, 컨테이너별 적재를 보여준다.
 */
export function CbmCalculator() {
  const { t } = useTranslation();
  const idRef = useRef(1);
  const [unit, setUnit] = useState<LengthUnit>("cm");
  const [rows, setRows] = useState<CartonRow[]>([emptyRow("0")]);

  const totals = useMemo(() => sumTotals(rows, unit), [rows, unit]);
  const fits = useMemo(() => containerFill(totals.totalCbm), [totals.totalCbm]);

  function setCell(id: string, key: keyof CartonRow, value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  }
  function addRow() {
    setRows((prev) => [...prev, emptyRow(String(idRef.current++))]);
  }
  function deleteRow(id: string) {
    setRows((prev) => (prev.length <= 1 ? [emptyRow(String(idRef.current++))] : prev.filter((r) => r.id !== id)));
  }

  const fields: { key: keyof CartonRow; labelKey: string; suffix: string }[] = [
    { key: "length", labelKey: "cbm.length", suffix: ` (${unit})` },
    { key: "width", labelKey: "cbm.width", suffix: ` (${unit})` },
    { key: "height", labelKey: "cbm.height", suffix: ` (${unit})` },
    { key: "qty", labelKey: "cbm.qty", suffix: "" },
    { key: "weight", labelKey: "cbm.weight", suffix: " (kg)" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:p-8 space-y-6 pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{t("tools.cbm.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("tools.cbm.desc")}</p>
        </div>
        {/* 단위 — 공용 Select */}
        <div className="w-28">
          <Select
            variant="editor"
            label={t("cbm.unit")}
            options={UNITS.map((u) => ({ value: u, label: u }))}
            value={unit}
            onChange={(e) => setUnit(e.target.value as LengthUnit)}
          />
        </div>
      </div>

      {/* 입력 테이블 — 공용 Input */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {fields.map((f) => (
                <th key={f.key} className="px-2 py-2">
                  {t(f.labelKey)}
                  {f.suffix}
                </th>
              ))}
              <th className="w-10 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-b-0">
                {fields.map((f) => (
                  <td key={f.key} className="min-w-[6rem] p-1">
                    <Input
                      variant="editor"
                      inputMode="decimal"
                      value={r[f.key]}
                      onChange={(e) => setCell(r.id, f.key, e.target.value)}
                    />
                  </td>
                ))}
                <td className="px-1 text-center">
                  <button
                    type="button"
                    className="rounded p-1 text-muted-foreground/60 hover:bg-accent hover:text-destructive"
                    aria-label={t("cbm.deleteRow")}
                    title={t("cbm.deleteRow")}
                    onClick={() => deleteRow(r.id)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="ghost" size="sm" className="gap-1.5" onClick={addRow}>
        <Plus className="size-4 shrink-0" aria-hidden />
        {t("cbm.addRow")}
      </Button>

      {/* 결과 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Metric label={t("cbm.totalCbm")} value={`${fmt(totals.totalCbm, 4)} m³`} primary />
        <Metric label={t("cbm.totalCartons")} value={fmt(totals.totalCartons, 0)} />
        <Metric label={t("cbm.totalGrossWeight")} value={`${fmt(totals.totalGrossWeight, 2)} kg`} />
        <Metric label={t("cbm.volumetricAir")} value={`${fmt(totals.totalVolumetricAir, 2)} kg`} />
        <Metric label={t("cbm.chargeableAir")} value={`${fmt(totals.chargeableAir, 2)} kg`} />
      </div>

      {/* 컨테이너 적재 */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-foreground">{t("cbm.containerFill")}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {fits.map((f) => (
            <div key={f.name} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-baseline justify-between">
                <span className="font-semibold text-foreground">{f.name}</span>
                <span className="text-xs text-muted-foreground">{f.capacityCbm} m³</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-primary">{fmt(f.containersNeeded, 0)}</p>
              <p className="text-xs text-muted-foreground">
                {t("cbm.containersNeeded")} · {t("cbm.utilization")} {fmt(f.utilizationPercent, 0)}%
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{t("cbm.hint")}</p>
      </div>
    </div>
  );
}

function Metric({ label, value, primary }: { label: string; value: string; primary?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-lg font-semibold", primary ? "text-primary" : "text-foreground")}>{value}</p>
    </div>
  );
}

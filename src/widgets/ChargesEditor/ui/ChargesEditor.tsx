import { Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AdditionalCharge, ChargeType } from "@/entities/invoice";
import { createEmptyCharge } from "@/entities/invoice";
import { cn } from "@/shared/lib/utils";

const CHARGE_TYPES: ChargeType[] = ["freight", "insurance", "fee", "tax", "other"];

/**
 * 유형별 비용 라인 편집(운임/보험/수수료/세금/기타). 제어 컴포넌트 — 값/onChange만 받는다.
 * PI는 거래 건, CI는 선적 레벨에서 사용한다(CONTEXT.md).
 */
export function ChargesEditor({
  charges,
  currency,
  onChange,
}: {
  charges: AdditionalCharge[];
  currency: string;
  onChange: (charges: AdditionalCharge[]) => void;
}) {
  const { t } = useTranslation();

  function update(index: number, patch: Partial<AdditionalCharge>) {
    onChange(charges.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  return (
    <div className="space-y-3">
      {charges.map((charge, i) => (
        <div key={i} className="flex items-center gap-2">
          <select
            className="w-32 rounded border border-border px-2 py-1.5 text-sm"
            value={charge.type ?? "other"}
            onChange={(e) => update(i, { type: e.target.value as ChargeType })}
          >
            {CHARGE_TYPES.map((ct) => (
              <option key={ct} value={ct}>
                {t(`form.chargeTypes.${ct}`)}
              </option>
            ))}
          </select>
          <input
            className="flex-1 rounded border border-border px-2 py-1.5 text-sm"
            placeholder={t("form.chargeDescription")}
            value={charge.description}
            onChange={(e) => update(i, { description: e.target.value })}
          />
          <input
            type="number"
            min={0}
            step="0.01"
            className={cn("w-28 rounded border border-border px-2 py-1.5 text-right text-sm tabular-nums")}
            placeholder={t("form.amountWithCurrency", { currency })}
            value={charge.amount || ""}
            onChange={(e) => update(i, { amount: Number(e.target.value) || 0 })}
          />
          <button
            type="button"
            onClick={() => onChange(charges.filter((_, idx) => idx !== i))}
            className="text-muted-foreground hover:text-red-600"
            aria-label={t("form.removeCharge")}
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...charges, createEmptyCharge()])}
        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-2 text-xs font-semibold uppercase tracking-wide text-secondary-foreground transition-colors hover:bg-muted"
      >
        <Plus className="size-4" aria-hidden />
        {t("form.addCharge")}
      </button>
    </div>
  );
}

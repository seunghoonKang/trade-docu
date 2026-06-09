import { CirclePlus, Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FormSection } from "@/shared/ui";
import { editorInputClassName, editorInlineDismissButtonClassName } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import type { AdditionalCharge } from "@/entities/invoice";

interface Props {
  charges: AdditionalCharge[];
  currency: string;
  onUpdateCharge: (index: number, field: keyof AdditionalCharge, value: string | number) => void;
  onAddCharge: () => void;
  onRemoveCharge: (index: number) => void;
}

export function AdditionalChargesSection({ charges, currency, onUpdateCharge, onAddCharge, onRemoveCharge }: Props) {
  const { t } = useTranslation();
  return (
    <FormSection title={t("form.additionalCharges")} icon={CirclePlus} variant="card">
      <div className="space-y-4">
        {charges.map((charge, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex-1">
              <input
                className={editorInputClassName}
                placeholder={t("form.chargeDescription")}
                value={charge.description}
                onChange={(e) => onUpdateCharge(i, "description", e.target.value)}
              />
            </div>
            <div className="w-36">
              <input
                className={cn(editorInputClassName, "text-right")}
                type="number"
                min="0"
                step="0.01"
                placeholder={t("form.amountWithCurrency", { currency })}
                value={charge.amount || ""}
                onChange={(e) => onUpdateCharge(i, "amount", Number(e.target.value))}
              />
            </div>
            <button
              type="button"
              onClick={() => onRemoveCharge(i)}
              className={editorInlineDismissButtonClassName}
              aria-label={t("form.removeCharge")}
            >
              <X className="size-3.5" strokeWidth={2.5} aria-hidden />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={onAddCharge}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-2.5 text-xs font-semibold uppercase tracking-wide text-secondary-foreground transition-colors hover:bg-muted"
        >
          <Plus className="size-4" aria-hidden />
          {t("form.addCharge")}
        </button>
      </div>
    </FormSection>
  );
}

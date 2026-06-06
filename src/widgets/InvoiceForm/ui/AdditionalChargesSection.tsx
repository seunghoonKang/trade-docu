import { CirclePlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui";
import { FormSection } from "@/shared/ui";
import { editorInlineInputClassName } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import type { AdditionalCharge } from "@/entities/invoice/model";

interface Props {
  charges: AdditionalCharge[];
  onUpdateCharge: (index: number, field: keyof AdditionalCharge, value: string | number) => void;
  onAddCharge: () => void; onRemoveCharge: (index: number) => void;
}

export function AdditionalChargesSection({ charges, onUpdateCharge, onAddCharge, onRemoveCharge }: Props) {
  const { t } = useTranslation();
  return (
    <FormSection title={t("form.additionalCharges")} icon={CirclePlus} variant="card">
      {charges.map((charge, i) => (
        <div key={i} className="flex items-end gap-3">
          <div className="flex-1">
            <input
              className={editorInlineInputClassName}
              placeholder={t("form.description")}
              value={charge.description}
              onChange={(e) => onUpdateCharge(i, "description", e.target.value)}
            />
          </div>
          <div className="w-32">
            <input
              className={cn(editorInlineInputClassName, "text-right")}
              type="number"
              min="0"
              step="0.01"
              placeholder={t("form.amount")}
              value={charge.amount || ""}
              onChange={(e) => onUpdateCharge(i, "amount", Number(e.target.value))}
            />
          </div>
          <Button variant="ghost" size="sm" onClick={() => onRemoveCharge(i)}>{t("form.removeCharge")}</Button>
        </div>
      ))}
      <Button variant="secondary" size="sm" onClick={onAddCharge}>+ {t("form.addCharge")}</Button>
    </FormSection>
  );
}

import { useTranslation } from "react-i18next";
import { Button } from "../../shared/ui/Button";
import { FormSection } from "../../shared/ui/FormSection";
import type { AdditionalCharge } from "../../entities/invoice/model";

interface Props {
  charges: AdditionalCharge[];
  onUpdateCharge: (index: number, field: keyof AdditionalCharge, value: string | number) => void;
  onAddCharge: () => void; onRemoveCharge: (index: number) => void;
}

export function AdditionalChargesSection({ charges, onUpdateCharge, onAddCharge, onRemoveCharge }: Props) {
  const { t } = useTranslation();
  return (
    <FormSection title={t("form.additionalCharges")}>
      {charges.map((charge, i) => (
        <div key={i} className="flex gap-3 items-end">
          <div className="flex-1">
            <input className="w-full px-3 py-2 text-sm border border-gray-200 rounded" placeholder={t("form.description")} value={charge.description} onChange={(e) => onUpdateCharge(i, "description", e.target.value)} />
          </div>
          <div className="w-32">
            <input className="w-full px-3 py-2 text-sm border border-gray-200 rounded text-right" type="number" min="0" step="0.01" placeholder={t("form.amount")} value={charge.amount || ""} onChange={(e) => onUpdateCharge(i, "amount", Number(e.target.value))} />
          </div>
          <Button variant="ghost" size="sm" onClick={() => onRemoveCharge(i)}>{t("form.removeCharge")}</Button>
        </div>
      ))}
      <Button variant="secondary" size="sm" onClick={onAddCharge}>+ {t("form.addCharge")}</Button>
    </FormSection>
  );
}

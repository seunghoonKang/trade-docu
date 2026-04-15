import { useTranslation } from "react-i18next";
import { Input } from "../../shared/ui/Input";
import { DatePicker } from "../../shared/ui/DatePicker";
import { FormSection } from "../../shared/ui/FormSection";

interface Props {
  invoiceNo: string; refNo: string; orderNo: string; date: string; validity: string;
  onUpdate: (key: string, value: string) => void;
}

export function DocumentInfoSection({ invoiceNo, refNo, orderNo, date, validity, onUpdate }: Props) {
  const { t } = useTranslation();
  return (
    <FormSection title={t("form.documentInfo")}>
      <div className="grid grid-cols-2 gap-3">
        <Input label={t("form.invoiceNo")} value={invoiceNo} onChange={(e) => onUpdate("invoiceNo", e.target.value)} />
        <DatePicker label={t("form.date")} value={date} onChange={(v) => onUpdate("date", v)} />
        <Input label={t("form.refNo")} value={refNo} onChange={(e) => onUpdate("refNo", e.target.value)} />
        <Input label={t("form.orderNo")} value={orderNo} onChange={(e) => onUpdate("orderNo", e.target.value)} />
        <DatePicker label={t("form.validity")} value={validity} onChange={(v) => onUpdate("validity", v)} />
      </div>
    </FormSection>
  );
}

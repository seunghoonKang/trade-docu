import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/shared/ui";
import { DatePicker } from "@/shared/ui";
import { FormSection } from "@/shared/ui";

interface Props {
  invoiceNo: string; refNo: string; orderNo: string; date: string; validity: string;
  onUpdate: (key: string, value: string) => void;
}

export function DocumentInfoSection({ invoiceNo, refNo, orderNo, date, validity, onUpdate }: Props) {
  const { t } = useTranslation();
  return (
    <FormSection title={t("form.documentInfo")} icon={Info} variant="card">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input variant="editor" label={t("form.invoiceNo")} value={invoiceNo} onChange={(e) => onUpdate("invoiceNo", e.target.value)} />
        <DatePicker variant="editor" label={t("form.date")} value={date} onChange={(v) => onUpdate("date", v)} />
        <Input variant="editor" label={t("form.refNo")} value={refNo} onChange={(e) => onUpdate("refNo", e.target.value)} />
        <Input variant="editor" label={t("form.orderNo")} value={orderNo} onChange={(e) => onUpdate("orderNo", e.target.value)} />
        <DatePicker variant="editor" label={t("form.validity")} value={validity} onChange={(v) => onUpdate("validity", v)} />
      </div>
    </FormSection>
  );
}

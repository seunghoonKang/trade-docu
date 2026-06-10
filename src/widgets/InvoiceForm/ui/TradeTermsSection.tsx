import { Handshake } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/shared/ui";
import { Select } from "@/shared/ui";
import { FormSection } from "@/shared/ui";

interface Props {
  commodity: string; currency: string; paymentTerms: string; incoterms: string;
  delivery: string; packing: string; remarks: string; originCountry: string;
  onUpdate: (key: string, value: string) => void;
}

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD" }, { value: "EUR", label: "EUR" },
  { value: "KRW", label: "KRW" }, { value: "JPY", label: "JPY" },
  { value: "CNY", label: "CNY" }, { value: "GBP", label: "GBP" },
];

const INCOTERMS_OPTIONS = [
  { value: "FOB", label: "FOB" }, { value: "CIF", label: "CIF" },
  { value: "CFR", label: "CFR" }, { value: "EXW", label: "EXW" },
  { value: "DDP", label: "DDP" }, { value: "DAP", label: "DAP" },
];

export function TradeTermsSection({ commodity, currency, paymentTerms, incoterms, delivery, packing, remarks, originCountry, onUpdate }: Props) {
  const { t } = useTranslation();
  return (
    <FormSection title={t("form.tradeTerms")} icon={Handshake} variant="card">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input variant="editor" label={t("form.commodity")} value={commodity} onChange={(e) => onUpdate("commodity", e.target.value)} className="sm:col-span-2" />
        <Select variant="editor" label={t("form.currency")} options={CURRENCY_OPTIONS} value={currency} onChange={(e) => onUpdate("currency", e.target.value)} />
        <Select variant="editor" label={t("form.incoterms")} options={INCOTERMS_OPTIONS} value={incoterms} onChange={(e) => onUpdate("incoterms", e.target.value)} />
        <Input variant="editor" label={t("form.paymentTerms")} value={paymentTerms} onChange={(e) => onUpdate("paymentTerms", e.target.value)} />
        <Input variant="editor" label={t("form.originCountry")} value={originCountry} onChange={(e) => onUpdate("originCountry", e.target.value)} />
        <Input variant="editor" label={t("form.delivery")} value={delivery} onChange={(e) => onUpdate("delivery", e.target.value)} />
        <Input variant="editor" label={t("form.packing")} value={packing} onChange={(e) => onUpdate("packing", e.target.value)} />
        <Input variant="editor" label={t("form.remarks")} value={remarks} onChange={(e) => onUpdate("remarks", e.target.value)} />
      </div>
    </FormSection>
  );
}

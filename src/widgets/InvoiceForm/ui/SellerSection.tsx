import { Store } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input, Textarea } from "@/shared/ui";
import { FormSection } from "@/shared/ui";

interface Props {
  companyName: string; address: string; tel: string; fax: string; representative: string;
  onUpdate: (key: string, value: string) => void;
}

export function SellerSection({ companyName, address, tel, fax, representative, onUpdate }: Props) {
  const { t } = useTranslation();
  return (
    <FormSection title={t("form.seller")} icon={Store} variant="card">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input variant="editor" label={t("form.companyName")} value={companyName} onChange={(e) => onUpdate("sellerCompanyName", e.target.value)} />
        <Input variant="editor" label={t("form.representative")} value={representative} onChange={(e) => onUpdate("sellerRepresentative", e.target.value)} />
        <Textarea variant="editor" label={t("form.address")} value={address} onChange={(e) => onUpdate("sellerAddress", e.target.value)} rows={2} className="sm:col-span-2" />
        <Input variant="editor" label={t("form.tel")} value={tel} onChange={(e) => onUpdate("sellerTel", e.target.value)} />
        <Input variant="editor" label={t("form.fax")} value={fax} onChange={(e) => onUpdate("sellerFax", e.target.value)} />
      </div>
    </FormSection>
  );
}

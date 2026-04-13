import { useTranslation } from "react-i18next";
import { Input } from "../../shared/ui/Input";
import { FormSection } from "../../shared/ui/FormSection";

interface Props {
  companyName: string; address: string; tel: string; fax: string; representative: string;
  onUpdate: (key: string, value: string) => void;
}

export function SellerSection({ companyName, address, tel, fax, representative, onUpdate }: Props) {
  const { t } = useTranslation();
  return (
    <FormSection title={t("form.seller")}>
      <div className="grid grid-cols-2 gap-3">
        <Input label={t("form.companyName")} value={companyName} onChange={(e) => onUpdate("sellerCompanyName", e.target.value)} />
        <Input label={t("form.representative")} value={representative} onChange={(e) => onUpdate("sellerRepresentative", e.target.value)} />
        <Input label={t("form.address")} value={address} onChange={(e) => onUpdate("sellerAddress", e.target.value)} className="col-span-2" />
        <Input label={t("form.tel")} value={tel} onChange={(e) => onUpdate("sellerTel", e.target.value)} />
        <Input label={t("form.fax")} value={fax} onChange={(e) => onUpdate("sellerFax", e.target.value)} />
      </div>
    </FormSection>
  );
}

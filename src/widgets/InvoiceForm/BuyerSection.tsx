import { useTranslation } from "react-i18next";
import { Input } from "../../shared/ui/Input";
import { FormSection } from "../../shared/ui/FormSection";
import { BuyerSelect } from "../../features/buyer-management/ui/BuyerSelect";
import type { Buyer } from "../../entities/buyer/model";

interface Props {
  companyName: string; address: string; tel: string; contactPerson: string;
  onUpdate: (key: string, value: string) => void;
}

export function BuyerSection({ companyName, address, tel, contactPerson, onUpdate }: Props) {
  const { t } = useTranslation();
  return (
    <FormSection title={t("form.buyer")}>
      <BuyerSelect onSelect={(buyer: Buyer) => {
        onUpdate("companyName", buyer.companyName);
        onUpdate("address", buyer.address);
        onUpdate("tel", buyer.tel);
        onUpdate("contactPerson", buyer.contactPerson);
      }} />
      <div className="grid grid-cols-2 gap-3">
        <Input label={t("form.companyName")} value={companyName} onChange={(e) => onUpdate("companyName", e.target.value)} />
        <Input label={t("form.contactPerson")} value={contactPerson} onChange={(e) => onUpdate("contactPerson", e.target.value)} />
        <Input label={t("form.address")} value={address} onChange={(e) => onUpdate("address", e.target.value)} className="col-span-2" />
        <Input label={t("form.tel")} value={tel} onChange={(e) => onUpdate("tel", e.target.value)} />
      </div>
    </FormSection>
  );
}

import { User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input, Textarea } from "@/shared/ui";
import { FormSection } from "@/shared/ui";
import { BuyerSelect } from "@/features/buyer-management";
import type { Buyer } from "@/entities/buyer/model";

interface Props {
  companyName: string; address: string; tel: string; contactPerson: string;
  onUpdate: (key: string, value: string) => void;
}

export function BuyerSection({ companyName, address, tel, contactPerson, onUpdate }: Props) {
  const { t } = useTranslation();
  return (
    <FormSection title={t("form.buyer")} icon={User} variant="card">
      <BuyerSelect onSelect={(buyer: Buyer) => {
        onUpdate("companyName", buyer.companyName);
        onUpdate("address", buyer.address);
        onUpdate("tel", buyer.tel);
        onUpdate("contactPerson", buyer.contactPerson);
      }} />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input variant="editor" label={t("form.companyName")} required value={companyName} onChange={(e) => onUpdate("companyName", e.target.value)} />
        <Input variant="editor" label={t("form.contactPerson")} value={contactPerson} onChange={(e) => onUpdate("contactPerson", e.target.value)} />
        <Textarea variant="editor" label={t("form.address")} value={address} onChange={(e) => onUpdate("address", e.target.value)} rows={2} className="sm:col-span-2" />
        <Input variant="editor" label={t("form.tel")} value={tel} onChange={(e) => onUpdate("tel", e.target.value)} />
      </div>
    </FormSection>
  );
}

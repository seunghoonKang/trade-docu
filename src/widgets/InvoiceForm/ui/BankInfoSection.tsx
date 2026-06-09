import { Landmark } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/shared/ui";
import { FormSection } from "@/shared/ui";
import type { BankInfo } from "@/shared/lib/bankInfo";

interface Props {
  bankInfo: BankInfo;
  onUpdate: (key: keyof BankInfo, value: string) => void;
}

export function BankInfoSection({ bankInfo, onUpdate }: Props) {
  const { t } = useTranslation();
  return (
    <FormSection title={t("form.bankInfo")} icon={Landmark} variant="card">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input variant="editor" label={t("form.bankName")} value={bankInfo.bankName} onChange={(e) => onUpdate("bankName", e.target.value)} />
        <Input variant="editor" label={t("form.bankSwift")} value={bankInfo.bankSwift} onChange={(e) => onUpdate("bankSwift", e.target.value)} />
        <Input variant="editor" label={t("form.accountNo")} value={bankInfo.accountNo} onChange={(e) => onUpdate("accountNo", e.target.value)} />
        <Input variant="editor" label={t("form.accountee")} value={bankInfo.accountee} onChange={(e) => onUpdate("accountee", e.target.value)} />
        <Input variant="editor" label={t("form.bankAddress")} value={bankInfo.bankAddress} onChange={(e) => onUpdate("bankAddress", e.target.value)} className="sm:col-span-2" />
        <Input variant="editor" label={t("form.bankTel")} value={bankInfo.bankTel} onChange={(e) => onUpdate("bankTel", e.target.value)} />
        <Input variant="editor" label={t("form.bankFax")} value={bankInfo.bankFax} onChange={(e) => onUpdate("bankFax", e.target.value)} />
      </div>
    </FormSection>
  );
}

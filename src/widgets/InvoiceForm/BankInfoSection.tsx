import { useTranslation } from "react-i18next";
import { Input } from "../../shared/ui/Input";
import { FormSection } from "../../shared/ui/FormSection";
import type { BankInfo } from "../../entities/bank-info/model";

interface Props {
  bankInfo: BankInfo;
  onUpdate: (key: keyof BankInfo, value: string) => void;
}

export function BankInfoSection({ bankInfo, onUpdate }: Props) {
  const { t } = useTranslation();
  return (
    <FormSection title={t("form.bankInfo")}>
      <div className="grid grid-cols-2 gap-3">
        <Input label={t("form.bankName")} value={bankInfo.bankName} onChange={(e) => onUpdate("bankName", e.target.value)} />
        <Input label={t("form.bankSwift")} value={bankInfo.bankSwift} onChange={(e) => onUpdate("bankSwift", e.target.value)} />
        <Input label={t("form.accountNo")} value={bankInfo.accountNo} onChange={(e) => onUpdate("accountNo", e.target.value)} />
        <Input label={t("form.accountee")} value={bankInfo.accountee} onChange={(e) => onUpdate("accountee", e.target.value)} />
        <Input label={t("form.bankAddress")} value={bankInfo.bankAddress} onChange={(e) => onUpdate("bankAddress", e.target.value)} className="col-span-2" />
        <Input label={t("form.bankTel")} value={bankInfo.bankTel} onChange={(e) => onUpdate("bankTel", e.target.value)} />
        <Input label={t("form.bankFax")} value={bankInfo.bankFax} onChange={(e) => onUpdate("bankFax", e.target.value)} />
      </div>
    </FormSection>
  );
}

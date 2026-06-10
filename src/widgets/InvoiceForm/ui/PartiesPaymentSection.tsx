import { Landmark } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input, Textarea, FormSection, editorInputClassName } from "@/shared/ui";
import type { BuyerSnapshot, LcInfoForm } from "@/entities/invoice";

const PAYMENT_METHODS = ["T/T", "L/C", "ADVANCE", "OTHER"] as const;

interface Props {
  consignee: BuyerSnapshot | null;
  notify: BuyerSnapshot | null;
  paymentMethod: string;
  lcInfo: LcInfoForm;
  onToggleParty: (party: "consignee" | "notify", separate: boolean) => void;
  onUpdateParty: (party: "consignee" | "notify", key: keyof BuyerSnapshot, value: string) => void;
  onUpdatePaymentMethod: (value: string) => void;
  onUpdateLcInfo: (key: keyof LcInfoForm, value: string) => void;
}

export function PartiesPaymentSection({
  consignee,
  notify,
  paymentMethod,
  lcInfo,
  onToggleParty,
  onUpdateParty,
  onUpdatePaymentMethod,
  onUpdateLcInfo,
}: Props) {
  const { t } = useTranslation();

  return (
    <FormSection title={t("form.partiesPayment")} icon={Landmark} variant="card">
      <div className="space-y-5">
        <PartyBlock kind="consignee" label={t("form.consignee")} party={consignee} onToggle={onToggleParty} onUpdate={onUpdateParty} />
        <PartyBlock kind="notify" label={t("form.notifyParty")} party={notify} onToggle={onToggleParty} onUpdate={onUpdateParty} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-secondary-foreground">{t("form.paymentMethod")}</span>
            <select
              className={editorInputClassName}
              value={paymentMethod || ""}
              onChange={(e) => onUpdatePaymentMethod(e.target.value)}
            >
              <option value="">{t("form.paymentSelect")}</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m === "OTHER" ? t("form.paymentOther") : m}
                </option>
              ))}
            </select>
          </label>
        </div>

        {paymentMethod === "L/C" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input variant="editor" label={t("form.lcNo")} value={lcInfo.no} onChange={(e) => onUpdateLcInfo("no", e.target.value)} />
            <Input variant="editor" label={t("form.lcBank")} value={lcInfo.issuingBank} onChange={(e) => onUpdateLcInfo("issuingBank", e.target.value)} />
            <Input variant="editor" label={t("form.lcDate")} type="date" value={lcInfo.date} onChange={(e) => onUpdateLcInfo("date", e.target.value)} />
          </div>
        )}
      </div>
    </FormSection>
  );
}

function PartyBlock({
  kind,
  label,
  party,
  onToggle,
  onUpdate,
}: {
  kind: "consignee" | "notify";
  label: string;
  party: BuyerSnapshot | null;
  onToggle: (party: "consignee" | "notify", separate: boolean) => void;
  onUpdate: (party: "consignee" | "notify", key: keyof BuyerSnapshot, value: string) => void;
}) {
  const { t } = useTranslation();
  const separate = party !== null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-secondary-foreground">{label}</span>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={!separate} onChange={(e) => onToggle(kind, !e.target.checked)} />
          {t("form.sameAsBuyer")}
        </label>
      </div>
      {separate && party && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input variant="editor" label={t("form.companyName")} value={party.companyName} onChange={(e) => onUpdate(kind, "companyName", e.target.value)} />
          <Input variant="editor" label={t("form.contactPerson")} value={party.contactPerson} onChange={(e) => onUpdate(kind, "contactPerson", e.target.value)} />
          <Textarea variant="editor" label={t("form.address")} value={party.address} onChange={(e) => onUpdate(kind, "address", e.target.value)} rows={2} className="sm:col-span-2" />
          <Input variant="editor" label={t("form.tel")} value={party.tel} onChange={(e) => onUpdate(kind, "tel", e.target.value)} />
        </div>
      )}
    </div>
  );
}

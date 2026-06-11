import { Landmark } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input, Select, Textarea, FormSection } from "@/shared/ui";
import { BuyerPicker, buyerToPartySnapshot } from "@/features/buyer-management";
import type { BuyerSnapshot, LcInfoForm } from "@/entities/invoice";
import { partyDisplayValues } from "../lib/partyMirror";

const PAYMENT_METHODS = ["T/T", "L/C", "ADVANCE", "OTHER"] as const;

interface Props {
  buyer: BuyerSnapshot;
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
  buyer,
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
        <PartyBlock kind="consignee" label={t("form.consignee")} buyer={buyer} party={consignee} onToggle={onToggleParty} onUpdate={onUpdateParty} />
        <PartyBlock kind="notify" label={t("form.notifyParty")} buyer={buyer} party={notify} onToggle={onToggleParty} onUpdate={onUpdateParty} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            variant="editor"
            label={t("form.paymentMethod")}
            value={paymentMethod || ""}
            onChange={(e) => onUpdatePaymentMethod(e.target.value)}
            options={[
              { value: "", label: t("form.paymentSelect") },
              ...PAYMENT_METHODS.map((m) => ({
                value: m,
                label: m === "OTHER" ? t("form.paymentOther") : m,
              })),
            ]}
          />
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
  buyer,
  party,
  onToggle,
  onUpdate,
}: {
  kind: "consignee" | "notify";
  label: string;
  buyer: BuyerSnapshot;
  party: BuyerSnapshot | null;
  onToggle: (party: "consignee" | "notify", separate: boolean) => void;
  onUpdate: (party: "consignee" | "notify", key: keyof BuyerSnapshot, value: string) => void;
}) {
  const { t } = useTranslation();
  const separate = party !== null;
  // 동일 상태에서는 구매자 값을 disabled 인풋에 미러링한다(#49).
  const values = partyDisplayValues(buyer, party);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-secondary-foreground">{label}</span>
        <div className="flex items-center gap-3">
          {separate && (
            <BuyerPicker
              onSelect={(selected) => {
                const snapshot = buyerToPartySnapshot(selected);
                (Object.keys(snapshot) as (keyof typeof snapshot)[]).forEach((key) => {
                  onUpdate(kind, key, snapshot[key]);
                });
              }}
            />
          )}
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={!separate} onChange={(e) => onToggle(kind, !e.target.checked)} />
            {t("form.sameAsBuyer")}
          </label>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input variant="editor" label={t("form.companyName")} disabled={!separate} value={values.companyName} onChange={(e) => onUpdate(kind, "companyName", e.target.value)} />
        <Input variant="editor" label={t("form.contactPerson")} disabled={!separate} value={values.contactPerson} onChange={(e) => onUpdate(kind, "contactPerson", e.target.value)} />
        <Textarea variant="editor" label={t("form.address")} disabled={!separate} value={values.address} onChange={(e) => onUpdate(kind, "address", e.target.value)} rows={2} className="sm:col-span-2" />
        <Input variant="editor" label={t("form.tel")} disabled={!separate} value={values.tel} onChange={(e) => onUpdate(kind, "tel", e.target.value)} />
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import { Button, Input, ModalShell, Textarea } from "@/shared/ui";
import type { Buyer } from "@/entities/buyer";
import type { BuyerInput } from "../api";
import { hasDuplicateCompanyName } from "../lib";

interface Props {
  open: boolean;
  /** null = 신규 생성, Buyer = 수정. */
  initial: Buyer | null;
  /** 중복 회사명 경고용 전체 목록(저장은 허용, #49). */
  buyers: Buyer[];
  saving?: boolean;
  onSubmit: (values: BuyerInput) => void;
  onClose: () => void;
}

const EMPTY: BuyerInput = { companyName: "", address: "", tel: "", contactPerson: "" };

/** 거래처 생성/수정 모달 — picker의 '추가하기'와 관리 페이지가 공유한다. */
export function BuyerFormModal({ open, initial, buyers, saving, onSubmit, onClose }: Props) {
  const { t } = useTranslation();
  const [values, setValues] = useState<BuyerInput>(EMPTY);

  useEffect(() => {
    if (!open) return;
    setValues(
      initial
        ? {
            companyName: initial.companyName,
            address: initial.address,
            tel: initial.tel,
            contactPerson: initial.contactPerson,
          }
        : EMPTY,
    );
  }, [open, initial]);

  if (!open) return null;

  const duplicate = hasDuplicateCompanyName(buyers, values.companyName, initial?.id);
  const canSave = values.companyName.trim().length > 0 && !saving;

  const update = (key: keyof BuyerInput, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  return (
    <ModalShell open={open} labelledBy="buyer-form-modal-title" onClose={onClose} className="max-w-lg">
      <h2 id="buyer-form-modal-title" className="text-lg font-semibold text-primary">
        {initial ? t("buyers.editTitle") : t("buyers.addTitle")}
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-4">
        <Input
          variant="editor"
          label={t("form.companyName")}
          required
          value={values.companyName}
          onChange={(e) => update("companyName", e.target.value)}
        />
        <Input
          variant="editor"
          label={t("form.contactPerson")}
          value={values.contactPerson}
          onChange={(e) => update("contactPerson", e.target.value)}
        />
        <Textarea
          variant="editor"
          label={t("form.address")}
          value={values.address}
          onChange={(e) => update("address", e.target.value)}
          rows={2}
        />
        <Input
          variant="editor"
          label={t("form.tel")}
          value={values.tel}
          onChange={(e) => update("tel", e.target.value)}
        />
      </div>

      {duplicate && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-600">
          <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
          {t("buyers.duplicateWarning")}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          {t("buyers.cancel")}
        </Button>
        <Button disabled={!canSave} onClick={() => onSubmit(values)}>
          {t("buyers.save")}
        </Button>
      </div>
    </ModalShell>
  );
}

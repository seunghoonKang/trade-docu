import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BookUser } from "lucide-react";
import { Button } from "@/shared/ui";
import { useAuth } from "@/entities/session";
import type { Buyer } from "@/entities/buyer";
import { BuyerPickerModal } from "./BuyerPickerModal";

interface Props {
  onSelect: (buyer: Buyer) => void;
}

/** [거래처 불러오기] 버튼 + picker 모달. 게스트에게는 렌더링하지 않는다(ADR-0002). */
export function BuyerPicker({ onSelect }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <BookUser className="size-4 shrink-0" aria-hidden />
        {t("form.loadBuyer")}
      </Button>
      <BuyerPickerModal open={open} onClose={() => setOpen(false)} onSelect={onSelect} />
    </>
  );
}

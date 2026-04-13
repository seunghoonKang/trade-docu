import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../app/providers/AuthProvider";
import { listBuyers } from "../api";
import type { Buyer } from "../../../entities/buyer/model";

interface Props {
  onSelect: (buyer: Buyer) => void;
}

export function BuyerSelect({ onSelect }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [buyers, setBuyers] = useState<Buyer[]>([]);

  useEffect(() => {
    if (user) { listBuyers(user.id).then(setBuyers); }
  }, [user]);

  if (!user || buyers.length === 0) return null;

  return (
    <select
      className="w-full px-3 py-2 text-base border border-gray-200 rounded mb-3"
      defaultValue=""
      onChange={(e) => {
        const buyer = buyers.find((b) => b.id === e.target.value);
        if (buyer) onSelect(buyer);
      }}
    >
      <option value="" disabled>{t("form.selectBuyer")}</option>
      {buyers.map((b) => (
        <option key={b.id} value={b.id}>{b.companyName}</option>
      ))}
    </select>
  );
}

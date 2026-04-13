import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../app/providers/AuthProvider";
import { listProducts } from "../api";
import type { Product } from "../../../entities/product/model";

interface Props {
  onSelect: (product: Product) => void;
}

export function ProductSelect({ onSelect }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (user) { listProducts(user.id).then(setProducts); }
  }, [user]);

  if (!user || products.length === 0) return null;

  return (
    <select
      className="text-sm border border-gray-200 rounded px-2 py-1"
      defaultValue=""
      onChange={(e) => {
        const product = products.find((p) => p.id === e.target.value);
        if (product) onSelect(product);
      }}
    >
      <option value="" disabled>{t("form.selectProduct")}</option>
      {products.map((p) => (
        <option key={p.id} value={p.id}>{p.description}</option>
      ))}
    </select>
  );
}

import { useTranslation } from "react-i18next";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";
import { FormSection } from "../../shared/ui/FormSection";
import { calcSubtotal } from "../../entities/invoice/lib";
import type { InvoiceItem } from "../../entities/invoice/model";

interface Props {
  items: InvoiceItem[]; currency: string;
  onUpdateItem: (index: number, field: keyof InvoiceItem, value: string | number) => void;
  onAddItem: () => void; onRemoveItem: (index: number) => void;
}

function ItemCard({ item, index, total, t, onUpdateItem, onRemoveItem }: {
  item: InvoiceItem; index: number; total: number;
  t: (key: string) => string;
  onUpdateItem: Props["onUpdateItem"]; onRemoveItem: Props["onRemoveItem"];
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-500">#{index + 1}</span>
        {total > 1 && (
          <Button variant="ghost" size="sm" onClick={() => onRemoveItem(index)}>
            {t("form.removeItem")}
          </Button>
        )}
      </div>
      <Input label={t("form.description")} value={item.description} onChange={(e) => onUpdateItem(index, "description", e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input label={t("form.hsCode")} value={item.hsCode} onChange={(e) => onUpdateItem(index, "hsCode", e.target.value)} />
        <Input label={t("form.unit")} value={item.unit} onChange={(e) => onUpdateItem(index, "unit", e.target.value)} />
        <Input label={t("form.qty")} type="number" min="0" value={item.qty || ""} onChange={(e) => onUpdateItem(index, "qty", Number(e.target.value))} />
        <Input label={t("form.unitPrice")} type="number" min="0" step="0.01" value={item.unitPrice || ""} onChange={(e) => onUpdateItem(index, "unitPrice", Number(e.target.value))} />
      </div>
      <Input label={t("form.remarks")} value={item.remarks} onChange={(e) => onUpdateItem(index, "remarks", e.target.value)} />
      <div className="text-right text-base font-semibold text-gray-700">
        {t("form.amount")}: {item.amount.toFixed(2)}
      </div>
    </div>
  );
}

export function ItemsTableSection({ items, currency, onUpdateItem, onAddItem, onRemoveItem }: Props) {
  const { t } = useTranslation();
  const subtotal = calcSubtotal(items);

  return (
    <FormSection title={t("form.items")}>
      {/* Mobile: Cards */}
      <div className="md:hidden space-y-3">
        {items.map((item, i) => (
          <ItemCard
            key={i} item={item} index={i} total={items.length}
            t={t} onUpdateItem={onUpdateItem} onRemoveItem={onRemoveItem}
          />
        ))}
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-base">
          <thead>
            <tr className="border-b-2 border-gray-900 text-left">
              <th className="py-2 pr-2 font-medium text-gray-600">{t("form.description")}</th>
              <th className="py-2 pr-2 font-medium text-gray-600 w-24">{t("form.hsCode")}</th>
              <th className="py-2 pr-2 font-medium text-gray-600 w-16">{t("form.qty")}</th>
              <th className="py-2 pr-2 font-medium text-gray-600 w-16">{t("form.unit")}</th>
              <th className="py-2 pr-2 font-medium text-gray-600 w-24">{t("form.unitPrice")}</th>
              <th className="py-2 pr-2 font-medium text-gray-600 w-24">{t("form.amount")}</th>
              <th className="py-2 pr-2 font-medium text-gray-600">{t("form.remarks")}</th>
              <th className="py-2 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-1 pr-2"><input className="w-full px-2 py-1 border border-gray-200 rounded text-base" value={item.description} onChange={(e) => onUpdateItem(i, "description", e.target.value)} /></td>
                <td className="py-1 pr-2"><input className="w-full px-2 py-1 border border-gray-200 rounded text-base" value={item.hsCode} onChange={(e) => onUpdateItem(i, "hsCode", e.target.value)} /></td>
                <td className="py-1 pr-2"><input className="w-full px-2 py-1 border border-gray-200 rounded text-base text-right" type="number" min="0" value={item.qty || ""} onChange={(e) => onUpdateItem(i, "qty", Number(e.target.value))} /></td>
                <td className="py-1 pr-2"><input className="w-full px-2 py-1 border border-gray-200 rounded text-base" value={item.unit} onChange={(e) => onUpdateItem(i, "unit", e.target.value)} /></td>
                <td className="py-1 pr-2"><input className="w-full px-2 py-1 border border-gray-200 rounded text-base text-right" type="number" min="0" step="0.01" value={item.unitPrice || ""} onChange={(e) => onUpdateItem(i, "unitPrice", Number(e.target.value))} /></td>
                <td className="py-1 pr-2 text-right text-base text-gray-700">{item.amount.toFixed(2)}</td>
                <td className="py-1 pr-2"><input className="w-full px-2 py-1 border border-gray-200 rounded text-base" value={item.remarks} onChange={(e) => onUpdateItem(i, "remarks", e.target.value)} /></td>
                <td className="py-1">{items.length > 1 && (<Button variant="ghost" size="sm" onClick={() => onRemoveItem(i)}>{t("form.removeItem")}</Button>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center pt-2">
        <Button variant="secondary" size="sm" onClick={onAddItem}>+ {t("form.addItem")}</Button>
        <div className="text-base text-gray-600">{t("form.subtotal")}: {currency} {subtotal.toFixed(2)}</div>
      </div>
    </FormSection>
  );
}

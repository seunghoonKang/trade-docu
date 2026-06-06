import { Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui";
import { Input, editorInlineInputClassName } from "@/shared/ui";
import { FormSection } from "@/shared/ui";
import { calcSubtotal } from "@/entities/invoice/lib";
import { cn } from "@/shared/lib/utils";
import type { InvoiceItem } from "@/entities/invoice/model";

interface Props {
  items: InvoiceItem[];
  currency: string;
  totalAmount: number;
  onUpdateItem: (index: number, field: keyof InvoiceItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}

function ItemCard({ item, index, total, t, onUpdateItem, onRemoveItem }: {
  item: InvoiceItem; index: number; total: number;
  t: (key: string) => string;
  onUpdateItem: Props["onUpdateItem"]; onRemoveItem: Props["onRemoveItem"];
}) {
  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-muted-foreground">#{index + 1}</span>
        {total > 1 && (
          <Button variant="ghost" size="sm" onClick={() => onRemoveItem(index)}>
            {t("form.removeItem")}
          </Button>
        )}
      </div>
      <Input variant="editor" label={t("form.description")} value={item.description} onChange={(e) => onUpdateItem(index, "description", e.target.value)} />
      <div className="grid grid-cols-2 gap-4">
        <Input variant="editor" label={t("form.hsCode")} value={item.hsCode} onChange={(e) => onUpdateItem(index, "hsCode", e.target.value)} />
        <Input variant="editor" label={t("form.unit")} value={item.unit} onChange={(e) => onUpdateItem(index, "unit", e.target.value)} />
        <Input variant="editor" label={t("form.qty")} type="number" min="0" value={item.qty || ""} onChange={(e) => onUpdateItem(index, "qty", Number(e.target.value))} />
        <Input variant="editor" label={t("form.unitPrice")} type="number" min="0" step="0.01" value={item.unitPrice || ""} onChange={(e) => onUpdateItem(index, "unitPrice", Number(e.target.value))} />
      </div>
      <Input variant="editor" label={t("form.remarks")} value={item.remarks} onChange={(e) => onUpdateItem(index, "remarks", e.target.value)} />
      <div className="text-right text-base font-semibold text-foreground">
        {t("form.amount")}: {item.amount.toFixed(2)}
      </div>
    </div>
  );
}

export function ItemsTableSection({ items, currency, totalAmount, onUpdateItem, onAddItem, onRemoveItem }: Props) {
  const { t } = useTranslation();
  const subtotal = calcSubtotal(items);

  return (
    <FormSection title={t("form.items")} icon={Package} variant="card">
      <div className="space-y-4 md:hidden">
        {items.map((item, i) => (
          <ItemCard
            key={i}
            item={item}
            index={i}
            total={items.length}
            t={t}
            onUpdateItem={onUpdateItem}
            onRemoveItem={onRemoveItem}
          />
        ))}
        <Button variant="secondary" size="sm" onClick={onAddItem}>+ {t("form.addItem")}</Button>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-foreground text-left">
              <th className="py-2 pr-2 font-medium text-muted-foreground">{t("form.description")}</th>
              <th className="w-24 py-2 pr-2 font-medium text-muted-foreground">{t("form.hsCode")}</th>
              <th className="w-16 py-2 pr-2 font-medium text-muted-foreground">{t("form.qty")}</th>
              <th className="w-16 py-2 pr-2 font-medium text-muted-foreground">{t("form.unit")}</th>
              <th className="w-24 py-2 pr-2 font-medium text-muted-foreground">{t("form.unitPrice")}</th>
              <th className="w-24 py-2 pr-2 font-medium text-muted-foreground">{t("form.amount")}</th>
              <th className="py-2 pr-2 font-medium text-muted-foreground">{t("form.remarks")}</th>
              <th className="w-16 py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-border">
                <td className="py-1 pr-2"><input className={editorInlineInputClassName} value={item.description} onChange={(e) => onUpdateItem(i, "description", e.target.value)} /></td>
                <td className="py-1 pr-2"><input className={editorInlineInputClassName} value={item.hsCode} onChange={(e) => onUpdateItem(i, "hsCode", e.target.value)} /></td>
                <td className="py-1 pr-2"><input className={cn(editorInlineInputClassName, "text-right")} type="number" min="0" value={item.qty || ""} onChange={(e) => onUpdateItem(i, "qty", Number(e.target.value))} /></td>
                <td className="py-1 pr-2"><input className={editorInlineInputClassName} value={item.unit} onChange={(e) => onUpdateItem(i, "unit", e.target.value)} /></td>
                <td className="py-1 pr-2"><input className={cn(editorInlineInputClassName, "text-right")} type="number" min="0" step="0.01" value={item.unitPrice || ""} onChange={(e) => onUpdateItem(i, "unitPrice", Number(e.target.value))} /></td>
                <td className="py-1 pr-2 text-right text-foreground">{item.amount.toFixed(2)}</td>
                <td className="py-1 pr-2"><input className={editorInlineInputClassName} value={item.remarks} onChange={(e) => onUpdateItem(i, "remarks", e.target.value)} /></td>
                <td className="py-1">{items.length > 1 && (<Button variant="ghost" size="sm" onClick={() => onRemoveItem(i)}>{t("form.removeItem")}</Button>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 border-t border-border pt-4 text-right">
        <div className="text-sm text-muted-foreground">{t("form.subtotal")}: {currency} {subtotal.toFixed(2)}</div>
        <div className="text-lg font-bold text-foreground">{t("form.total")}: {currency} {totalAmount.toFixed(2)}</div>
      </div>
    </FormSection>
  );
}

import { Plus, X, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input, editorDismissButtonClassName } from "@/shared/ui";
import { FormSection } from "@/shared/ui";
import { calcSubtotal } from "@/entities/invoice/lib";
import type { InvoiceItem } from "@/entities/invoice/model";

interface Props {
  items: InvoiceItem[];
  currency: string;
  totalAmount: number;
  onUpdateItem: (index: number, field: keyof InvoiceItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}

function ItemCard({ item, index, currency, canRemove, t, onUpdateItem, onRemoveItem }: {
  item: InvoiceItem;
  index: number;
  currency: string;
  canRemove: boolean;
  t: (key: string, options?: Record<string, string>) => string;
  onUpdateItem: Props["onUpdateItem"];
  onRemoveItem: Props["onRemoveItem"];
}) {
  return (
    <div className="relative space-y-4 rounded-lg border border-border bg-background p-4">
      {canRemove && (
        <button
          type="button"
          onClick={() => onRemoveItem(index)}
          className={editorDismissButtonClassName}
          aria-label={t("form.removeItem")}
        >
          <X className="size-3.5" strokeWidth={2.5} aria-hidden />
        </button>
      )}
      <Input
        variant="editor"
        label={t("form.description")}
        value={item.description}
        onChange={(e) => onUpdateItem(index, "description", e.target.value)}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          variant="editor"
          label={t("form.hsCode")}
          value={item.hsCode}
          onChange={(e) => onUpdateItem(index, "hsCode", e.target.value)}
        />
        <Input
          variant="editor"
          label={t("form.qty")}
          type="number"
          min="0"
          value={item.qty || ""}
          onChange={(e) => onUpdateItem(index, "qty", Number(e.target.value))}
        />
        <Input
          variant="editor"
          label={t("form.unit")}
          value={item.unit}
          onChange={(e) => onUpdateItem(index, "unit", e.target.value)}
        />
        <Input
          variant="editor"
          label={t("form.unitPriceWithCurrency", { currency })}
          type="number"
          min="0"
          step="0.01"
          value={item.unitPrice || ""}
          onChange={(e) => onUpdateItem(index, "unitPrice", Number(e.target.value))}
        />
      </div>
      <Input
        variant="editor"
        label={t("form.remarks")}
        value={item.remarks}
        onChange={(e) => onUpdateItem(index, "remarks", e.target.value)}
      />
      <div className="text-right text-sm font-semibold text-foreground">
        {t("form.amount")}: {currency} {item.amount.toFixed(2)}
      </div>
    </div>
  );
}

export function ItemsTableSection({ items, currency, totalAmount, onUpdateItem, onAddItem, onRemoveItem }: Props) {
  const { t } = useTranslation();
  const subtotal = calcSubtotal(items);
  const canRemove = items.length > 1;

  return (
    <FormSection title={t("form.items")} icon={Package} variant="card">
      <div className="space-y-4">
        {items.map((item, i) => (
          <ItemCard
            key={i}
            item={item}
            index={i}
            currency={currency}
            canRemove={canRemove}
            t={t}
            onUpdateItem={onUpdateItem}
            onRemoveItem={onRemoveItem}
          />
        ))}
        <button
          type="button"
          onClick={onAddItem}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-2.5 text-xs font-semibold uppercase tracking-wide text-secondary-foreground transition-colors hover:bg-muted"
        >
          <Plus className="size-4" aria-hidden />
          {t("form.addItem")}
        </button>
      </div>

      <div className="space-y-2 border-t border-border pt-4 text-right">
        <div className="text-sm text-muted-foreground">
          {t("form.subtotal")}: {currency} {subtotal.toFixed(2)}
        </div>
        <div className="text-lg font-bold text-foreground">
          {t("form.total")}: {currency} {totalAmount.toFixed(2)}
        </div>
      </div>
    </FormSection>
  );
}

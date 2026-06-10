import { Fragment, useEffect, useState } from "react";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Deal } from "@/entities/deal";
import type { Shipment, Allocation } from "@/entities/shipment";
import { normalizeAllocation } from "@/entities/shipment";
import { computeBalance } from "@/features/deal-crud";
import { Button } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

interface Props {
  deal: Deal;
  shipments: Shipment[];
  activeShipmentId: string | null;
  onSelectShipment: (id: string) => void;
  onAddShipment: () => void;
  onDeleteShipment: (id: string) => void;
  onSaveAllocations: (shipmentId: string, allocations: Allocation[]) => void;
}

/**
 * 분할선적 관리(S4): 거래 건 잔량 표시 + 선적 차수 추가/삭제 + 활성 선적의 품목별 배분 편집.
 * 잔여 = 주문 − Σ배분. 초과 배분은 경고(차단 아님).
 */
export function ShipmentManager({
  deal,
  shipments,
  activeShipmentId,
  onSelectShipment,
  onAddShipment,
  onDeleteShipment,
  onSaveAllocations,
}: Props) {
  const { t } = useTranslation();
  const balance = computeBalance(deal, shipments);
  const active = shipments.find((s) => s.id === activeShipmentId) ?? null;
  const availableExcl = active ? computeBalance(deal, shipments, { excludeShipmentId: active.id }) : null;

  // 활성 선적의 배분 초안(품목별 qty + per-line 포장). 활성 선적/데이터가 바뀌면 리셋.
  const [draft, setDraft] = useState<Record<string, Allocation>>({});
  useEffect(() => {
    const map: Record<string, Allocation> = {};
    if (active) for (const a of active.allocations) map[a.itemId] = a;
    setDraft(map);
  }, [activeShipmentId, shipments]); // eslint-disable-line react-hooks/exhaustive-deps

  function availableFor(itemId: string): number {
    const row = availableExcl?.items.find((i) => i.itemId === itemId);
    return row ? row.remaining : 0;
  }

  function patchDraft(itemId: string, patch: Partial<Allocation>) {
    setDraft((d) => {
      const cur = d[itemId] ?? { itemId, qty: 0 };
      return { ...d, [itemId]: { ...cur, ...patch } };
    });
  }

  function handleSave() {
    if (!active) return;
    const allocations: Allocation[] = deal.items.map((it) => {
      const line = draft[it.id];
      return normalizeAllocation({ ...line, itemId: it.id, qty: line?.qty ?? 0 });
    });
    onSaveAllocations(active.id, allocations);
  }

  return (
    <div className="space-y-5">
      {/* 거래 건 잔량 */}
      <div className="rounded-lg border border-border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{t("deal.remaining")}</h3>
          {balance.hasOver && (
            <span className="flex items-center gap-1 text-xs text-red-600">
              <AlertTriangle className="size-3.5" aria-hidden />
              {t("deal.overAllocated")}
            </span>
          )}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="py-1 font-medium">{t("deal.item")}</th>
              <th className="py-1 text-right font-medium">{t("deal.ordered")}</th>
              <th className="py-1 text-right font-medium">{t("deal.allocated")}</th>
              <th className="py-1 text-right font-medium">{t("deal.remaining")}</th>
            </tr>
          </thead>
          <tbody>
            {balance.items.map((row) => (
              <tr key={row.itemId} className="border-t border-border/60">
                <td className="py-1.5">{row.description || "—"}</td>
                <td className="py-1.5 text-right tabular-nums">{row.ordered}</td>
                <td className="py-1.5 text-right tabular-nums">{row.allocated}</td>
                <td
                  className={cn(
                    "py-1.5 text-right font-medium tabular-nums",
                    row.over ? "text-red-600" : row.remaining > 0 ? "text-amber-600" : "text-muted-foreground",
                  )}
                >
                  {row.remaining}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 선적 차수 */}
      <div className="flex flex-wrap items-center gap-2">
        {shipments.map((s) => (
          <div
            key={s.id}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm",
              s.id === activeShipmentId ? "border-primary bg-accent text-primary" : "border-border text-muted-foreground",
            )}
          >
            <button type="button" onClick={() => onSelectShipment(s.id)} className="font-medium">
              {t("deal.shipment")} {s.seq}
            </button>
            {shipments.length > 1 && (
              <button
                type="button"
                onClick={() => onDeleteShipment(s.id)}
                className="text-muted-foreground hover:text-red-600"
                aria-label="delete shipment"
              >
                <Trash2 className="size-3.5" aria-hidden />
              </button>
            )}
          </div>
        ))}
        <Button variant="outline" size="sm" className="gap-1.5" onClick={onAddShipment}>
          <Plus className="size-4" aria-hidden />
          {t("deal.addShipment")}
        </Button>
      </div>

      {/* 활성 선적 배분 편집 */}
      {active && (
        <div className="rounded-lg border border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              {t("deal.shipment")} {active.seq} · {t("deal.allocation")}
            </h3>
            <Button variant="default" size="sm" onClick={handleSave}>
              {t("deal.save")}
            </Button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="py-1 font-medium">{t("deal.item")}</th>
                <th className="py-1 text-right font-medium">{t("deal.remaining")}</th>
                <th className="py-1 text-right font-medium">{t("deal.thisShipment")}</th>
              </tr>
            </thead>
            <tbody>
              {deal.items.map((it) => {
                const available = availableFor(it.id);
                const line = draft[it.id];
                const qty = line?.qty || 0;
                const over = qty > available;
                return (
                  <Fragment key={it.id}>
                    <tr className="border-t border-border/60">
                      <td className="py-1.5">{it.description || "—"}</td>
                      <td className="py-1.5 text-right tabular-nums text-muted-foreground">{available}</td>
                      <td className="py-1.5 text-right">
                        <input
                          type="number"
                          min={0}
                          value={qty === 0 ? "" : qty}
                          onChange={(e) => patchDraft(it.id, { qty: Number(e.target.value) || 0 })}
                          className={cn(
                            "w-24 rounded border px-2 py-1 text-right tabular-nums",
                            over ? "border-red-500 bg-red-50 text-red-700" : "border-border",
                          )}
                        />
                      </td>
                    </tr>
                    {/* per-line 포장(전부 선택, S7) — 채운 항목만 PL에 출력된다. */}
                    <tr>
                      <td colSpan={3} className="pb-2.5">
                        <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
                          <PackField
                            label={t("deal.ctn")}
                            type="number"
                            value={line?.cartonQty ? String(line.cartonQty) : ""}
                            onChange={(v) => patchDraft(it.id, { cartonQty: Number(v) || undefined })}
                          />
                          <PackField
                            label={t("deal.netWeight")}
                            value={line?.netWeight ?? ""}
                            onChange={(v) => patchDraft(it.id, { netWeight: v })}
                          />
                          <PackField
                            label={t("deal.grossWeight")}
                            value={line?.grossWeight ?? ""}
                            onChange={(v) => patchDraft(it.id, { grossWeight: v })}
                          />
                          <PackField
                            label={t("deal.cbm")}
                            value={line?.cbm ?? ""}
                            onChange={(v) => patchDraft(it.id, { cbm: v })}
                          />
                          <PackField
                            label={t("deal.cartonNo")}
                            value={line?.cartonNo ?? ""}
                            onChange={(v) => patchDraft(it.id, { cartonNo: v })}
                          />
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PackField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number";
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground">
      <span className="truncate">{label}</span>
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-border px-2 py-1.5 text-right text-sm tabular-nums text-foreground"
      />
    </label>
  );
}

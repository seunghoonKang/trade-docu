import { Plus, Split, Undo2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Deal } from "@/entities/deal";
import type { Shipment, Allocation } from "@/entities/shipment";
import { Button } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

interface Props {
  deal: Deal;
  shipments: Shipment[];
  activeShipmentId: string | null;
  /** PL 플로우에서만 per-line 포장 편집을 노출한다. */
  showPacking?: boolean;
  /** 분할 모드(매트릭스 노출) — 부모가 제어한다(선적 수와 동기화). */
  splitMode: boolean;
  onEnterSplit: () => void;
  /** 전량 출고로 되돌리기 — 선적이 여러 개면 부모가 확인 팝업을 거친다. */
  onCancelSplit: () => void;
  onSelectShipment: (id: string) => void;
  onAddShipment: () => void;
  onDeleteShipment: (id: string) => void;
  /** 배분/포장 초안 변경(즉시) — 부모가 미리보기 반영 + 디바운스 저장을 담당. */
  onChangeAllocations: (shipmentId: string, allocations: Allocation[]) => void;
}

/**
 * 선적 배분(분할선적 UX 개편): 기본은 '전량 1회 출고' 요약 한 줄 — 분할 UI를 숨긴다.
 * '분할선적으로 보내기'를 켜면 품목×선적 매트릭스 한 표에서 전체 분배를 편집한다.
 * 잔여는 입력 즉시 자동 계산, 발행 대상 선적은 열 헤더 클릭으로 선택(강조 표시).
 */
export function ShipmentManager({
  deal,
  shipments,
  activeShipmentId,
  showPacking = false,
  splitMode,
  onEnterSplit,
  onCancelSplit,
  onSelectShipment,
  onAddShipment,
  onDeleteShipment,
  onChangeAllocations,
}: Props) {
  const { t } = useTranslation();
  const totalOrdered = deal.items.reduce((sum, it) => sum + it.orderedQty, 0);
  const active = shipments.find((s) => s.id === activeShipmentId) ?? null;

  function allocationFor(shipment: Shipment, itemId: string): Allocation {
    return shipment.allocations.find((a) => a.itemId === itemId) ?? { itemId, qty: 0 };
  }

  function patchAllocation(shipment: Shipment, itemId: string, patch: Partial<Allocation>) {
    const rest = shipment.allocations.filter((a) => a.itemId !== itemId);
    onChangeAllocations(shipment.id, [
      ...rest,
      { ...allocationFor(shipment, itemId), ...patch, itemId },
    ]);
  }

  function allocatedSum(itemId: string): number {
    return shipments.reduce((sum, s) => sum + (allocationFor(s, itemId).qty || 0), 0);
  }

  if (!splitMode) {
    // 기본: 전량 1회 출고 — 분할 개념을 노출하지 않는다.
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">{t("deal.shipment")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("deal.fullShipmentSummary", { total: totalOrdered })}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={onEnterSplit}>
          <Split className="size-4" aria-hidden />
          {t("deal.splitShipment")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{t("deal.allocation")}</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={onCancelSplit}
          >
            <Undo2 className="size-4" aria-hidden />
            {t("deal.cancelSplit")}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onAddShipment}>
            <Plus className="size-4" aria-hidden />
            {t("deal.addShipment")}
          </Button>
        </div>
      </div>

      {/* 품목×선적 매트릭스 — 한 표에서 전체 분배, 잔여 자동 계산. */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="py-1.5 pr-2 font-medium">{t("deal.item")}</th>
              <th className="py-1.5 pr-2 text-right font-medium">{t("deal.ordered")}</th>
              {shipments.map((s) => (
                <th key={s.id} className="px-1 py-1">
                  <button
                    type="button"
                    onClick={() => onSelectShipment(s.id)}
                    className={cn(
                      "flex w-full items-center justify-center gap-1 rounded-md border px-2 py-1 font-semibold transition-colors",
                      s.id === activeShipmentId
                        ? "border-primary bg-accent text-primary"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t("deal.shipment")} {s.seq}
                    {shipments.length > 1 && (
                      <X
                        role="button"
                        aria-label="delete shipment"
                        className="size-3.5 text-muted-foreground hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteShipment(s.id);
                        }}
                      />
                    )}
                  </button>
                </th>
              ))}
              <th className="py-1.5 pl-2 text-right font-medium">{t("deal.remaining")}</th>
            </tr>
          </thead>
          <tbody>
            {deal.items.map((it) => {
              const remaining = it.orderedQty - allocatedSum(it.id);
              return (
                <tr key={it.id} className="border-t border-border/60">
                  <td className="max-w-[160px] truncate py-1.5 pr-2">{it.description || "—"}</td>
                  <td className="py-1.5 pr-2 text-right tabular-nums text-muted-foreground">
                    {it.orderedQty}
                  </td>
                  {shipments.map((s) => {
                    const qty = allocationFor(s, it.id).qty || 0;
                    return (
                      <td key={s.id} className="px-1 py-1.5">
                        <input
                          type="number"
                          min={0}
                          value={qty === 0 ? "" : qty}
                          onChange={(e) =>
                            patchAllocation(s, it.id, { qty: Number(e.target.value) || 0 })
                          }
                          className={cn(
                            "w-full min-w-16 rounded border px-2 py-1 text-right tabular-nums",
                            s.id === activeShipmentId ? "border-primary/40 bg-accent/40" : "border-border",
                          )}
                        />
                      </td>
                    );
                  })}
                  <td
                    className={cn(
                      "py-1.5 pl-2 text-right font-medium tabular-nums",
                      remaining < 0
                        ? "text-red-600"
                        : remaining > 0
                          ? "text-amber-600"
                          : "text-muted-foreground",
                    )}
                  >
                    {remaining}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{t("deal.issueTargetHint")}</p>

      {/* 활성 선적의 per-line 포장(전부 선택, S7) — PL 플로우에서만. */}
      {showPacking && active && (
        <PackingSection
          deal={deal}
          shipment={active}
          onPatch={(itemId, patch) => patchAllocation(active, itemId, patch)}
        />
      )}
    </div>
  );
}

function PackingSection({
  deal,
  shipment,
  onPatch,
}: {
  deal: Deal;
  shipment: Shipment;
  onPatch: (itemId: string, patch: Partial<Allocation>) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 border-t border-border/60 pt-3">
      <h4 className="text-sm font-semibold">
        {t("deal.shipment")} {shipment.seq} · {t("deal.packingDetails")}
      </h4>
      {deal.items.map((it) => {
        const line = shipment.allocations.find((a) => a.itemId === it.id);
        return (
          <div key={it.id}>
            <p className="mb-1.5 text-xs font-medium text-secondary-foreground">
              {it.description || "—"}
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
              <PackField
                label={t("deal.ctn")}
                type="number"
                value={line?.cartonQty ? String(line.cartonQty) : ""}
                onChange={(v) => onPatch(it.id, { cartonQty: Number(v) || undefined })}
              />
              <PackField
                label={t("deal.netWeight")}
                value={line?.netWeight ?? ""}
                onChange={(v) => onPatch(it.id, { netWeight: v })}
              />
              <PackField
                label={t("deal.grossWeight")}
                value={line?.grossWeight ?? ""}
                onChange={(v) => onPatch(it.id, { grossWeight: v })}
              />
              <PackField
                label={t("deal.cbm")}
                value={line?.cbm ?? ""}
                onChange={(v) => onPatch(it.id, { cbm: v })}
              />
              <PackField
                label={t("deal.cartonNo")}
                value={line?.cartonNo ?? ""}
                onChange={(v) => onPatch(it.id, { cartonNo: v })}
              />
            </div>
          </div>
        );
      })}
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

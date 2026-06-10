import type { Deal } from "@/entities/deal";
import type { Shipment, Allocation } from "@/entities/shipment";

/**
 * 잔량(Remaining) = 주문 수량 − Σ(선적별 배분 수량), 품목별 자동 계산.
 * 초과 배분·잔여 미선적은 차단이 아니라 경고한다(CONTEXT.md, ADR-0001).
 */

export interface ItemBalance {
  itemId: string;
  description: string;
  ordered: number;
  allocated: number; // 포함된 선적들의 배분 합
  remaining: number; // ordered − allocated
  over: boolean; // allocated > ordered (초과 배분)
}

export interface DealBalance {
  items: ItemBalance[];
  hasRemaining: boolean; // 잔여(>0)가 하나라도 있음
  hasOver: boolean; // 초과 배분이 하나라도 있음
}

/**
 * 거래 건의 품목별 잔량. opts.excludeShipmentId를 주면 그 선적의 배분을 빼고 계산한다
 * (편집 중인 선적의 "이 선적을 제외한 잔여"를 구할 때).
 */
export function computeBalance(
  deal: Deal,
  shipments: Shipment[],
  opts: { excludeShipmentId?: string } = {},
): DealBalance {
  const allocatedByItem = new Map<string, number>();
  for (const ship of shipments) {
    if (opts.excludeShipmentId && ship.id === opts.excludeShipmentId) continue;
    for (const alloc of ship.allocations) {
      allocatedByItem.set(alloc.itemId, (allocatedByItem.get(alloc.itemId) ?? 0) + (alloc.qty || 0));
    }
  }

  const items: ItemBalance[] = deal.items.map((it) => {
    const allocated = allocatedByItem.get(it.id) ?? 0;
    return {
      itemId: it.id,
      description: it.description,
      ordered: it.orderedQty,
      allocated,
      remaining: it.orderedQty - allocated,
      over: allocated > it.orderedQty,
    };
  });

  return {
    items,
    hasRemaining: items.some((i) => i.remaining > 0),
    hasOver: items.some((i) => i.over),
  };
}

/** 새 선적의 기본 배분 = 현재 품목별 잔여(>0인 것만). */
export function remainingAllocations(deal: Deal, shipments: Shipment[]): Allocation[] {
  return computeBalance(deal, shipments)
    .items.filter((i) => i.remaining > 0)
    .map((i) => ({ itemId: i.itemId, qty: i.remaining }));
}

/** 다음 선적 차수 = 기존 최대 seq + 1. */
export function nextSeq(shipments: Shipment[]): number {
  return shipments.reduce((max, s) => Math.max(max, s.seq), 0) + 1;
}

/**
 * 분할 시 문서 번호 접미사 자동 제안(CI-141-2). seq 1은 접미사 없음. 항상 수정 가능(Q9).
 */
export function suggestDocNo(base: string, seq: number): string {
  if (!base) return "";
  return seq > 1 ? `${base}-${seq}` : base;
}

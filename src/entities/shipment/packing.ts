import type { Allocation } from "./model";

/** PL 렌더에 쓰는 배분 라인의 포장 부분(전부 선택). */
export type PackingLine = Pick<
  Allocation,
  "cartonQty" | "netWeight" | "grossWeight" | "cbm" | "cartonNo"
>;

/** PL 표에 보여줄 포장 컬럼 — 한 라인이라도 채운 컬럼만 출력한다(#25). */
export function visiblePackingColumns(lines: PackingLine[]): {
  cartonQty: boolean;
  netWeight: boolean;
  grossWeight: boolean;
  cbm: boolean;
  cartonNo: boolean;
} {
  return {
    cartonQty: lines.some((l) => Boolean(l.cartonQty)),
    netWeight: lines.some((l) => Boolean(l.netWeight?.trim())),
    grossWeight: lines.some((l) => Boolean(l.grossWeight?.trim())),
    cbm: lines.some((l) => Boolean(l.cbm?.trim())),
    cartonNo: lines.some((l) => Boolean(l.cartonNo?.trim())),
  };
}

/** 배분 저장 정규화: 비운 포장 항목(빈 문자열·0)은 키 자체를 남기지 않는다. */
export function normalizeAllocation(a: Allocation): Allocation {
  const out: Allocation = { itemId: a.itemId, qty: a.qty };
  if (a.cartonQty) out.cartonQty = a.cartonQty;
  const netWeight = a.netWeight?.trim();
  if (netWeight) out.netWeight = netWeight;
  const grossWeight = a.grossWeight?.trim();
  if (grossWeight) out.grossWeight = grossWeight;
  const cbm = a.cbm?.trim();
  if (cbm) out.cbm = cbm;
  const cartonNo = a.cartonNo?.trim();
  if (cartonNo) out.cartonNo = cartonNo;
  if (a.remarks) out.remarks = a.remarks;
  return out;
}

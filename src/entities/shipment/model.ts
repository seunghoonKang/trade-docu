/**
 * 선적(Shipment) — 한 거래 건 안의 분할 출고 1회분. 자체 선적정보(B/L·운송·포장)와
 * 품목별 배분 수량을 가진다. 거래 건은 최소 1개의 선적을 가진다(CONTEXT.md, ADR-0001).
 * CI·PL은 선적 레벨에서 발행된다.
 *
 * S3에서는 거래 건당 기본 선적 1개(전량 배분)만 자동 생성한다. 분할선적·배분 UI는 S4,
 * 운송/포장/중량/비용/당사자 상세 입력은 S4~S7에서 채운다(여기선 렌더에 필요한 골격만).
 */

/** 품목별 배분 + per-line 포장(전부 선택). itemId → deals.items[].id. qty=낱개(PCS). */
export interface Allocation {
  itemId: string;
  qty: number;
  cartonQty?: number; // 박스수(CTN, 이중수량)
  netWeight?: string;
  grossWeight?: string;
  cbm?: string;
  cartonNo?: string;
  remarks?: string;
}

/** CI용 비용 라인(선적 레벨). 상세 입력은 S5. */
export interface ShipmentCharge {
  type: string;
  label: string;
  amount: number;
}

export interface Shipment {
  id: string;
  userId: string;
  dealId: string;
  seq: number; // 선적 차수 (1,2,3…)
  shipDate: string;
  // 운송
  transportMode: string; // sea | air | courier
  carrier: string;
  vesselFlight: string;
  containerNo: string;
  sealNo: string;
  portLoading: string;
  portDischarge: string;
  finalDestination: string;
  blNo: string;
  blDate: string;
  // 포장/중량 (선적 총계 — 품목별 상세는 allocations에)
  netWeight: string;
  grossWeight: string;
  totalCbm: string;
  packageCount: string;
  cartonSize: string;
  marks: string;
  // 배분 수량 + per-line 포장
  allocations: Allocation[];
  charges: ShipmentCharge[];
  createdAt: string;
}

/** 서버에 선적을 생성할 때 보내는 페이로드(id/userId/createdAt 제외). */
export type ShipmentInput = Omit<Shipment, "id" | "userId" | "createdAt">;

/** 거래 건의 기본 선적(seq 1). allocations는 보통 거래 건 품목 전량 배분. */
export function createDefaultShipment(dealId: string, allocations: Allocation[]): ShipmentInput {
  return {
    dealId,
    seq: 1,
    shipDate: "",
    transportMode: "",
    carrier: "",
    vesselFlight: "",
    containerNo: "",
    sealNo: "",
    portLoading: "",
    portDischarge: "",
    finalDestination: "",
    blNo: "",
    blDate: "",
    netWeight: "",
    grossWeight: "",
    totalCbm: "",
    packageCount: "",
    cartonSize: "",
    marks: "",
    allocations,
    charges: [],
  };
}

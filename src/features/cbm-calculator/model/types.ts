export type LengthUnit = "cm" | "mm" | "inch";

/** 카톤 1종(같은 규격 묶음). 입력값은 문자열로 보관(빈칸 허용), 계산 시 숫자 변환. */
export interface CartonRow {
  id: string;
  length: string;
  width: string;
  height: string;
  qty: string;
  /** 카톤 1개 총중량(kg). */
  weight: string;
}

export interface CbmTotals {
  totalCbm: number; // m³
  totalGrossWeight: number; // kg
  totalVolumetricAir: number; // kg
  chargeableAir: number; // kg = max(실중량, 항공부피중량)
  totalCartons: number;
}

export interface ContainerFit {
  name: string; // "20ft" | "40ft" | "40HC"
  capacityCbm: number;
  containersNeeded: number; // ceil(총CBM / 용량)
  utilizationPercent: number; // 총CBM / (필요수×용량)
}

import type { CartonRow, CbmTotals, ContainerFit, LengthUnit } from "../model/types";

/** 단위 → cm 환산 계수. */
const TO_CM: Record<LengthUnit, number> = { cm: 1, mm: 0.1, inch: 2.54 };
/** 항공 부피중량 환산 계수(IATA): cm³ / 6000 = kg. */
const AIR_DIVISOR = 6000;

/** 표준 컨테이너 실무 충진 용량(CBM) 추정. */
export const CONTAINERS = [
  { name: "20ft", capacityCbm: 28 },
  { name: "40ft", capacityCbm: 58 },
  { name: "40HC", capacityCbm: 68 },
] as const;

function num(value: string): number {
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

/** 카톤 1개 부피(m³). cm 기준 l·w·h / 1,000,000. */
export function cartonCbm(length: number, width: number, height: number, unit: LengthUnit): number {
  const k = TO_CM[unit];
  return (length * k * width * k * height * k) / 1_000_000;
}

/** 카톤 1개 항공 부피중량(kg). (l×w×h in cm) / 6000. */
export function volumetricWeightAir(
  length: number,
  width: number,
  height: number,
  unit: LengthUnit,
): number {
  const k = TO_CM[unit];
  return (length * k * width * k * height * k) / AIR_DIVISOR;
}

/** 항공 청구중량 = max(실중량, 부피중량). */
export function chargeableWeightAir(actualKg: number, volumetricKg: number): number {
  return Math.max(actualKg, volumetricKg);
}

/** 카톤 행들을 합산(`computeBalance` 합산 패턴 참고). */
export function sumTotals(rows: CartonRow[], unit: LengthUnit): CbmTotals {
  let totalCbm = 0;
  let totalGrossWeight = 0;
  let totalVolumetricAir = 0;
  let totalCartons = 0;

  for (const r of rows) {
    const l = num(r.length);
    const w = num(r.width);
    const h = num(r.height);
    const qty = num(r.qty);
    const weight = num(r.weight);
    totalCbm += cartonCbm(l, w, h, unit) * qty;
    totalVolumetricAir += volumetricWeightAir(l, w, h, unit) * qty;
    totalGrossWeight += weight * qty;
    totalCartons += qty;
  }

  return {
    totalCbm,
    totalGrossWeight,
    totalVolumetricAir,
    chargeableAir: chargeableWeightAir(totalGrossWeight, totalVolumetricAir),
    totalCartons,
  };
}

/** 총 CBM으로 컨테이너별 필요 수량·충진율 추정. */
export function containerFill(totalCbm: number): ContainerFit[] {
  return CONTAINERS.map((c) => {
    const containersNeeded = totalCbm <= 0 ? 0 : Math.ceil(totalCbm / c.capacityCbm);
    const utilizationPercent =
      containersNeeded === 0 ? 0 : (totalCbm / (containersNeeded * c.capacityCbm)) * 100;
    return { name: c.name, capacityCbm: c.capacityCbm, containersNeeded, utilizationPercent };
  });
}

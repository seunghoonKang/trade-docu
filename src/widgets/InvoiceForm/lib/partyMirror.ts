import type { BuyerSnapshot } from "@/entities/invoice";

/**
 * 수하인/착하통지처 미러링 규칙(#49): null = 구매자와 동일.
 * 동일 상태에서는 구매자 값을 disabled 인풋에 그대로 보여준다.
 */
export function partyDisplayValues(
  buyer: BuyerSnapshot,
  party: BuyerSnapshot | null,
): BuyerSnapshot {
  return party ?? buyer;
}

/** '구매자와 동일' 해제 시 구매자 값의 복사본으로 시작한다 — 보이던 값이 사라지지 않게. */
export function createSeparatedParty(buyer: BuyerSnapshot): BuyerSnapshot {
  return {
    companyName: buyer.companyName,
    address: buyer.address,
    tel: buyer.tel,
    contactPerson: buyer.contactPerson,
  };
}

import type { Buyer } from "@/entities/buyer";
import type { BuyerSnapshot } from "@/entities/invoice";

/** 거래처 → 당사자 스냅샷. 불러오기 = 값 복사(원본 불변, #49). */
export function buyerToPartySnapshot(buyer: Buyer): BuyerSnapshot {
  return {
    companyName: buyer.companyName,
    address: buyer.address,
    tel: buyer.tel,
    contactPerson: buyer.contactPerson,
  };
}

function normalizeCompanyName(name: string): string {
  return name.trim().toLowerCase();
}

/** 동일 회사명 존재 여부 — 경고용(저장은 허용). 대소문자·앞뒤 공백 무시. */
export function hasDuplicateCompanyName(
  buyers: Buyer[],
  companyName: string,
  excludeId?: string,
): boolean {
  const target = normalizeCompanyName(companyName);
  if (!target) return false;
  return buyers.some(
    (b) => b.id !== excludeId && normalizeCompanyName(b.companyName) === target,
  );
}

/** 회사명·담당자 부분 일치 검색(대소문자 무시). 빈 검색어는 전체. */
export function filterBuyers(buyers: Buyer[], query: string): Buyer[] {
  const q = query.trim().toLowerCase();
  if (!q) return buyers;
  return buyers.filter(
    (b) =>
      b.companyName.toLowerCase().includes(q) ||
      b.contactPerson.toLowerCase().includes(q),
  );
}

/** 최근 사용순(미사용은 뒤) → 생성순 내림차순. 서버 정렬과 동일 규칙. */
export function sortBuyersByRecentUse(buyers: Buyer[]): Buyer[] {
  return [...buyers].sort((a, b) => {
    if (a.lastUsedAt && b.lastUsedAt) return b.lastUsedAt.localeCompare(a.lastUsedAt);
    if (a.lastUsedAt) return -1;
    if (b.lastUsedAt) return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

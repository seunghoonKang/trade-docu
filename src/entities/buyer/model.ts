export interface Buyer {
  id: string;
  userId: string;
  companyName: string;
  address: string;
  tel: string;
  contactPerson: string;
  createdAt: string;
  /** picker에서 선택된 시점. null = 아직 서류에 쓰인 적 없음. */
  lastUsedAt: string | null;
}

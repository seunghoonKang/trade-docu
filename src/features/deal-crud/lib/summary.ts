import type { Deal } from "@/entities/deal";
import type { DocType, DocStatus } from "@/entities/document";

/** 거래 건 단위 History 행에 필요한 문서 참조(발행 배지·PI 번호용, #26). */
export interface DealDocRef {
  dealId: string;
  docType: DocType;
  docNo: string;
  status: DocStatus;
}

/** 거래 건 단위 History 한 행: 거래 건 + 선적 수 + 양식별 발행 수. */
export interface DealSummary {
  deal: Deal;
  piNo: string;
  shipmentCount: number;
  issuedCount: Record<DocType, number>;
}

/** 거래 건들에 선적 수·문서 발행 수를 합쳐 History 행으로 만든다. deals 순서 유지. */
export function buildDealSummaries(
  deals: Deal[],
  shipmentDealIds: string[],
  docs: DealDocRef[],
): DealSummary[] {
  const shipCount = new Map<string, number>();
  for (const dealId of shipmentDealIds) shipCount.set(dealId, (shipCount.get(dealId) ?? 0) + 1);

  return deals.map((deal) => {
    const issuedCount: Record<DocType, number> = { PI: 0, CI: 0, PL: 0 };
    // 발행 수는 issued만 센다(#51 — draft는 미발행). 행 제목용 PI 번호는
    // 발행본 우선, 없으면 draft 번호라도 쓴다(식별자 역할은 유지).
    let issuedPiNo = "";
    let draftPiNo = "";
    for (const doc of docs) {
      if (doc.dealId !== deal.id) continue;
      if (doc.status === "issued") issuedCount[doc.docType] += 1;
      if (doc.docType === "PI" && doc.docNo) {
        if (doc.status === "issued" && !issuedPiNo) issuedPiNo = doc.docNo;
        if (doc.status === "draft" && !draftPiNo) draftPiNo = doc.docNo;
      }
    }
    const piNo = issuedPiNo || draftPiNo;
    return { deal, piNo, shipmentCount: shipCount.get(deal.id) ?? 0, issuedCount };
  });
}

/** 거래 건 검색: PI 번호·PO 번호·구매자 회사명. 빈 질의는 전부 통과. */
export function matchesDealSummary(summary: DealSummary, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    summary.piNo.toLowerCase().includes(q) ||
    summary.deal.poNo.toLowerCase().includes(q) ||
    summary.deal.buyerSnapshot.companyName.toLowerCase().includes(q)
  );
}

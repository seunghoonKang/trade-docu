import type { InvoiceDraft } from "@/entities/invoice";
import type { TradeDocument } from "@/entities/document";
import type { PackingLine } from "@/entities/shipment";

/** 발행 문서 보기 페이지가 렌더에 쓰는 데이터(전부 발행 시점 박제값). */
export interface DocumentPreviewData {
  form: InvoiceDraft;
  packingLines: PackingLine[]; // PL 전용 — 그 외 양식은 빈 배열
  showPrice: boolean; // PL 가격 표시(fieldOptions.showPrice, 기본 숨김)
}

/**
 * 발행 문서 snapshot → 프리뷰 데이터 복원(조회 전용 상세, #issue-split).
 * snapshot은 발행 시점 폼 박제(불변). PL은 snapshot.packingLines·fieldOptions.showPrice를 함께 복원한다.
 * snapshot이 비어 있으면 null(호출부에서 폴백 처리).
 */
export function documentPreviewData(doc: TradeDocument): DocumentPreviewData | null {
  if (!doc.snapshot || Object.keys(doc.snapshot).length === 0) return null;
  const form = doc.snapshot as unknown as InvoiceDraft;
  const packingLines =
    doc.docType === "PL" && Array.isArray((doc.snapshot as { packingLines?: unknown }).packingLines)
      ? ((doc.snapshot as { packingLines: PackingLine[] }).packingLines ?? [])
      : [];
  const showPrice = doc.docType === "PL" && doc.fieldOptions?.showPrice === true;
  return { form, packingLines, showPrice };
}

/**
 * 문서(Document) — 양식 × (거래 건 또는 선적) 데이터로 생성된 산출물.
 * PI = 거래 건 레벨(shipmentId === null), CI·PL = 선적 레벨(CONTEXT.md, ADR-0001).
 * 발행 시 snapshot에 렌더 데이터를 박제해 과거 문서를 보존한다(불변).
 */

/** 양식 3종. CoO는 범위 밖(ADR-0001). */
export type DocType = "PI" | "CI" | "PL";

export type DocStatus = "draft" | "issued";

export interface TradeDocument {
  id: string;
  userId: string;
  dealId: string;
  shipmentId: string | null; // null = 거래 건 레벨(PI)
  docType: DocType;
  docNo: string;
  docDate: string;
  status: DocStatus;
  fieldOptions: Record<string, unknown>; // 양식 표시항목 오버라이드 (예: {showPrice:false})
  snapshot: Record<string, unknown>; // 발행 시점 렌더 데이터(불변)
  createdAt: string;
}

/** 서버에 문서를 생성할 때 보내는 페이로드(id/userId/createdAt 제외). */
export type TradeDocumentInput = Omit<TradeDocument, "id" | "userId" | "createdAt">;

export function createEmptyDocument(docType: DocType): TradeDocumentInput {
  return {
    dealId: "",
    shipmentId: null,
    docType,
    docNo: "",
    docDate: "",
    status: "draft",
    fieldOptions: {},
    snapshot: {},
  };
}

import type { Invoice } from "./model";

type InvoiceDraft = Omit<Invoice, "id" | "userId" | "createdAt">;

/** 검증 대상 양식. entities/document의 DocType과 같은 리터럴(엔티티 간 사이드 임포트 회피). */
export type DocValidationKind = "PI" | "CI" | "PL";

export interface ValidationResult {
  blocking: string[];
  warnings: string[];
}

/**
 * 양식별 차단/경고 검증(#27). 키는 i18n validation.* 라벨과 1:1.
 * - 공통 차단: 문서번호·발행일·구매자명·품목.
 * - 품목 규칙: PI/CI는 명세+수량+단가, PL은 가격을 숨기므로 명세+수량만.
 * - 경고: CI 원산지 누락(차단 아님 — UX 피드백으로 완화), 은행정보 누락(가격 양식 PI/CI만).
 */
export function validateDocument(form: InvoiceDraft, docType: DocValidationKind): ValidationResult {
  const blocking: string[] = [];
  const warnings: string[] = [];

  if (!form.invoiceNo.trim()) blocking.push("invoiceNo");
  if (!form.date.trim()) blocking.push("date");
  if (!form.buyerSnapshot.companyName.trim()) blocking.push("buyerCompanyName");

  const hasValidItem = form.items.some(
    (item) => item.description.trim() && item.qty > 0 && (docType === "PL" || item.unitPrice > 0),
  );
  if (!hasValidItem) blocking.push("items");

  if (docType === "CI" && !form.originCountry?.trim()) warnings.push("originCountry");

  if (docType !== "PL") {
    const hasBankInfo = form.bankInfo.bankName.trim() || form.bankInfo.accountNo.trim();
    if (!hasBankInfo) warnings.push("bankInfo");
  }

  return { blocking, warnings };
}

/** PI 기준 검증(기존 호출부 호환: PI 폼 저장/내보내기). */
export function validateInvoice(form: InvoiceDraft): ValidationResult {
  return validateDocument(form, "PI");
}

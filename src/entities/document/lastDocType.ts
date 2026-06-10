import type { DocType } from "./model";

/** 마지막 사용 양식(#31) — 적응형 홈의 원클릭 진입용. localStorage에 기억한다. */

const STORAGE_KEY = "tradedocu.lastDocType";
const DOC_TYPES: DocType[] = ["PI", "CI", "PL"];

export function getLastDocType(): DocType | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return DOC_TYPES.includes(value as DocType) ? (value as DocType) : null;
  } catch {
    return null;
  }
}

export function setLastDocType(docType: DocType): void {
  try {
    localStorage.setItem(STORAGE_KEY, docType);
  } catch {
    // storage 불가 환경에서는 조용히 무시.
  }
}

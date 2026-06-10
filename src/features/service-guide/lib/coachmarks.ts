/**
 * 컨텍스트 코치마크(#28) — 흐름 속에서 한 번만 보여주는 힌트.
 * 첫 분할선적 / 첫 양식 탭 전환 / 표시항목(PL 가격) 토글. localStorage로 1회 노출을 기억한다.
 */

export type CoachmarkId = "split-shipment" | "doc-tabs" | "field-toggle";

const STORAGE_PREFIX = "tradedocu.coachmark.";

export function hasSeenCoachmark(id: CoachmarkId): boolean {
  try {
    return localStorage.getItem(STORAGE_PREFIX + id) === "1";
  } catch {
    return true; // storage 불가 환경이면 노출하지 않는다(반복 노출 방지 우선).
  }
}

export function markCoachmarkSeen(id: CoachmarkId): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + id, "1");
  } catch {
    // storage 불가 환경에서는 조용히 무시.
  }
}

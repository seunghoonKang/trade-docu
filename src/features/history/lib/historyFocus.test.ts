import { afterEach, describe, it, expect } from "vitest";
import {
  clearHistoryFocusInvoiceId,
  consumeHistoryFocusInvoiceId,
  historyRowId,
  setHistoryFocusInvoiceId,
} from "./historyFocus";

const STORAGE_KEY = "history:focusInvoiceId";

describe("테이블 행 앵커 ID", () => {
  it("테이블 행 앵커용 ID에 접두사를 붙인다", () => {
    expect(historyRowId("abc-123")).toBe("history-row-abc-123");
  });
});

describe("행 포커스 sessionStorage", () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it("포커스할 인보이스 ID를 저장하고 한 번만 꺼낸다", () => {
    setHistoryFocusInvoiceId("inv-42");
    expect(sessionStorage.getItem(STORAGE_KEY)).toBe("inv-42");
    expect(consumeHistoryFocusInvoiceId()).toBe("inv-42");
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("저장된 값이 없으면 null을 반환한다", () => {
    expect(consumeHistoryFocusInvoiceId()).toBeNull();
  });

  it("저장된 포커스 ID를 읽지 않고 지운다", () => {
    setHistoryFocusInvoiceId("inv-99");
    clearHistoryFocusInvoiceId();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(consumeHistoryFocusInvoiceId()).toBeNull();
  });
});

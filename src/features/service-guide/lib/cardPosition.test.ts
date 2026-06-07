import { describe, expect, it } from "vitest";
import { CARD_WIDTH, getCardStyle } from "./cardPosition";
import type { GuideStep } from "./steps";

describe("cardPosition", () => {
  it("사이드바 타깃은 고정 left 위치를 사용한다", () => {
    const step: GuideStep = {
      id: "nav-invoices",
      target: '[data-guide="nav-invoices"]',
      placement: "right",
    };
    const style = getCardStyle(step, new DOMRect(8, 120, 56, 48));
    expect(style?.left).toBe(88);
    expect(style?.top).toBe(120);
  });

  it("오른쪽 끝 타깃은 카드가 viewport 안에 들어오도록 clamp한다", () => {
    const step: GuideStep = {
      id: "export-toolbar",
      target: '[data-guide="export-toolbar"]',
      placement: "left",
    };
    const rect = new DOMRect(window.innerWidth - 200, 16, 180, 40);
    const style = getCardStyle(step, rect);
    const left = Number(style?.left ?? 0);
    expect(left).toBeGreaterThanOrEqual(16);
    expect(left + CARD_WIDTH).toBeLessThanOrEqual(window.innerWidth - 16);
  });

  it("프로필 아바타 타깃은 사이드바 고정 위치를 쓰지 않는다", () => {
    const step: GuideStep = {
      id: "nav-profile",
      target: '[data-guide="nav-profile"]',
      placement: "left",
    };
    const rect = new DOMRect(900, 16, 40, 40);
    const style = getCardStyle(step, rect);
    expect(style?.left).toBe(900 - CARD_WIDTH - 16);
    expect(style?.left).not.toBe(88);
  });
});

import { describe, expect, it } from "vitest";
import {
  GUEST_GUIDE_STEPS,
  MEMBER_GUIDE_STEPS,
  getGuideSteps,
  getNavigateLabelKey,
  isOnGuideRoute,
} from "./steps";

describe("계층형 가이드 플로우 (#28)", () => {
  it("게스트 미니 가이드는 템플릿→작성→내보내기 3스텝", () => {
    expect(GUEST_GUIDE_STEPS.map((s) => s.id)).toEqual([
      "guest-template",
      "guest-form",
      "guest-export",
    ]);
  });

  it("멤버 해피패스는 환영(한 거래=여러 문서)으로 시작해 CI/PL 발행 안내로 끝나는 5스텝", () => {
    expect(MEMBER_GUIDE_STEPS).toHaveLength(5);
    expect(MEMBER_GUIDE_STEPS[0]?.id).toBe("member-welcome");
    expect(MEMBER_GUIDE_STEPS[0]?.placement).toBe("center");
    expect(MEMBER_GUIDE_STEPS[MEMBER_GUIDE_STEPS.length - 1]?.id).toBe("member-deal-docs");
  });

  it("로그인 여부로 플로우를 고른다", () => {
    expect(getGuideSteps("guest")).toBe(GUEST_GUIDE_STEPS);
    expect(getGuideSteps("member")).toBe(MEMBER_GUIDE_STEPS);
  });

  it("center가 아닌 스텝은 data-guide 스포트라이트 타깃을 가진다", () => {
    for (const step of [...GUEST_GUIDE_STEPS, ...MEMBER_GUIDE_STEPS]) {
      if (step.placement === "center") {
        expect(step.target).toBeUndefined();
      } else {
        expect(step.target).toMatch(/^\[data-guide="/);
      }
    }
  });

  it("멤버 History 스텝은 /history 라우트로 이동한다", () => {
    const history = MEMBER_GUIDE_STEPS.find((s) => s.id === "member-history");
    expect(history?.route).toBe("/history");
  });

  it("matches invoice route exactly", () => {
    expect(isOnGuideRoute("/", "/")).toBe(true);
    expect(isOnGuideRoute("/history", "/")).toBe(false);
  });

  it("matches nested history routes", () => {
    expect(isOnGuideRoute("/history", "/history")).toBe(true);
    expect(isOnGuideRoute("/history/abc", "/history")).toBe(true);
  });

  it("returns navigate label keys for main pages", () => {
    expect(getNavigateLabelKey("/")).toBe("guide.navigateToInvoices");
    expect(getNavigateLabelKey("/history")).toBe("guide.navigateToHistory");
    expect(getNavigateLabelKey("/profile")).toBe("guide.navigateToProfile");
    expect(getNavigateLabelKey(undefined)).toBeNull();
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { hasSeenCoachmark, markCoachmarkSeen } from "./coachmarks";

describe("coachmarks (#28)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("처음엔 안 본 상태다", () => {
    expect(hasSeenCoachmark("split-shipment")).toBe(false);
    expect(hasSeenCoachmark("doc-tabs")).toBe(false);
    expect(hasSeenCoachmark("field-toggle")).toBe(false);
  });

  it("본 것으로 표시하면 그 코치마크만 숨겨진다", () => {
    markCoachmarkSeen("doc-tabs");
    expect(hasSeenCoachmark("doc-tabs")).toBe(true);
    expect(hasSeenCoachmark("split-shipment")).toBe(false);
  });
});

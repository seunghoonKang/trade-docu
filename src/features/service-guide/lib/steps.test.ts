import { describe, expect, it } from "vitest";
import {
  getGuideStep,
  getNavigateLabelKey,
  GUIDE_STEPS,
  isOnGuideRoute,
} from "./steps";

describe("service guide steps", () => {
  it("defines steps in tour order", () => {
    expect(GUIDE_STEPS[0]?.id).toBe("welcome");
    expect(GUIDE_STEPS[GUIDE_STEPS.length - 1]?.id).toBe("complete");
    expect(GUIDE_STEPS).toHaveLength(11);
  });

  it("requires spotlight targets for non-center steps", () => {
    for (const step of GUIDE_STEPS) {
      if (step.placement === "center") {
        expect(step.target).toBeUndefined();
      } else {
        expect(step.target).toMatch(/^\[data-guide="/);
      }
    }
  });

  it("maps routes for page-specific steps", () => {
    expect(getGuideStep(1)?.route).toBe("/");
    expect(getGuideStep(5)?.route).toBe("/history");
    expect(getGuideStep(7)?.route).toBe("/profile");
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

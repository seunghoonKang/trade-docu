import { beforeEach, describe, expect, it } from "vitest";
import { getLastDocType, setLastDocType } from "./lastDocType";

describe("lastDocType (#31)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("기억된 양식이 없으면 null", () => {
    expect(getLastDocType()).toBeNull();
  });

  it("set 후 get으로 복원된다", () => {
    setLastDocType("CI");
    expect(getLastDocType()).toBe("CI");
  });

  it("저장소에 이상한 값이 있으면 null", () => {
    localStorage.setItem("tradedocu.lastDocType", "WAT");
    expect(getLastDocType()).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import {
  getAvatarTargetDimensions,
  validateAvatarInput,
} from "./optimizeAvatar";

describe("validateAvatarInput", () => {
  it("accepts allowed image types within input size limit", () => {
    const file = new File(["x"], "avatar.png", { type: "image/png" });
    expect(validateAvatarInput(file)).toBe("image/png");
  });

  it("rejects unsupported types", () => {
    const file = new File(["x"], "avatar.gif", { type: "image/gif" });
    expect(validateAvatarInput(file)).toBeNull();
  });
});

describe("getAvatarTargetDimensions", () => {
  it("keeps small images unchanged", () => {
    expect(getAvatarTargetDimensions(200, 200)).toEqual({ width: 200, height: 200 });
  });

  it("scales down large images to max dimension", () => {
    expect(getAvatarTargetDimensions(4000, 2000)).toEqual({ width: 384, height: 192 });
  });
});

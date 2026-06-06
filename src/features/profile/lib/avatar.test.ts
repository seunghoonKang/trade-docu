import { describe, expect, it } from "vitest";
import type { User } from "@supabase/supabase-js";
import { getAvatarStoragePath, getAvatarUrl, hasCustomAvatar } from "./avatar";
import {
  getAvatarTargetDimensions,
  validateAvatarInput,
} from "./optimizeAvatar";

function mockUser(metadata: Record<string, unknown>): User {
  return { id: "user-1", user_metadata: metadata } as User;
}

describe("getAvatarUrl", () => {
  it("prefers custom avatar_url over oauth picture", () => {
    const user = mockUser({
      avatar_url: "https://example.com/custom.jpg",
      picture: "https://example.com/google.jpg",
    });
    expect(getAvatarUrl(user)).toBe("https://example.com/custom.jpg");
  });

  it("falls back to oauth picture", () => {
    const user = mockUser({ picture: "https://example.com/google.jpg" });
    expect(getAvatarUrl(user)).toBe("https://example.com/google.jpg");
  });

  it("ignores empty avatar_url and falls back to oauth picture", () => {
    const user = mockUser({
      avatar_url: "",
      picture: "https://example.com/google.jpg",
    });
    expect(getAvatarUrl(user)).toBe("https://example.com/google.jpg");
  });
});

describe("hasCustomAvatar", () => {
  it("returns true only when avatar_url is set", () => {
    expect(hasCustomAvatar(mockUser({ avatar_url: "https://example.com/a.jpg" }))).toBe(true);
    expect(hasCustomAvatar(mockUser({ picture: "https://example.com/g.jpg" }))).toBe(false);
  });
});

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

describe("getAvatarStoragePath", () => {
  it("uses a single optimized webp file per user", () => {
    expect(getAvatarStoragePath("user-1")).toBe("user-1/avatar.webp");
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

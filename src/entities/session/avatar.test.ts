import { describe, expect, it } from "vitest";
import type { User } from "@supabase/supabase-js";
import { getAvatarStoragePath, getAvatarUrl, hasCustomAvatar } from "./avatar";

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

describe("getAvatarStoragePath", () => {
  it("uses a single optimized webp file per user", () => {
    expect(getAvatarStoragePath("user-1")).toBe("user-1/avatar.webp");
  });
});

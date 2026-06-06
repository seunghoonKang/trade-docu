import type { User } from "@supabase/supabase-js";

export const AVATAR_BUCKET = "avatars";
export const AVATAR_STORAGE_FILE = "avatar.webp";

function readMetadataUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getAvatarUrl(user: User | null): string | null {
  if (!user) return null;
  const metadata = user.user_metadata ?? {};
  return (
    readMetadataUrl(metadata.avatar_url) ??
    readMetadataUrl(metadata.picture) ??
    readMetadataUrl(metadata.avatar) ??
    readMetadataUrl(metadata.profile_image) ??
    null
  );
}

export function hasCustomAvatar(user: User | null): boolean {
  if (!user) return false;
  const avatarUrl = user.user_metadata?.avatar_url;
  return typeof avatarUrl === "string" && avatarUrl.trim().length > 0;
}

export function getAvatarStoragePath(userId: string): string {
  return `${userId}/${AVATAR_STORAGE_FILE}`;
}

export function getAvatarStoragePaths(userId: string): string[] {
  return [
    `${userId}/${AVATAR_STORAGE_FILE}`,
    `${userId}/avatar.jpg`,
    `${userId}/avatar.png`,
  ];
}

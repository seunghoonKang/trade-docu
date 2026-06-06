import type { User } from "@supabase/supabase-js";

const OAUTH_PROVIDERS = new Set(["google", "kakao"]);

export function isOAuthUser(user: User): boolean {
  return user.identities?.some((identity) => OAUTH_PROVIDERS.has(identity.provider)) ?? false;
}

export function needsOAuthOnboarding(user: User): boolean {
  if (!isOAuthUser(user)) return false;
  return user.user_metadata?.profile_complete !== true;
}

export function getOAuthDisplayName(user: User): string {
  const metadata = user.user_metadata ?? {};
  const candidates = [metadata.name, metadata.full_name, metadata.nickname, metadata.preferred_username];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

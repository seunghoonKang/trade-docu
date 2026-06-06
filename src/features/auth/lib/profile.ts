import type { User, UserIdentity } from "@supabase/supabase-js";

const OAUTH_PROVIDERS = new Set(["google", "kakao"]);

const LINKED_PROVIDER_ORDER = ["email", "google", "kakao"] as const;
export type LinkedAuthProvider = (typeof LINKED_PROVIDER_ORDER)[number];

const LINKABLE_OAUTH_PROVIDERS = ["google", "kakao"] as const;
export type LinkableOAuthProvider = (typeof LINKABLE_OAUTH_PROVIDERS)[number];

export function isOAuthUser(user: User): boolean {
  return user.identities?.some((identity) => OAUTH_PROVIDERS.has(identity.provider)) ?? false;
}

export function needsOAuthOnboarding(user: User): boolean {
  if (!isOAuthUser(user)) return false;
  return user.user_metadata?.profile_complete !== true;
}

function collectLinkedProviders(identities: UserIdentity[]): LinkedAuthProvider[] {
  const found = new Set<LinkedAuthProvider>();
  for (const identity of identities) {
    if (identity.provider === "email") found.add("email");
    else if (identity.provider === "google") found.add("google");
    else if (identity.provider === "kakao") found.add("kakao");
  }
  return LINKED_PROVIDER_ORDER.filter((provider) => found.has(provider));
}

export function getLinkedAuthProviders(user: User): LinkedAuthProvider[] {
  return collectLinkedProviders(user.identities ?? []);
}

export function getLinkedAuthProvidersFromIdentities(identities: UserIdentity[]): LinkedAuthProvider[] {
  return collectLinkedProviders(identities);
}

export function getUnlinkedOAuthProviders(user: User): LinkableOAuthProvider[] {
  const linked = new Set(getLinkedAuthProviders(user));
  return LINKABLE_OAUTH_PROVIDERS.filter((provider) => !linked.has(provider));
}

export function getUnlinkedOAuthProvidersFromIdentities(
  identities: UserIdentity[],
): LinkableOAuthProvider[] {
  const linked = new Set(getLinkedAuthProvidersFromIdentities(identities));
  return LINKABLE_OAUTH_PROVIDERS.filter((provider) => !linked.has(provider));
}

export function canUnlinkIdentity(identities: UserIdentity[]): boolean {
  return identities.length >= 2;
}

export function isUnlinkableProvider(provider: LinkedAuthProvider): provider is LinkableOAuthProvider {
  return provider === "google" || provider === "kakao";
}

export function getAuthProviderLabelKey(provider: LinkedAuthProvider): string {
  if (provider === "email") return "auth.email";
  if (provider === "google") return "auth.loginWithGoogle";
  return "auth.loginWithKakao";
}

export function getOAuthDisplayName(user: User): string {
  const metadata = user.user_metadata ?? {};
  const candidates = [metadata.name, metadata.full_name, metadata.nickname, metadata.preferred_username];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

import type { TFunction } from "i18next";
import type { User } from "@supabase/supabase-js";
import { getAuthErrorMessage } from "./errors";
import { getAuthProviderLabelKey, getLinkedAuthProviders, type LinkableOAuthProvider } from "./profile";

const LINKABLE_PROVIDERS = new Set<string>(["google", "kakao"]);

export type OAuthLinkCallbackResult =
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export function consumeOAuthLinkCallback(user: User, t: TFunction): OAuthLinkCallbackResult | null {
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const hashError = hashParams.get("error_description") ?? hashParams.get("error");
  if (hashError) {
    return {
      type: "error",
      message: getAuthErrorMessage({ message: hashError }, t, "profile.linkFailed"),
    };
  }

  const linking = new URLSearchParams(window.location.search).get("linking");
  if (!linking || !LINKABLE_PROVIDERS.has(linking)) return null;

  const provider = linking as LinkableOAuthProvider;
  if (!getLinkedAuthProviders(user).includes(provider)) return null;

  return {
    type: "success",
    message: t("profile.linkSuccess", { provider: t(getAuthProviderLabelKey(provider)) }),
  };
}

export function clearOAuthLinkCallbackUrl() {
  window.history.replaceState(null, "", "/profile");
}

import type { TFunction } from "i18next";

type AuthErrorShape = {
  code?: string;
  message?: string;
};

const ERROR_CODE_KEYS: Record<string, string> = {
  over_email_send_rate_limit: "auth.errors.emailRateLimit",
  over_request_rate_limit: "auth.errors.requestRateLimit",
  invalid_credentials: "auth.errors.invalidCredentials",
  email_not_confirmed: "auth.errors.emailNotConfirmed",
  user_already_exists: "auth.errors.userAlreadyExists",
  weak_password: "auth.errors.weakPassword",
  same_password: "auth.errors.samePassword",
  otp_expired: "auth.errors.otpExpired",
  manual_linking_disabled: "profile.errors.manualLinkingDisabled",
  identity_already_linked: "profile.errors.alreadyLinked",
  last_identity_unlink: "profile.errors.cannotUnlinkLast",
  identity_not_found: "profile.errors.identityNotFound",
};

const LINK_ERROR_MESSAGE_KEYS: [string, string][] = [
  ["already linked to another user", "profile.errors.identityOnOtherAccount"],
  ["manual linking", "profile.errors.manualLinkingDisabled"],
];

export function getAuthErrorMessage(
  err: unknown,
  t: TFunction,
  fallbackKey = "auth.genericError",
): string {
  const shape = err as AuthErrorShape | null;
  const code =
    shape && typeof shape === "object" && "code" in shape ? String(shape.code) : undefined;
  const message =
    shape && typeof shape === "object" && "message" in shape
      ? String(shape.message ?? "")
      : err instanceof Error
        ? err.message
        : "";

  if (code && ERROR_CODE_KEYS[code]) {
    return t(ERROR_CODE_KEYS[code]);
  }

  const lower = message.toLowerCase();
  if (lower.includes("rate limit")) return t("auth.errors.emailRateLimit");
  if (lower.includes("invalid login credentials")) return t("auth.errors.invalidCredentials");
  if (lower.includes("not confirmed")) return t("auth.errors.emailNotConfirmed");
  if (lower.includes("otp expired") || lower.includes("token has expired")) {
    return t("auth.errors.otpExpired");
  }

  for (const [needle, key] of LINK_ERROR_MESSAGE_KEYS) {
    if (lower.includes(needle)) return t(key);
  }

  return t(fallbackKey);
}

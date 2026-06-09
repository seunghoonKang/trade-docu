import { useState } from "react";
import {
  CheckCircle2,
  Link2,
  Mail,
  Shield,
  Unlink,
  UserCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { LinkedAuthSkeleton, ProfileSectionCard } from "@/shared/ui";
import { useAuth } from "@/entities/session";
import { linkOAuthProvider, unlinkOAuthProvider } from "../api";
import { useLinkedIdentities } from "../lib/useLinkedIdentities";
import { getAuthErrorMessage } from "../lib/errors";
import { KakaoIcon } from "./KakaoIcon";
import {
  canUnlinkIdentity,
  getAuthProviderLabelKey,
  getLinkedAuthProvidersFromIdentities,
  getUnlinkedOAuthProvidersFromIdentities,
  isUnlinkableProvider,
  type LinkableOAuthProvider,
  type LinkedAuthProvider,
} from "../lib/profile";

const ALL_PROVIDERS: LinkedAuthProvider[] = ["email", "kakao", "google"];

const LINK_BUTTON_KEYS: Record<LinkableOAuthProvider, string> = {
  google: "profile.connectGoogle",
  kakao: "profile.connectKakao",
};

function ProviderIcon({ provider, className }: { provider: LinkedAuthProvider; className?: string }) {
  const cls = className ?? "size-5";
  if (provider === "email") return <Mail className={cls} aria-hidden />;
  if (provider === "google") {
    return (
      <svg className={cls} viewBox="0 0 24 24" aria-hidden>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    );
  }
  return (
    <span className="inline-flex size-5 items-center justify-center rounded-md bg-[#FEE500]">
      <KakaoIcon className="size-3.5 text-[#191919]" />
    </span>
  );
}

function MobileRowIcon({ provider }: { provider: LinkedAuthProvider }) {
  const iconClass = "size-5 text-primary";
  if (provider === "email") return <Mail className={iconClass} aria-hidden />;
  if (provider === "kakao") return <KakaoIcon className="size-4 text-[#191919]" aria-hidden />;
  return <UserCircle className={iconClass} aria-hidden />;
}

export function LinkedAuthMethods() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { identities, loading, reload } = useLinkedIdentities(user);
  const [linking, setLinking] = useState<LinkableOAuthProvider | null>(null);
  const [unlinking, setUnlinking] = useState<LinkableOAuthProvider | null>(null);

  if (!user) return null;

  const linked = new Set(getLinkedAuthProvidersFromIdentities(identities));
  const unlinked = getUnlinkedOAuthProvidersFromIdentities(identities);
  const allowUnlink = canUnlinkIdentity(identities);
  const busy = linking !== null || unlinking !== null;

  async function handleLink(provider: LinkableOAuthProvider) {
    setLinking(provider);
    try {
      await linkOAuthProvider(provider);
    } catch (err) {
      toast.error(getAuthErrorMessage(err, t, "profile.linkFailed"));
      setLinking(null);
    }
  }

  async function handleUnlink(provider: LinkableOAuthProvider) {
    setUnlinking(provider);
    try {
      await unlinkOAuthProvider(provider);
      await reload();
      toast.success(
        t("profile.unlinkSuccess", { provider: t(getAuthProviderLabelKey(provider)) }),
      );
    } catch (err) {
      toast.error(getAuthErrorMessage(err, t, "profile.unlinkFailed"));
    } finally {
      setUnlinking(null);
    }
  }

  if (loading) {
    return <LinkedAuthSkeleton />;
  }

  if (linked.size === 0) return null;

  const visibleProviders = ALL_PROVIDERS.filter(
    (p) => p === "email" ? linked.has("email") : true,
  );

  return (
    <div className="space-y-3">
      {/* Desktop: section title + 3-col cards */}
      <div className="hidden md:block space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-primary">{t("profile.linkedAuth")}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{t("profile.separateAccountsHint")}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visibleProviders.map((provider) => {
            const isLinked = linked.has(provider);
            const isEmail = provider === "email";
            const isOAuth = isUnlinkableProvider(provider);

            return (
              <div
                key={provider}
                className={`relative overflow-hidden p-4 bg-card border rounded-xl transition-colors ${
                  isLinked && isEmail
                    ? "border-2 border-primary"
                    : "border-border hover:border-ring/60"
                }`}
              >
                {isLinked && isEmail && (
                  <span className="absolute top-0 right-0 px-2 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase leading-none rounded-bl-lg">
                    {t("profile.primary")}
                  </span>
                )}
                <div className={`flex items-center gap-3 mb-3 ${isLinked && isEmail ? "pr-12" : ""}`}>
                  <ProviderIcon provider={provider} />
                  <span className="text-sm font-semibold text-foreground">
                    {t(getAuthProviderLabelKey(provider))}
                  </span>
                </div>
                {isLinked ? (
                  <>
                    {isEmail ? (
                      <p className="text-sm text-muted-foreground mb-3 truncate">
                        {user.email || t("profile.noLinkedEmail")}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground mb-3">{t("profile.connected")}</p>
                    )}
                    <span className="text-primary text-sm font-semibold flex items-center gap-1">
                      <CheckCircle2 className="size-4 fill-primary/20" aria-hidden />
                      {t("profile.connected")}
                    </span>
                    {isOAuth && allowUnlink && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleUnlink(provider)}
                        className="mt-3 text-destructive text-sm font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity disabled:opacity-50"
                      >
                        <Unlink className="size-4" aria-hidden />
                        {unlinking === provider ? t("profile.unlinking") : t("profile.unlink")}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-3">{t("profile.notConnected")}</p>
                    {isOAuth && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleLink(provider)}
                        className="text-foreground hover:text-primary text-sm font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        <Link2 className="size-4" aria-hidden />
                        {linking === provider
                          ? t("profile.linking")
                          : t(LINK_BUTTON_KEYS[provider])}
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
        {!allowUnlink && linked.size >= 1 && (
          <p className="text-xs text-muted-foreground">{t("profile.cannotUnlinkLast")}</p>
        )}
      </div>

      {/* Mobile: card with row list */}
      <div className="md:hidden">
        <ProfileSectionCard icon={<Shield className="size-5" />} title={t("profile.accountSecurity")}>
          <div className="space-y-4">
            {visibleProviders.map((provider) => {
              const isLinked = linked.has(provider);
              const isOAuth = isUnlinkableProvider(provider);

              return (
                <div key={provider} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "size-8 flex items-center justify-center rounded-lg shrink-0",
                        provider === "kakao" ? "bg-[#FEE500]" : "bg-accent",
                      )}
                    >
                      <MobileRowIcon provider={provider} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {t(getAuthProviderLabelKey(provider))}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {isLinked
                          ? provider === "email"
                            ? user.email || t("profile.noLinkedEmail")
                            : t("profile.connected")
                          : t("profile.notConnected")}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {isLinked ? (
                      provider === "email" ? (
                        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-md leading-none shrink-0">
                          {t("profile.primary")}
                        </span>
                      ) : (
                        <CheckCircle2 className="size-5 text-green-600 fill-green-100" aria-hidden />
                      )
                    ) : isOAuth && unlinked.includes(provider) ? (
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        disabled={busy}
                        onClick={() => handleLink(provider)}
                        className="text-primary h-auto p-0"
                      >
                        {linking === provider ? t("profile.linking") : t("profile.link")}
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </ProfileSectionCard>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button, FormSection } from "@/shared/ui";
import { useAuth } from "@/app/providers/AuthProvider";
import { linkOAuthProvider, unlinkOAuthProvider } from "../api";
import { useLinkedIdentities } from "../hooks/useLinkedIdentities";
import { getAuthErrorMessage } from "../lib/errors";
import {
  canUnlinkIdentity,
  getAuthProviderLabelKey,
  getLinkedAuthProvidersFromIdentities,
  getUnlinkedOAuthProvidersFromIdentities,
  isUnlinkableProvider,
  type LinkableOAuthProvider,
  type LinkedAuthProvider,
} from "../lib/profile";

function ProviderIcon({ provider }: { provider: LinkedAuthProvider }) {
  if (provider === "email") {
    return <Mail className="size-4 text-muted-foreground" aria-hidden />;
  }
  if (provider === "google") {
    return (
      <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    );
  }
  return (
    <svg className="size-4 text-[#3C1E1E]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3C6.477 3 2 6.48 2 10.791c0 2.758 1.817 5.177 4.545 6.536l-1.15 4.218c-.066.244.17.452.385.31l4.964-3.26c.41.056.83.087 1.256.087 5.523 0 10-3.48 10-7.791S17.523 3 12 3z" />
    </svg>
  );
}

const LINK_BUTTON_KEYS: Record<LinkableOAuthProvider, string> = {
  google: "profile.connectGoogle",
  kakao: "profile.connectKakao",
};

export function LinkedAuthMethods() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { identities, loading, reload } = useLinkedIdentities(user?.id);
  const [linking, setLinking] = useState<LinkableOAuthProvider | null>(null);
  const [unlinking, setUnlinking] = useState<LinkableOAuthProvider | null>(null);

  if (!user) return null;

  const providers = getLinkedAuthProvidersFromIdentities(identities);
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
    return (
      <FormSection title={t("profile.linkedAuth")}>
        <p className="text-sm text-muted-foreground">{t("profile.loadingAuth")}</p>
      </FormSection>
    );
  }

  if (providers.length === 0) return null;

  return (
    <FormSection title={t("profile.linkedAuth")}>
      <p className="text-sm text-muted-foreground mb-3">{t("profile.separateAccountsHint")}</p>
      <ul className="space-y-2">
        {providers.map((provider) => (
          <li
            key={provider}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ProviderIcon provider={provider} />
              <span className="text-sm font-medium text-foreground">{t(getAuthProviderLabelKey(provider))}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {provider === "email" && (
                <span className="text-sm text-muted-foreground truncate max-w-[160px]">
                  {user.email || t("profile.noLinkedEmail")}
                </span>
              )}
              {isUnlinkableProvider(provider) && allowUnlink && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => handleUnlink(provider)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  {unlinking === provider ? t("profile.unlinking") : t("profile.unlink")}
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {!allowUnlink && providers.some(isUnlinkableProvider) && (
        <p className="text-xs text-muted-foreground mt-3">{t("profile.cannotUnlinkLast")}</p>
      )}
      {unlinked.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {unlinked.map((provider) => (
            <Button
              key={provider}
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => handleLink(provider)}
            >
              {linking === provider ? t("profile.linking") : t(LINK_BUTTON_KEYS[provider])}
            </Button>
          ))}
        </div>
      )}
    </FormSection>
  );
}

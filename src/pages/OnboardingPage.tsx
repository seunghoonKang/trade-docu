import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/providers/AuthProvider";
import { completeOAuthProfile } from "@/features/auth/api";
import { getOAuthDisplayName, needsOAuthOnboarding } from "@/features/auth/lib/profile";
import { Button } from "@/shared/ui";
import { AuthTextField } from "@/features/auth/ui/AuthTextField";

export function OnboardingPage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (!needsOAuthOnboarding(user)) {
      navigate("/", { replace: true });
      return;
    }
    setName(getOAuthDisplayName(user));
  }, [user, loading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await completeOAuthProfile(name.trim());
      toast.success(t("auth.onboardingSuccess"));
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.onboardingFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">{t("auth.onboardingTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("auth.onboardingSubtitle")}</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="onboarding-name" className="text-xs font-semibold tracking-wide text-muted-foreground block ml-1">
              {t("auth.displayName")}
            </label>
            <AuthTextField
              id="onboarding-name"
              type="text"
              icon={<User />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("auth.displayNamePlaceholder")}
              required
              minLength={1}
              maxLength={50}
            />
          </div>

          <label className="flex items-start gap-2 text-sm text-foreground cursor-pointer select-none px-1">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-input text-primary focus:ring-primary"
            />
            <span>
              {t("auth.agreeToTermsPrefix")}{" "}
              <Link to="/terms" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                {t("auth.terms")}
              </Link>
              {" "}{t("auth.agreeToTermsAnd")}{" "}
              <Link to="/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                {t("auth.privacy")}
              </Link>
              {t("auth.agreeToTermsSuffix")}
            </span>
          </label>

          <Button type="submit" disabled={submitting || !agreed || !name.trim()} className="w-full h-12">
            {t("auth.onboardingSubmit")}
          </Button>
        </form>
      </div>
    </div>
  );
}

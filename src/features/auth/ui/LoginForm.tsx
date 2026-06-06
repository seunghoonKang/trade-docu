import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui";
import { login, resendSignupOtp } from "../api";
import { AuthTextField } from "./AuthTextField";
import { OtpVerifyModal } from "./OtpVerifyModal";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { ContinueAsGuestButton } from "./ContinueAsGuestButton";

const REMEMBER_EMAIL_KEY = "tradedocu.rememberedEmail";

function isEmailNotConfirmed(err: unknown): boolean {
  if (err && typeof err === "object" && "code" in err && (err as { code: unknown }).code === "email_not_confirmed") {
    return true;
  }
  if (err instanceof Error && err.message.toLowerCase().includes("not confirmed")) {
    return true;
  }
  return false;
}

interface LoginFormProps {
  variant: "mobile" | "desktop";
  onSwitchToSignup: () => void;
}

export function LoginForm({ variant, onSwitchToSignup }: LoginFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(
    () => localStorage.getItem(REMEMBER_EMAIL_KEY) ?? "",
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(
    () => localStorage.getItem(REMEMBER_EMAIL_KEY) !== null,
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      if (remember) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
      toast.success(t("auth.loginSuccess"));
      navigate("/");
    } catch (err) {
      if (isEmailNotConfirmed(err)) {
        try {
          await resendSignupOtp(email);
        } catch {
          // Resend failure is non-blocking
        }
        setShowVerifyModal(true);
      } else {
        setError(err instanceof Error ? err.message : t("auth.loginFailed"));
      }
    } finally {
      setLoading(false);
    }
  }

  const rememberLabel = variant === "mobile" ? t("auth.stayLoggedIn") : t("auth.rememberEmail");
  const emailId = `login-email-${variant}`;
  const passwordId = `login-password-${variant}`;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="space-y-1">
          <label htmlFor={emailId} className="text-xs font-semibold tracking-wide text-muted-foreground block ml-1">
            {t("auth.email")}
          </label>
          <AuthTextField
            id={emailId}
            type="email"
            icon={<Mail />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor={passwordId} className="text-xs font-semibold tracking-wide text-muted-foreground block ml-1">
            {t("auth.password")}
          </label>
          <AuthTextField
            id={passwordId}
            type={showPassword ? "text" : "password"}
            icon={<Lock />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            trailing={
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            }
          />
        </div>

        <label className="flex items-center gap-2 px-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
          />
          <span className="text-sm text-secondary-foreground">{rememberLabel}</span>
        </label>

        <Button
          type="submit"
          disabled={loading}
          className={cn("w-full", variant === "mobile" ? "h-[52px] text-base" : "h-12 text-base")}
        >
          {t("auth.loginButton")}
        </Button>
      </form>

      {variant === "mobile" ? (
        <div className="flex items-center gap-4 py-2">
          <div className="flex-grow h-px bg-input" />
          <span className="text-xs text-muted-foreground uppercase tracking-widest shrink-0">
            {t("auth.quickLogin")}
          </span>
          <div className="flex-grow h-px bg-input" />
        </div>
      ) : (
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-input" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest">
            <span className="bg-background px-4 text-muted-foreground">
              {t("auth.orContinueWith")}
            </span>
          </div>
        </div>
      )}

      <SocialLoginButtons variant={variant} />

      {variant === "desktop" && <ContinueAsGuestButton variant="desktop" />}

      <footer className={cn(variant === "mobile" ? "pt-2 text-center" : "text-left")}>
        <p className="text-sm text-secondary-foreground">
          {t("auth.signupPrompt")}{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className={cn(
              "font-semibold hover:underline ml-1",
              variant === "mobile" ? "text-primary" : "text-chart-4"
            )}
          >
            {t("auth.signupLink")}
          </button>
        </p>
      </footer>

      {showVerifyModal && (
        <OtpVerifyModal
          email={email}
          onSuccess={() => {
            toast.success(t("auth.loginSuccess"));
            navigate("/");
          }}
          onClose={() => setShowVerifyModal(false)}
        />
      )}
    </>
  );
}

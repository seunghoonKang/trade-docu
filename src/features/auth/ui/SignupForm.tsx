import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui";
import { signup } from "../api";
import { AuthTextField } from "./AuthTextField";
import { OtpVerifyModal } from "./OtpVerifyModal";

interface SignupFormProps {
  variant: "mobile" | "desktop";
  onSwitchToLogin: () => void;
}

export function SignupForm({ variant, onSwitchToLogin }: SignupFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    setLoading(true);
    try {
      await signup({ email, password, name, company: company.trim() || undefined });
      setShowVerifyModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.signupFailed"));
    } finally {
      setLoading(false);
    }
  }

  const labelClass = "text-xs font-semibold tracking-wide text-muted-foreground block ml-1";
  const fieldId = (name: string) => `signup-${name}-${variant}`;

  return (
    <>
      <header className={cn("mb-6", variant === "mobile" ? "text-center" : "text-left")}>
        <h2 className="text-xl font-semibold text-foreground mb-1">{t("auth.signupTitle")}</h2>
        {variant === "mobile" && (
          <p className="text-sm text-muted-foreground">{t("auth.welcomeSubtitleMobile")}</p>
        )}
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="space-y-1">
          <label htmlFor={fieldId("email")} className={labelClass}>{t("auth.email")}</label>
          <AuthTextField
            id={fieldId("email")}
            type="email"
            icon={<Mail />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor={fieldId("password")} className={labelClass}>{t("auth.password")}</label>
          <AuthTextField
            id={fieldId("password")}
            type={showPassword ? "text" : "password"}
            icon={<Lock />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            trailing={
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            }
          />
        </div>

        <div className="space-y-1">
          <label htmlFor={fieldId("confirm")} className={labelClass}>{t("auth.confirmPassword")}</label>
          <AuthTextField
            id={fieldId("confirm")}
            type="password"
            icon={<Lock />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor={fieldId("name")} className={labelClass}>{t("auth.name")}</label>
          <AuthTextField
            id={fieldId("name")}
            type="text"
            icon={<User />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor={fieldId("company")} className={labelClass}>{t("auth.companyOptional")}</label>
          <AuthTextField
            id={fieldId("company")}
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
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

        <Button
          type="submit"
          disabled={loading || !agreed}
          className={cn("w-full", variant === "mobile" ? "h-[52px] text-base" : "h-12 text-base")}
        >
          {t("auth.signupButton")}
        </Button>
      </form>

      <footer className={cn("text-center", variant === "mobile" ? "pt-4" : "mt-6 md:text-left")}>
        <p className="text-sm text-secondary-foreground">
          {t("auth.loginPrompt")}{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-chart-4 hover:underline ml-1"
          >
            {t("auth.loginLink")}
          </button>
        </p>
      </footer>

      {showVerifyModal && (
        <OtpVerifyModal
          email={email}
          onSuccess={() => {
            toast.success(t("auth.signupSuccess"));
            navigate("/");
          }}
          onClose={() => setShowVerifyModal(false)}
        />
      )}
    </>
  );
}

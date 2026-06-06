import { useTranslation } from "react-i18next";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { ContinueAsGuestButton } from "./ContinueAsGuestButton";
import { LoginLegalFooter } from "./LoginLegalFooter";

interface LoginMobileLayoutProps {
  mode: "login" | "signup";
  onSwitchMode: (mode: "login" | "signup") => void;
}

export function LoginMobileLayout({ mode, onSwitchMode }: LoginMobileLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen flex flex-col md:hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/login-hero.jpg"
          alt=""
          className="w-full h-full object-cover grayscale-[20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/40 to-primary/90" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-end">
        <div className="p-4 pt-12 flex flex-col items-center text-center space-y-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">TradeDocu</h1>
          <p className="text-sm text-white/80 max-w-[280px]">{t("auth.mobileBrandTagline")}</p>
        </div>

        <div className="glass-panel rounded-t-[32px] p-4 pb-12 shadow-2xl space-y-6">
          {mode === "login" ? (
            <>
              <ContinueAsGuestButton variant="mobile" />
              <div className="pt-2 text-center">
                <h2 className="text-xl font-semibold text-primary mb-1">{t("auth.welcomeTitleMobile")}</h2>
                <p className="text-sm text-muted-foreground">{t("auth.welcomeSubtitleMobile")}</p>
              </div>
              <LoginForm variant="mobile" onSwitchToSignup={() => onSwitchMode("signup")} />
            </>
          ) : (
            <SignupForm variant="mobile" onSwitchToLogin={() => onSwitchMode("login")} />
          )}
          <div className="pt-2">
            <LoginLegalFooter />
          </div>
        </div>
      </div>
    </div>
  );
}

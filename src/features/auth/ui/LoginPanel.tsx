import { useTranslation } from "react-i18next";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { LoginLegalFooter } from "./LoginLegalFooter";

interface LoginPanelProps {
  mode: "login" | "signup";
  onSwitchMode: (mode: "login" | "signup") => void;
}

export function LoginPanel({ mode, onSwitchMode }: LoginPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="relative hidden md:flex md:w-1/2 lg:w-[40%] bg-background flex-col flex-grow min-h-screen">
      <div className="absolute inset-0 pattern-bg opacity-20 pointer-events-none" />
      <main className="relative z-10 flex-grow flex items-center justify-center p-8 lg:p-10">
        <div className="w-full max-w-[400px]">
          {mode === "login" ? (
            <>
              <header className="mb-8 text-left">
                <h2 className="text-2xl font-semibold text-foreground mb-1">{t("auth.welcomeTitle")}</h2>
                <p className="text-sm text-secondary-foreground">{t("auth.welcomeSubtitle")}</p>
              </header>
              <LoginForm variant="desktop" onSwitchToSignup={() => onSwitchMode("signup")} />
            </>
          ) : (
            <SignupForm variant="desktop" onSwitchToLogin={() => onSwitchMode("login")} />
          )}
        </div>
      </main>
      <div className="relative z-10 px-8 lg:px-10 pb-6">
        <LoginLegalFooter />
      </div>
    </div>
  );
}

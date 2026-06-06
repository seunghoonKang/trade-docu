import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { loginWithGoogle, loginWithKakao } from "../api";

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3C6.477 3 2 6.48 2 10.791c0 2.758 1.817 5.177 4.545 6.536l-1.15 4.218c-.066.244.17.452.385.31l4.964-3.26c.41.056.83.087 1.256.087 5.523 0 10-3.48 10-7.791S17.523 3 12 3z" />
    </svg>
  );
}

interface SocialLoginButtonsProps {
  variant: "mobile" | "desktop";
}

export function SocialLoginButtons({ variant }: SocialLoginButtonsProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<"google" | "kakao" | null>(null);

  async function handleOAuth(provider: "google" | "kakao") {
    setLoading(provider);
    try {
      if (provider === "google") await loginWithGoogle();
      else await loginWithKakao();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.loginFailed"));
      setLoading(null);
    }
  }

  if (variant === "mobile") {
    return (
      <div className="space-y-3">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => handleOAuth("google")}
          className="w-full h-[52px] bg-card border border-input rounded-lg flex items-center justify-center gap-3 active:bg-muted transition-colors shadow-sm disabled:opacity-50"
        >
          <GoogleIcon />
          <span className="text-xs font-semibold tracking-wide">{t("auth.loginWithGoogleFull")}</span>
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => handleOAuth("kakao")}
          className="w-full h-[52px] bg-[#FEE500] rounded-lg flex items-center justify-center gap-3 active:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
        >
          <span className="text-black/85">
            <KakaoIcon />
          </span>
          <span className="text-xs font-semibold text-black/85">{t("auth.loginWithKakaoFull")}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 mb-10">
      <button
        type="button"
        disabled={loading !== null}
        onClick={() => handleOAuth("google")}
        className="flex items-center justify-center gap-2 h-11 border border-input rounded-lg text-sm hover:bg-muted transition-colors bg-card disabled:opacity-50"
      >
        <GoogleIcon />
        {t("auth.loginWithGoogle")}
      </button>
      <button
        type="button"
        disabled={loading !== null}
        onClick={() => handleOAuth("kakao")}
        className="flex items-center justify-center gap-2 h-11 bg-[#FEE500] text-black/85 rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        <KakaoIcon />
        {t("auth.loginWithKakao")}
      </button>
    </div>
  );
}

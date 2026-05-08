import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/shared/ui";
import { Button } from "@/shared/ui";
import { login, resendSignupOtp } from "../api";
import { OtpVerifyModal } from "./OtpVerifyModal";

function isEmailNotConfirmed(err: unknown): boolean {
  if (err && typeof err === "object" && "code" in err && (err as { code: unknown }).code === "email_not_confirmed") {
    return true;
  }
  if (err instanceof Error && err.message.toLowerCase().includes("not confirmed")) {
    return true;
  }
  return false;
}

export function LoginForm({ onSwitchToSignup }: { onSwitchToSignup: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      toast.success(t("auth.loginSuccess"));
      navigate("/");
    } catch (err) {
      if (isEmailNotConfirmed(err)) {
        try {
          await resendSignupOtp(email);
        } catch {
          // Resend failure is non-blocking — user can retry from the modal
        }
        setShowVerifyModal(true);
      } else {
        setError(err instanceof Error ? err.message : t("auth.loginFailed"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">{t("auth.loginTitle")}</h2>
        {error && <p className="text-base text-red-500">{error}</p>}
        <Input label={t("auth.email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label={t("auth.password")} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" disabled={loading} className="w-full">{t("auth.loginButton")}</Button>
        <button type="button" onClick={onSwitchToSignup} className="text-base text-gray-500 hover:text-gray-700">{t("auth.switchToSignup")}</button>
      </form>

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

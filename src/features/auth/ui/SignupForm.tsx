import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/shared/ui";
import { Button } from "@/shared/ui";
import { signup } from "../api";
import { OtpVerifyModal } from "./OtpVerifyModal";

export function SignupForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">{t("auth.signupTitle")}</h2>
        {error && <p className="text-base text-red-500">{error}</p>}
        <Input label={t("auth.email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label={t("auth.password")} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <Input label={t("auth.confirmPassword")} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
        <Input label={t("auth.name")} type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label={t("auth.companyOptional")} type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
        <label className="flex items-start gap-2 text-base text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <span>{t("auth.agreeToTerms")}</span>
        </label>
        <Button type="submit" disabled={loading || !agreed} className="w-full">{t("auth.signupButton")}</Button>
        <button type="button" onClick={onSwitchToLogin} className="text-base text-gray-500 hover:text-gray-700">{t("auth.switchToLogin")}</button>
      </form>

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

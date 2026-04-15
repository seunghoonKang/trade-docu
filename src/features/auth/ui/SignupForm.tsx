import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { signup } from "../api";

export function SignupForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
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
      await signup(email, password);
      setShowVerifyModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.signupFailed"));
    } finally {
      setLoading(false);
    }
  }

  function handleGoToMain() {
    navigate("/");
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">{t("auth.signupTitle")}</h2>
        {error && <p className="text-base text-red-500">{error}</p>}
        <Input label={t("auth.email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label={t("auth.password")} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <Button type="submit" disabled={loading} className="w-full">{t("auth.signupButton")}</Button>
        <button type="button" onClick={onSwitchToLogin} className="text-base text-gray-500 hover:text-gray-700">{t("auth.switchToLogin")}</button>
      </form>

      {showVerifyModal && (
        <div className="fixed inset-0 z-20 bg-black/30 flex items-center justify-center" onClick={handleGoToMain}>
          <div className="bg-white rounded-lg border border-gray-200 w-full max-w-md p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t("auth.verifyEmailTitle")}</h2>
            <p className="text-base text-gray-700 mb-2">{t("auth.verifyEmailMessage", { email })}</p>
            <p className="text-sm text-gray-500 mb-6">{t("auth.verifyEmailSpam")}</p>
            <Button onClick={handleGoToMain} className="w-full">{t("auth.goToMain")}</Button>
          </div>
        </div>
      )}
    </>
  );
}

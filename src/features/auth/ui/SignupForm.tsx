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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{t("auth.signupTitle")}</h2>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Input label={t("auth.email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input label={t("auth.password")} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
      <Button type="submit" disabled={loading} className="w-full">{t("auth.signupButton")}</Button>
      <button type="button" onClick={onSwitchToLogin} className="text-sm text-gray-500 hover:text-gray-700">{t("auth.switchToLogin")}</button>
    </form>
  );
}

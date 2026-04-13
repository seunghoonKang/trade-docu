import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { login } from "../api";

export function LoginForm({ onSwitchToSignup }: { onSwitchToSignup: () => void }) {
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
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{t("auth.loginTitle")}</h2>
      {error && <p className="text-base text-red-500">{error}</p>}
      <Input label={t("auth.email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input label={t("auth.password")} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <Button type="submit" disabled={loading} className="w-full">{t("auth.loginButton")}</Button>
      <button type="button" onClick={onSwitchToSignup} className="text-base text-gray-500 hover:text-gray-700">{t("auth.switchToSignup")}</button>
    </form>
  );
}

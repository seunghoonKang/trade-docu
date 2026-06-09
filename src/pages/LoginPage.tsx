import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/entities/session";
import { needsOAuthOnboarding } from "@/features/auth/lib/profile";
import { LoginMobileLayout } from "@/features/auth/ui/LoginMobileLayout";
import { LoginHero } from "@/features/auth/ui/LoginHero";
import { LoginPanel } from "@/features/auth/ui/LoginPanel";

export function LoginPage() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");

  if (loading) {
    return <div className="min-h-screen bg-background" aria-busy="true" />;
  }
  if (user) {
    return <Navigate to={needsOAuthOnboarding(user) ? "/onboarding" : "/"} replace />;
  }

  return (
    <>
      <LoginMobileLayout mode={mode} onSwitchMode={setMode} />
      <div className="hidden md:flex min-h-screen">
        <LoginHero />
        <LoginPanel mode={mode} onSwitchMode={setMode} />
      </div>
    </>
  );
}

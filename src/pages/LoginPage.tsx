import { useState } from "react";
import { LoginMobileLayout } from "@/features/auth/ui/LoginMobileLayout";
import { LoginHero } from "@/features/auth/ui/LoginHero";
import { LoginPanel } from "@/features/auth/ui/LoginPanel";

export function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

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

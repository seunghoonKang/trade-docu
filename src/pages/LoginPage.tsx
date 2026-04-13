import { useState } from "react";
import { LoginForm } from "../features/auth/ui/LoginForm";
import { SignupForm } from "../features/auth/ui/SignupForm";

export function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-sm bg-white rounded-lg border border-gray-200 p-8">
        {mode === "login" ? (
          <LoginForm onSwitchToSignup={() => setMode("signup")} />
        ) : (
          <SignupForm onSwitchToLogin={() => setMode("login")} />
        )}
      </div>
    </div>
  );
}

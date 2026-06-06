import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { needsOAuthOnboarding } from "@/features/auth/lib/profile";

export function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading || !user) return;
    if (needsOAuthOnboarding(user) && location.pathname !== "/onboarding") {
      navigate("/onboarding", { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  return <Outlet />;
}

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { needsOAuthOnboarding } from "@/features/auth/lib/profile";

export function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (!loading && user && needsOAuthOnboarding(user) && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}

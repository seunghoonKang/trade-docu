import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/entities/session";
import { needsOAuthOnboarding } from "@/features/auth/lib/profile";
import { AppSidebar } from "@/widgets/AppSidebar";

export function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const showSidebar = Boolean(user) && location.pathname !== "/onboarding";

  if (!loading && user && needsOAuthOnboarding(user) && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <>
      {showSidebar && <AppSidebar />}
      <Outlet />
    </>
  );
}

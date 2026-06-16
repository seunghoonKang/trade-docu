import { Navigate } from "react-router-dom";
import { useAuth } from "@/entities/session";
import { CbmCalculator } from "@/features/cbm-calculator";
import { ExportToolbar } from "@/widgets/ExportToolbar";
import { Layout } from "@/shared/ui";

/** CBM·컨테이너 적재 계산기 도구 페이지. 순수 클라이언트, 로그인 전용. */
export function CbmCalculatorPage() {
  const { user, loading } = useAuth();
  if (!loading && !user) return <Navigate to="/login" replace />;

  return (
    <Layout showSidebar={Boolean(user)} toolbar={<ExportToolbar page="tools" />}>
      <CbmCalculator />
    </Layout>
  );
}

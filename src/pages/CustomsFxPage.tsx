import { Navigate } from "react-router-dom";
import { useAuth } from "@/entities/session";
import { CustomsFxTool } from "@/features/customs-fx";
import { ExportToolbar } from "@/widgets/ExportToolbar";
import { Layout } from "@/shared/ui";

/** 관세청 고시환율 조회 + 환산 도구 페이지. 로그인 전용. */
export function CustomsFxPage() {
  const { user, loading } = useAuth();
  if (!loading && !user) return <Navigate to="/login" replace />;

  return (
    <Layout showSidebar={Boolean(user)} toolbar={<ExportToolbar page="tools" />}>
      <CustomsFxTool />
    </Layout>
  );
}

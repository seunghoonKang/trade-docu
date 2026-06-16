import { Navigate } from "react-router-dom";
import { useAuth } from "@/entities/session";
import { PdfToExcelTool } from "@/features/pdf-to-excel";
import { ExportToolbar } from "@/widgets/ExportToolbar";
import { Layout } from "@/shared/ui";

/**
 * PDF → Excel 범용 변환기 도구 페이지. 메인 도메인(Deal/Shipment)과 분리된 독립 유틸리티 —
 * 전부 클라이언트·일회성이라 서버/DB를 건드리지 않는다. 로그인 전용(다른 페이지와 동일).
 */
export function PdfToExcelPage() {
  const { user, loading } = useAuth();
  if (!loading && !user) return <Navigate to="/login" replace />;

  return (
    <Layout showSidebar={Boolean(user)} toolbar={<ExportToolbar page="tools" />}>
      <PdfToExcelTool />
    </Layout>
  );
}

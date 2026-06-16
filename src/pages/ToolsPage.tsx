import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/entities/session";
import { toolItems } from "@/shared/config";
import { ExportToolbar } from "@/widgets/ExportToolbar";
import { Layout } from "@/shared/ui";

/** 도구 섹션 랜딩 — 개별 유틸리티 도구 카드 목록(단일 소스 `toolItems`). 로그인 전용. */
export function ToolsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  if (!loading && !user) return <Navigate to="/login" replace />;

  return (
    <Layout showSidebar={Boolean(user)} toolbar={<ExportToolbar page="tools" />}>
      <div className="max-w-6xl mx-auto px-4 py-8 md:p-10 space-y-6 pb-12">
        <div>
          <h1 className="text-xl font-semibold text-foreground md:text-2xl">{t("tools.pageTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("tools.pageSubtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {toolItems.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => navigate(tool.href)}
                className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card/80 p-5 text-left transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/40 hover:shadow-md"
              >
                <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="text-base font-semibold text-foreground">{t(tool.titleKey)}</span>
                <span className="text-sm text-muted-foreground">{t(tool.descKey)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

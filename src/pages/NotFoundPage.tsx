import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Compass, Home } from "lucide-react";
import { Button } from "@/shared/ui";

/** 알 수 없는 경로(클라이언트 라우팅 catch-all + SPA fallback 직접 접근)용 404 페이지. */
export function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="size-8" aria-hidden />
      </span>
      <p className="font-mono text-5xl font-semibold tracking-tight text-primary">404</p>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-foreground">{t("notFound.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("notFound.description")}</p>
      </div>
      <Button className="gap-1.5" onClick={() => navigate("/")}>
        <Home className="size-4 shrink-0" aria-hidden />
        {t("notFound.home")}
      </Button>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/entities/session";
import { getLastDocType } from "@/entities/document";
import type { DocType } from "@/entities/document";
import { listDealSummaries } from "@/features/deal-crud";
import type { DealSummary } from "@/features/deal-crud";
import { TemplateGallery } from "@/widgets/TemplateGallery";
import { ExportToolbar } from "@/widgets/ExportToolbar";
import { Button, KineticTitle, Layout, Skeleton } from "@/shared/ui";

const CONTINUE_LIMIT = 3;
const DOC_BADGES: DocType[] = ["PI", "CI", "PL"];

/**
 * 적응형 홈(#31).
 * - 게스트: 템플릿 갤러리(단건 선택 → /new?doc=…) + 로그인 유도. 거래/선적/이력 비노출.
 * - 로그인: 진행 중 거래 건 '이어서' 우선 + 마지막 사용 양식 원클릭, 없거나 첫 로그인이면 갤러리 폴백.
 */
export function HomePage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState<DealSummary[]>([]);
  const [fetching, setFetching] = useState(true);
  const lastDocType = useMemo(() => getLastDocType(), []);

  useEffect(() => {
    if (!user) {
      setSummaries([]);
      setFetching(false);
      return;
    }
    setFetching(true);
    listDealSummaries(user.id)
      .then(setSummaries)
      .finally(() => setFetching(false));
  }, [user]);

  function startDoc(docType: DocType) {
    navigate(docType === "PI" ? "/new" : `/new?doc=${docType}`);
  }

  const openDeals = summaries.filter((s) => s.deal.status === "open").slice(0, CONTINUE_LIMIT);
  const isLoading = loading || (Boolean(user) && fetching);

  return (
    <Layout showSidebar={Boolean(user)} toolbar={<ExportToolbar page="home" />}>
      <div className="max-w-6xl mx-auto px-4 py-8 md:p-10 space-y-10 pb-12">
        {isLoading ? (
          <HomeSkeleton />
        ) : (
          <>
            {/* 이어서 — 진행 중 거래 건 우선(로그인 + 진행 중 거래가 있을 때만) */}
            {user && openDeals.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <KineticTitle
                  text={t("home.continueTitle")}
                  className="font-serif text-xl md:text-2xl font-semibold text-primary"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-muted-foreground"
                  onClick={() => navigate("/history")}
                >
                  {t("home.viewAllDeals")}
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              </div>
              <div className="reveal-group grid grid-cols-1 gap-4 sm:grid-cols-3">
                {openDeals.map((summary) => (
                  <button
                    key={summary.deal.id}
                    type="button"
                    onClick={() => navigate(`/deals/${summary.deal.id}`)}
                    className="flex flex-col gap-2 rounded-xl border border-border bg-card/80 p-5 text-left transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/40 hover:shadow-md"
                  >
                    <span className="font-mono text-sm font-semibold tracking-tight text-primary">
                      {summary.piNo || t("history.noNumber")}
                    </span>
                    <span className="text-sm text-foreground truncate">
                      {summary.deal.buyerSnapshot.companyName || t("history.noBuyer")}
                    </span>
                    <span className="flex gap-1.5">
                      {DOC_BADGES.map((docType) => (
                        <span
                          key={docType}
                          className={
                            summary.issuedCount[docType] > 0
                              ? "inline-flex items-center rounded-sm border border-accent-foreground/30 bg-accent px-1.5 py-0.5 font-mono text-[11px] font-semibold text-accent-foreground"
                              : "inline-flex items-center rounded-sm border border-border px-1.5 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground/50"
                          }
                        >
                          {docType}
                        </span>
                      ))}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t("history.shipments")} {summary.shipmentCount} ·{" "}
                      {new Date(summary.deal.createdAt).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            </section>
            )}

            {/* 갤러리 — 게스트 랜딩 + 로그인 홈에서도 양식 단건 작성 진입 */}
            <TemplateGallery onSelect={startDoc} lastDocType={lastDocType} />

            {!user && (
              <section className="reveal flex flex-col items-start gap-3 rounded-xl border border-primary/20 bg-accent/50 p-6 sm:flex-row sm:items-center sm:justify-between" style={{ animationDelay: "300ms" }}>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground">
                    {t("home.guestCtaTitle")}
                  </h3>
                  <p className="text-sm text-muted-foreground">{t("home.guestCtaBody")}</p>
                </div>
                <Button className="gap-1.5 shrink-0" onClick={() => navigate("/login")}>
                  <LogIn className="size-4" aria-hidden />
                  {t("home.guestCtaButton")}
                </Button>
              </section>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

/** 템플릿 갤러리 미러 스켈레톤 — 헤더(mb-6) + 썸네일 존/텍스트 블록을 실제 카드 구조 그대로. */
function HomeSkeleton() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-56 md:h-8" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
            <Skeleton className="h-[13.5rem] w-full rounded-none" />
            <div className="space-y-2 border-t border-border p-5">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-5 w-8" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

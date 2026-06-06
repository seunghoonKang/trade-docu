import { ArrowLeft, Building2, Landmark, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/shared/ui";
import { AppSidebar } from "@/widgets/AppSidebar";
import { cn } from "@/shared/lib/utils";

function FormFieldsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function LinkedAuthSkeleton() {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="hidden md:block space-y-4">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="p-4 bg-card border border-border rounded-xl space-y-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-5 rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>

      <div className="md:hidden bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-border bg-secondary/50">
          <Shield className="size-5 text-primary shrink-0" aria-hidden />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-primary flex-1">
            {t("profile.accountSecurity")}
          </h3>
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Skeleton className="size-8 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-4 w-12 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProfilePageSkeleton() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background" aria-busy="true">
      <header className="md:hidden fixed top-0 inset-x-0 z-10 h-16 flex items-center justify-between px-4 bg-card border-b border-border shadow-sm">
        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label={t("profile.back")}
          className="flex items-center justify-center size-10 rounded-full text-primary hover:bg-accent transition-colors"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </button>
        <h1 className="text-xl font-bold text-primary">{t("profile.settingsTitle")}</h1>
        <Skeleton className="size-10 rounded-full" />
      </header>

      <header className="hidden md:flex sticky top-0 z-10 h-16 items-center justify-between px-8 bg-card border-b border-border shrink-0">
        <h1 className="text-2xl font-semibold text-primary tracking-tight truncate">
          {t("profile.title")}
        </h1>
        <div className="flex items-center gap-4 shrink-0">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <div className="flex items-center gap-3 border-l border-border pl-4">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </div>
      </header>

      <AppSidebar />

      <div className="md:pl-[72px]">
        <main
          className={cn(
            "max-w-4xl mx-auto px-4 py-6 md:p-8 space-y-6 md:space-y-8 mt-16 md:mt-0 pb-28 md:pb-8",
          )}
        >
        <Skeleton className="h-4 w-72 hidden md:block" />

        <section className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col items-center gap-4 md:flex-row md:items-center md:text-left md:gap-6">
          <Skeleton className="size-24 rounded-full md:rounded-xl shrink-0" />
          <div className="space-y-3 w-full md:flex-1">
            <Skeleton className="h-7 w-40 mx-auto md:mx-0" />
            <Skeleton className="h-4 w-56 mx-auto md:mx-0" />
            <Skeleton className="h-9 w-28 mx-auto md:mx-0 rounded-lg" />
          </div>
        </section>

        <LinkedAuthSkeleton />

        <div className="hidden md:grid lg:grid-cols-2 gap-8">
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
              <Building2 className="size-5" aria-hidden />
              {t("profile.businessProfile")}
            </h3>
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <FormFieldsSkeleton />
            </div>
          </section>
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
              <Landmark className="size-5" aria-hidden />
              {t("profile.financialInfo")}
            </h3>
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <FormFieldsSkeleton rows={7} />
            </div>
          </section>
        </div>

        <div className="md:hidden space-y-6">
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-border bg-secondary/50">
              <Building2 className="size-5 text-primary shrink-0" aria-hidden />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                {t("profile.businessProfile")}
              </h3>
            </div>
            <div className="p-4">
              <FormFieldsSkeleton />
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-border bg-secondary/50">
              <Landmark className="size-5 text-primary shrink-0" aria-hidden />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                {t("profile.financialInfo")}
              </h3>
            </div>
            <div className="p-4">
              <FormFieldsSkeleton rows={7} />
            </div>
          </div>

          <Skeleton className="h-12 w-full rounded-lg" />
        </div>

        <div className="hidden md:flex justify-end gap-3 pt-8 mt-2 border-t border-border">
          <Skeleton className="h-11 w-32 rounded-lg" />
        </div>
        </main>
      </div>
    </div>
  );
}

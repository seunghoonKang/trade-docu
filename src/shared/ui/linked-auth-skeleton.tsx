import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "./primitives/skeleton";

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

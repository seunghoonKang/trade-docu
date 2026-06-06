import { useTranslation } from "react-i18next";
import { Skeleton } from "@/shared/ui";

const SKELETON_ROW_COUNT = 6;

function SummaryCardSkeleton() {
  return (
    <div className="bg-card/80 backdrop-blur border border-border rounded-xl p-6 flex items-center gap-6">
      <Skeleton className="size-14 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-4">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-4 py-4">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="px-4 py-4">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-4 py-4">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-4 py-4">
        <Skeleton className="h-4 w-32" />
      </td>
      <td className="px-4 py-4">
        <div className="flex gap-1">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
        </div>
      </td>
    </tr>
  );
}

export function HistoryPageSkeleton() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 md:space-y-8" aria-busy="true" aria-label={t("history.loading")}>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
      </section>

      <section className="bg-card/80 backdrop-blur border border-border rounded-xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-muted/30 border-b border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-lg font-semibold text-primary shrink-0">{t("history.documentRepository")}</h4>
          <Skeleton className="h-10 w-full sm:w-80 md:w-96 shrink-0 rounded-lg" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                {Array.from({ length: 6 }, (_, index) => (
                  <th key={index} className="px-4 py-3">
                    <Skeleton className="h-3 w-16" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-card">
              {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
                <TableRowSkeleton key={index} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

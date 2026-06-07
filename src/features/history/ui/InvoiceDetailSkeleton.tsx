import { Skeleton } from "@/shared/ui";

export function InvoiceDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 min-h-[500px] rounded-xl border border-border bg-accent p-8 flex justify-center">
          <Skeleton className="w-full max-w-[794px] h-[800px]" />
        </div>
        <div className="lg:col-span-4">
          <div className="bg-card/80 border border-border rounded-xl p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex justify-between gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

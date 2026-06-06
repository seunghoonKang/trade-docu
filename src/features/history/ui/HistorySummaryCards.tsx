import { FolderOpen, Info, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/primitives/tooltip";

interface Props {
  totalCount: number;
  recentCount: number;
}

export function HistorySummaryCards({ totalCount, recentCount }: Props) {
  const { t } = useTranslation();

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-card/80 backdrop-blur border border-border rounded-xl p-6 flex items-center gap-6">
        <div className="size-14 rounded-full bg-primary/5 flex items-center justify-center text-primary border border-primary/10 shrink-0">
          <FolderOpen className="size-8" aria-hidden />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            {t("history.totalDocuments")}
          </p>
          <h3 className="text-2xl font-semibold text-primary tracking-tight">{totalCount}</h3>
        </div>
      </div>

      <div className="bg-card/80 backdrop-blur border border-border rounded-xl p-6 flex items-center gap-6">
        <div className="size-14 rounded-full bg-accent flex items-center justify-center text-secondary-foreground border border-border shrink-0">
          <RefreshCw className="size-8" aria-hidden />
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("history.recentlySaved")}
            </p>
            <TooltipProvider delay={200}>
              <Tooltip>
                <TooltipTrigger
                  type="button"
                  className="text-muted-foreground/70 hover:text-muted-foreground transition-colors rounded-full"
                  aria-label={t("history.recentlySavedHint")}
                >
                  <Info className="size-3.5" aria-hidden />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[220px] text-left">
                  {t("history.recentlySavedHint")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <h3 className="text-2xl font-semibold text-primary tracking-tight">{recentCount}</h3>
        </div>
      </div>
    </section>
  );
}

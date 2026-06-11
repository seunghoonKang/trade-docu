import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/utils";

const STAGES = [
  { key: "pi", badge: "PI" },
  { key: "ci", badge: "CI" },
  { key: "pl", badge: "PL" },
] as const;

/**
 * PI→CI→PL 타임라인(#54) — 세 양식이 같은 거래의 다른 렌즈임을 가르친다.
 * 거래 진행 순서(견적 → 선적·청구 → 포장명세)대로 세로 타임라인으로 보여준다.
 */
export function DocTimeline() {
  const { t } = useTranslation();

  return (
    <ol className="mt-4 space-y-0">
      {STAGES.map(({ key, badge }, index) => (
        <li key={key} className="relative flex gap-3 pb-4 last:pb-0">
          {/* 단계 연결선 — 마지막 단계는 생략 */}
          {index < STAGES.length - 1 && (
            <span
              aria-hidden
              className="absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px bg-border"
            />
          )}
          <span
            className={cn(
              "z-10 flex size-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold",
              key === "pi"
                ? "border-border bg-muted text-muted-foreground"
                : "border-primary/30 bg-primary text-primary-foreground",
            )}
          >
            {badge}
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="flex flex-wrap items-center gap-x-2 text-sm font-semibold text-foreground">
              {t(`guide.docTimeline.${key}.label`)}
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                {t(`guide.docTimeline.${key}.scope`)}
              </span>
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {t(`guide.docTimeline.${key}.desc`)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

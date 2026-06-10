import { useState } from "react";
import { Lightbulb, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { hasSeenCoachmark, markCoachmarkSeen } from "../lib/coachmarks";
import type { CoachmarkId } from "../lib/coachmarks";

/**
 * 컨텍스트 코치마크(#28): 해당 화면 요소 곁에 인라인으로 한 번만 보이는 힌트 배너.
 * 닫으면(또는 한 번 보였으면) localStorage에 기록되어 다시 나타나지 않는다.
 */
export function Coachmark({ id }: { id: CoachmarkId }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(() => !hasSeenCoachmark(id));
  if (!visible) return null;

  function dismiss() {
    markCoachmarkSeen(id);
    setVisible(false);
  }

  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-primary/25 bg-accent/60 px-3.5 py-2.5 text-sm text-foreground">
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      <p className="flex-1">{t(`guide.coachmarks.${id}`)}</p>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("guide.close")}
        className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}

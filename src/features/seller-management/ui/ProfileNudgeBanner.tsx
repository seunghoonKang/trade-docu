import { Info, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui";

interface Props {
  onComplete: () => void;
  onDismiss: () => void;
}

export function ProfileNudgeBanner({ onComplete, onDismiss }: Props) {
  const { t } = useTranslation();

  return (
    <div
      role="status"
      className="flex items-start sm:items-center gap-3 border-b border-border bg-secondary px-4 py-3 sm:px-6"
    >
      <Info className="size-4 shrink-0 text-secondary-foreground mt-0.5 sm:mt-0" aria-hidden />
      <p className="flex-1 min-w-0 text-sm text-secondary-foreground">{t("profile.nudgeMessage")}</p>
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="default" size="sm" onClick={onComplete}>
          {t("profile.completeCta")}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDismiss}
          aria-label={t("history.close")}
        >
          <X aria-hidden />
        </Button>
      </div>
    </div>
  );
}

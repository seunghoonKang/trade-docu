import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui";

interface Props {
  onComplete: () => void;
}

export function ProfileNudgeBanner({ onComplete }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-amber-50 border-b border-amber-200 px-4 py-3">
      <span className="text-sm text-amber-900">{t("profile.nudgeMessage")}</span>
      <div className="shrink-0">
        <Button variant="secondary" size="sm" onClick={onComplete}>
          {t("profile.completeCta")}
        </Button>
      </div>
    </div>
  );
}

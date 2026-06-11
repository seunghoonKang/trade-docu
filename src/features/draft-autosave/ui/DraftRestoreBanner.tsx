import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui";

interface Props {
  onRestore: () => void;
  onDiscard: () => void;
}

export function DraftRestoreBanner({ onRestore, onDiscard }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-accent/60 border-b border-accent-foreground/20 px-4 py-3">
      <span className="text-sm text-accent-foreground">{t("draft.title")}</span>
      <div className="flex gap-2 shrink-0">
        <Button variant="secondary" size="sm" onClick={onRestore}>
          {t("draft.restore")}
        </Button>
        <Button variant="ghost" size="sm" onClick={onDiscard}>
          {t("draft.discard")}
        </Button>
      </div>
    </div>
  );
}

import { Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui";

interface ProfileSaveBarProps {
  saving: boolean;
  onSave: () => void;
}

export function ProfileSaveBar({ saving, onSave }: ProfileSaveBarProps) {
  const { t } = useTranslation();

  return (
    <div className="sticky bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="max-w-4xl mx-auto px-4 py-3 md:px-8 md:py-4 flex justify-stretch md:justify-end">
        <Button
          variant="default"
          size="lg"
          onClick={onSave}
          disabled={saving}
          className="w-full md:w-auto shadow-lg font-semibold gap-2 px-6 h-12"
        >
          <Save aria-hidden />
          {saving ? t("profile.saving") : t("profile.saveChanges")}
        </Button>
      </div>
    </div>
  );
}

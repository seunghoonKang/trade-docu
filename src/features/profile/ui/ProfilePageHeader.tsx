import { ArrowLeft, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { GlobeLanguageSwitcher } from "@/features/i18n-switch";
import { AvatarThumbnail, Button } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

interface ProfilePageHeaderProps {
  user: SupabaseUser;
  saving: boolean;
  onBack: () => void;
  onSave: () => void;
}

export function ProfilePageHeader({
  user,
  saving,
  onBack,
  onSave,
}: ProfilePageHeaderProps) {
  const { t } = useTranslation();

  const saveButton = (compact?: boolean) => (
    <Button
      variant="default"
      size={compact ? "icon" : "lg"}
      onClick={onSave}
      disabled={saving}
      aria-label={t("profile.saveChanges")}
      className={cn(
        !compact && "shadow-lg font-semibold gap-2 px-6",
        compact && "size-10 rounded-full",
      )}
    >
      <Save aria-hidden />
      {!compact && (saving ? t("profile.saving") : t("profile.saveChanges"))}
    </Button>
  );

  return (
    <>
      {/* Mobile */}
      <header className="md:hidden fixed top-0 inset-x-0 z-10 h-16 flex items-center justify-between px-4 bg-card border-b border-border shadow-sm">
        <button
          type="button"
          onClick={onBack}
          aria-label={t("profile.back")}
          className="flex items-center justify-center size-10 rounded-full text-primary hover:bg-accent transition-colors active:opacity-80"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </button>
        <h1 className="text-xl font-bold text-primary">{t("profile.settingsTitle")}</h1>
        <div className="flex items-center gap-1 shrink-0">
          <GlobeLanguageSwitcher placement="below" showLabel={false} />
          {saveButton(true)}
        </div>
      </header>

      {/* Desktop */}
      <header className="hidden md:flex sticky top-0 z-10 h-16 items-center justify-between px-8 bg-card border-b border-border shrink-0">
        <h1 className="text-2xl font-semibold text-primary tracking-tight truncate">
          {t("profile.title")}
        </h1>
        <div className="flex items-center gap-4 shrink-0">
          <GlobeLanguageSwitcher placement="below" />
          <div className="flex items-center gap-3 border-l border-border pl-4">
            <AvatarThumbnail user={user} />
            {saveButton()}
          </div>
        </div>
      </header>
    </>
  );
}

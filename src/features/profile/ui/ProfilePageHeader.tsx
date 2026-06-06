import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { GlobeLanguageSwitcher } from "@/features/i18n-switch";
import { AppHeaderBrand, AvatarThumbnail } from "@/shared/ui";

interface ProfilePageHeaderProps {
  user: SupabaseUser;
  onBack: () => void;
}

export function ProfilePageHeader({ user, onBack }: ProfilePageHeaderProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* Mobile */}
      <header className="md:hidden fixed top-0 inset-x-0 z-50 h-16 flex items-center gap-2 px-4 bg-card border-b border-border shadow-sm">
        <button
          type="button"
          onClick={onBack}
          aria-label={t("profile.back")}
          className="flex items-center justify-center size-10 shrink-0 rounded-full text-primary hover:bg-accent transition-colors active:opacity-80"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <AppHeaderBrand pageTitle={t("profile.title")} />
        </div>
        <div className="shrink-0">
          <GlobeLanguageSwitcher placement="below" showLabel={false} />
        </div>
      </header>

      {/* Desktop */}
      <header className="hidden md:flex sticky top-0 z-50 h-16 items-center justify-between px-6 bg-card border-b border-border shadow-sm shrink-0">
        <AppHeaderBrand pageTitle={t("profile.title")} />
        <div className="flex items-center gap-4 shrink-0">
          <GlobeLanguageSwitcher placement="below" showLabel={false} />
          <div className="flex items-center border-l border-border pl-4">
            <AvatarThumbnail user={user} />
          </div>
        </div>
      </header>
    </>
  );
}

import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/utils";
import { Select } from "./select";
import { APP_LANGUAGES, resolveAppLanguage } from "@/shared/i18n";

export function LanguageSwitcher({
  className,
  selectClassName,
}: {
  className?: string;
  selectClassName?: string;
}) {
  const { i18n } = useTranslation();
  const value = resolveAppLanguage(i18n.language);
  return (
    <div className={cn("w-full md:w-32", className)}>
      <Select
        aria-label="Language"
        options={APP_LANGUAGES.map(({ value, label }) => ({ value, label }))}
        value={value}
        className={selectClassName}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
      />
    </div>
  );
}

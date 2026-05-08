import { useTranslation } from "react-i18next";
import { Select } from "@/shared/ui";

const LANGUAGES = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
  { value: "ja", label: "日本語" },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language.split("-")[0];
  const value = LANGUAGES.some((l) => l.value === current) ? current : "ko";
  return (
    <div className="w-full md:w-32">
      <Select
        aria-label="Language"
        options={LANGUAGES}
        value={value}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
      />
    </div>
  );
}

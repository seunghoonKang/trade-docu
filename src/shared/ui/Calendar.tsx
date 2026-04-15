import { DayPicker, type DayPickerProps } from "react-day-picker";
import { ko, enUS, zhCN, ja } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import "react-day-picker/style.css";

const localeMap: Record<string, Locale> = {
  ko,
  en: enUS,
  zh: zhCN,
  ja,
};

export function Calendar(props: DayPickerProps) {
  const { i18n } = useTranslation();
  const locale = localeMap[i18n.language] ?? enUS;

  return (
    <DayPicker
      locale={locale}
      style={
        {
          "--rdp-accent-color": "#111827",
          "--rdp-accent-background-color": "#111827",
          "--rdp-range_middle-background-color": "#f3f4f6",
          "--rdp-today-color": "#111827",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

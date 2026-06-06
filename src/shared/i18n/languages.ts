export const APP_LANGUAGES = [
  { value: "ko", label: "한국어", loginLabel: "한국어 (KR)" },
  { value: "en", label: "English", loginLabel: "English (EN)" },
  { value: "ja", label: "日本語", loginLabel: "日本語 (JP)" },
  { value: "zh", label: "中文", loginLabel: "简体中文 (CN)" },
] as const;

export type AppLanguage = (typeof APP_LANGUAGES)[number]["value"];

export function resolveAppLanguage(code: string): AppLanguage {
  const base = code.split("-")[0];
  return APP_LANGUAGES.some((l) => l.value === base) ? (base as AppLanguage) : "ko";
}

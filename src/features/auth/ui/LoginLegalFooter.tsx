import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LoginLanguageSwitcher } from "./LoginLanguageSwitcher";

export function LoginLegalFooter() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-xs text-muted-foreground">
      <Link to="/terms" className="hover:text-primary transition-colors">
        {t("auth.terms")}
      </Link>
      <span className="size-1 rounded-full bg-border" />
      <Link to="/privacy" className="hover:text-primary transition-colors">
        {t("auth.privacy")}
      </Link>
      <span className="size-1 rounded-full bg-border" />
      <LoginLanguageSwitcher />
    </div>
  );
}

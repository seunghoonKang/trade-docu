import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "../../shared/ui/Button";
import { LanguageSwitcher } from "../../features/i18n-switch/ui/LanguageSwitcher";
import { useAuth } from "../../app/providers/AuthProvider";
import { logout } from "../../features/auth/api";
import type { Invoice } from "../../entities/invoice/model";
import { generatePdf } from "../../features/export-pdf/generatePdf";
import { generateExcel } from "../../features/export-excel/generateExcel";
import { saveInvoice } from "../../features/invoice-crud/api";

type FormData = Omit<Invoice, "id" | "userId" | "createdAt">;

interface Props {
  formData: FormData;
  onShowHistory?: () => void;
}

export function ExportToolbar({ formData, onShowHistory }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">{t("app.title")}</h1>
      <div className="flex items-center gap-2 overflow-x-auto">
        <Button variant="secondary" size="sm" onClick={() => generatePdf(formData, t)}>
          {t("export.pdf")}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => generateExcel(formData, t)}>
          {t("export.excel")}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => window.print()}>
          {t("export.print")}
        </Button>
        {user && (
          <>
            <div className="w-px h-6 bg-gray-200" />
            <Button variant="secondary" size="sm" onClick={async () => {
              await saveInvoice(user.id, formData);
              alert(t("history.saved"));
            }}>
              {t("history.save")}
            </Button>
            <Button variant="ghost" size="sm" onClick={onShowHistory}>
              {t("history.history")}
            </Button>
          </>
        )}
        <div className="w-px h-6 bg-gray-200 hidden sm:block" />
        <div className="hidden sm:flex">
          <LanguageSwitcher />
        </div>
        <div className="w-px h-6 bg-gray-200" />
        {user ? (
          <Button variant="ghost" size="sm" onClick={() => logout()}>
            {t("nav.logout")}
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
            {t("nav.login")}
          </Button>
        )}
      </div>
    </div>
  );
}

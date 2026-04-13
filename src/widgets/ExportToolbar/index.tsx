import { useState } from "react";
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
import { triggerPrint } from "../../features/print/triggerPrint";

type FormData = Omit<Invoice, "id" | "userId" | "createdAt">;

interface Props {
  formData: FormData;
  onShowHistory?: () => void;
}

export function ExportToolbar({ formData, onShowHistory }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = (
    <>
      <Button variant="secondary" size="sm" onClick={() => { generatePdf(formData); setMenuOpen(false); }}>
        {t("export.pdf")}
      </Button>
      <Button variant="secondary" size="sm" onClick={() => { generateExcel(formData, t); setMenuOpen(false); }}>
        {t("export.excel")}
      </Button>
      <Button variant="secondary" size="sm" onClick={() => { triggerPrint(); setMenuOpen(false); }}>
        {t("export.print")}
      </Button>
      {user && (
        <>
          <Button variant="secondary" size="sm" onClick={async () => {
            await saveInvoice(user.id, formData);
            alert(t("history.saved"));
            setMenuOpen(false);
          }}>
            {t("history.save")}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { onShowHistory?.(); setMenuOpen(false); }}>
            {t("history.history")}
          </Button>
        </>
      )}
      <div className="w-full h-px bg-gray-200 my-1 md:hidden" />
      <div className="md:hidden">
        <LanguageSwitcher />
      </div>
      <div className="w-full h-px bg-gray-200 my-1 md:hidden" />
      <div className="md:hidden">
        {user ? (
          <Button variant="ghost" size="sm" onClick={() => { logout(); setMenuOpen(false); }}>
            {t("nav.logout")}
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => { navigate("/login"); setMenuOpen(false); }}>
            {t("nav.login")}
          </Button>
        )}
      </div>
    </>
  );

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">{t("app.title")}</h1>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => generatePdf(formData)}>
          {t("export.pdf")}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => generateExcel(formData, t)}>
          {t("export.excel")}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => triggerPrint()}>
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
        <div className="w-px h-6 bg-gray-200" />
        <LanguageSwitcher />
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

      {/* Mobile hamburger */}
      <div className="md:hidden relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded hover:bg-gray-100 transition-colors"
          aria-label="Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {menuOpen ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </>
            ) : (
              <>
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </>
            )}
          </svg>
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-2 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex flex-col gap-2 min-w-[180px]">
              {menuItems}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

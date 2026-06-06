import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/shared/ui";
import { LanguageSwitcher } from "@/features/i18n-switch";
import { useAuth } from "@/app/providers/AuthProvider";
import { logout } from "@/features/auth";
import type { Invoice } from "@/entities/invoice/model";
import { validateInvoice } from "@/entities/invoice/validate";
import { generatePdf } from "@/features/export-pdf";
import { generateExcel } from "@/features/export-excel";
import { saveInvoice } from "@/features/invoice-crud";
import { triggerPrint } from "@/features/print";
import { clearDraft } from "@/features/draft-autosave";

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

  async function handleLogout() {
    await logout();
    toast.success(t("auth.logoutSuccess"));
  }

  // Block export/save when core fields are missing; warn-but-allow for the rest.
  function passesValidation(): boolean {
    const { blocking, warnings } = validateInvoice(formData);
    if (blocking.length > 0) {
      toast.error(
        `${t("validation.blockedTitle")}: ${blocking.map((k) => t(`validation.${k}`)).join(", ")}`,
      );
      return false;
    }
    if (warnings.length > 0) {
      toast.warning(warnings.map((k) => t(`validation.${k}`)).join(", "));
    }
    return true;
  }

  function handlePdf() {
    if (passesValidation()) generatePdf(formData);
  }
  function handleExcel() {
    if (passesValidation()) generateExcel(formData, t);
  }
  function handlePrint() {
    if (passesValidation()) triggerPrint();
  }
  async function handleSave() {
    if (!user || !passesValidation()) return;
    await saveInvoice(user.id, formData);
    clearDraft();
    toast.success(t("history.saved"));
  }

  const menuItems = (
    <>
      <Button variant="secondary" size="sm" onClick={() => { handlePdf(); setMenuOpen(false); }}>
        {t("export.pdf")}
      </Button>
      <Button variant="secondary" size="sm" onClick={() => { handleExcel(); setMenuOpen(false); }}>
        {t("export.excel")}
      </Button>
      <Button variant="secondary" size="sm" onClick={() => { handlePrint(); setMenuOpen(false); }}>
        {t("export.print")}
      </Button>
      {user && (
        <>
          <Button variant="secondary" size="sm" onClick={() => { handleSave(); setMenuOpen(false); }}>
            {t("history.save")}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { onShowHistory?.(); setMenuOpen(false); }}>
            {t("history.history")}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { navigate("/profile"); setMenuOpen(false); }}>
            {t("profile.nav")}
          </Button>
        </>
      )}
      <div className="w-full h-px bg-border my-1 md:hidden" />
      <div className="md:hidden">
        <LanguageSwitcher />
      </div>
      <div className="w-full h-px bg-border my-1 md:hidden" />
      <div className="md:hidden">
        {user ? (
          <Button variant="ghost" size="sm" onClick={() => { handleLogout(); setMenuOpen(false); }}>
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
      <h1 className="text-lg font-bold text-foreground whitespace-nowrap">{t("app.title")}</h1>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={handlePdf}>
          {t("export.pdf")}
        </Button>
        <Button variant="secondary" size="sm" onClick={handleExcel}>
          {t("export.excel")}
        </Button>
        <Button variant="secondary" size="sm" onClick={handlePrint}>
          {t("export.print")}
        </Button>
        {user && (
          <>
            <div className="w-px h-6 bg-border" />
            <Button variant="secondary" size="sm" onClick={handleSave}>
              {t("history.save")}
            </Button>
            <Button variant="ghost" size="sm" onClick={onShowHistory}>
              {t("history.history")}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
              {t("profile.nav")}
            </Button>
          </>
        )}
        <div className="w-px h-6 bg-border" />
        <LanguageSwitcher />
        <div className="w-px h-6 bg-border" />
        {user ? (
          <Button variant="ghost" size="sm" onClick={handleLogout}>
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
          className="p-2 rounded hover:bg-muted transition-colors"
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
            <div className="absolute right-0 top-full mt-2 z-20 bg-card border border-border rounded-lg shadow-lg p-3 flex flex-col gap-2 min-w-[180px]">
              {menuItems}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

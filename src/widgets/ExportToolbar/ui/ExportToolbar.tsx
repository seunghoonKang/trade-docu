import { useEffect, useRef, useState } from "react";
import { ChevronDown, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { getPageTitleKey, mainNavItems } from "@/shared/config";
import { toast } from "sonner";
import { AppHeaderBrand, Button } from "@/shared/ui";
import { GlobeLanguageSwitcher } from "@/shared/ui";
import { useAuth, AvatarThumbnail } from "@/entities/session";
import { logout } from "@/features/auth";
import { createEmptyInvoice } from "@/entities/invoice";
import type { Invoice } from "@/entities/invoice";
import { validateInvoice } from "@/entities/invoice";
import { generatePdf } from "@/features/export-pdf";
import { generateExcel } from "@/features/export-excel";
import { saveInvoice } from "@/features/invoice-crud";
import { triggerPrint } from "@/features/print";
import { clearDraft } from "@/entities/invoice";
import { cn } from "@/shared/lib/utils";

type FormData = Omit<Invoice, "id" | "userId" | "createdAt">;

interface Props {
  formData?: FormData;
  page?: "documents" | "history" | "historyDetail";
}

export function ExportToolbar({ formData, page = "documents" }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const isHistoryPage = page === "history" || page === "historyDetail";
  const pageTitle = t(getPageTitleKey(page));
  const data = formData ?? createEmptyInvoice();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    await logout();
    toast.success(t("auth.logoutSuccess"));
  }

  function passesValidation(): boolean {
    const { blocking, warnings } = validateInvoice(data);
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

  async function handlePdf() {
    if (!passesValidation()) return;
    try {
      await generatePdf(data);
    } catch {
      toast.error(t("export.pdfFailed"));
    }
  }

  function handleExcel() {
    if (passesValidation()) generateExcel(data);
  }

  function handlePrint() {
    if (passesValidation()) triggerPrint();
  }

  async function handleSave() {
    if (!user || !passesValidation()) return;
    await saveInvoice(user.id, data);
    clearDraft();
    toast.success(t("history.saved"));
  }

  const iconButtonClass =
    "flex items-center justify-center size-10 rounded-full text-muted-foreground hover:text-primary hover:bg-accent transition-colors active:opacity-80";

  const exportMenuItemClass =
    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted transition-colors";

  const menuItems = (
    <>
      {user && (
        <>
          {mainNavItems.map((item) => (
            <Button
              key={item.id}
              variant={pathname === item.href ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start md:hidden"
              onClick={() => {
                navigate(item.href);
                setMenuOpen(false);
              }}
            >
              {t(item.labelKey)}
            </Button>
          ))}
          <div className="w-full h-px bg-border my-1 md:hidden" />
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 md:hidden"
            onClick={() => {
              navigate("/profile");
              setMenuOpen(false);
            }}
          >
            <AvatarThumbnail user={user} className="size-6" />
            {t("profile.title")}
          </Button>
          <div className="w-full h-px bg-border my-1 md:hidden" />
        </>
      )}
      {!isHistoryPage && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-1.5"
            onClick={() => {
              handlePdf();
              setMenuOpen(false);
            }}
          >
            <FileText className="size-4 shrink-0" aria-hidden />
            {t("export.pdf")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-1.5"
            onClick={() => {
              handleExcel();
              setMenuOpen(false);
            }}
          >
            <FileSpreadsheet className="size-4 shrink-0" aria-hidden />
            {t("export.excel")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-1.5"
            onClick={() => {
              handlePrint();
              setMenuOpen(false);
            }}
          >
            <Printer className="size-4 shrink-0" aria-hidden />
            {t("export.print")}
          </Button>
        </>
      )}
      {user && (
        <>
          {!isHistoryPage && <div className="w-full h-px bg-border my-1" />}
          {!isHistoryPage && (
            <Button
              variant="default"
              size="sm"
              className="w-full justify-start md:hidden"
              onClick={() => {
                handleSave();
                setMenuOpen(false);
              }}
            >
              {t("history.save")}
            </Button>
          )}
        </>
      )}
      <div className="w-full h-px bg-border my-1" />
      <GlobeLanguageSwitcher />
      <div className="w-full h-px bg-border my-1" />
      {user ? (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => {
            handleLogout();
            setMenuOpen(false);
          }}
        >
          {t("nav.logout")}
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => {
            navigate("/login");
            setMenuOpen(false);
          }}
        >
          {t("nav.login")}
        </Button>
      )}
    </>
  );

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <AppHeaderBrand pageTitle={pageTitle} />

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-2 shrink-0" data-guide="export-toolbar">
        <div className={cn("flex items-center gap-1 mr-2", !isHistoryPage && "border-r border-border pr-4")}>
          <GlobeLanguageSwitcher placement="below" showLabel={false} />
          {!isHistoryPage && (
            <button
              type="button"
              className={iconButtonClass}
              title={t("export.print")}
              aria-label={t("export.print")}
              onClick={handlePrint}
            >
              <Printer className="size-5" />
            </button>
          )}
        </div>

        {!isHistoryPage && (
          <>
            <div ref={exportRef} className="relative">
              <Button
                variant="outline"
                size="sm"
                className="gap-1 font-semibold text-xs tracking-wide"
                onClick={() => setExportOpen((v) => !v)}
                aria-expanded={exportOpen}
              >
                {t("export.export")}
                <ChevronDown className={cn("size-3.5 transition-transform", exportOpen && "rotate-180")} />
              </Button>
              {exportOpen && (
                <div className="absolute right-0 top-full z-30 mt-2 min-w-[160px] rounded-lg border border-border bg-card py-1 shadow-md">
                  <button
                    type="button"
                    className={exportMenuItemClass}
                    onClick={() => {
                      handlePdf();
                      setExportOpen(false);
                    }}
                  >
                    <FileText className="size-4 shrink-0" aria-hidden />
                    {t("export.pdf")}
                  </button>
                  <button
                    type="button"
                    className={exportMenuItemClass}
                    onClick={() => {
                      handleExcel();
                      setExportOpen(false);
                    }}
                  >
                    <FileSpreadsheet className="size-4 shrink-0" aria-hidden />
                    {t("export.excel")}
                  </button>
                </div>
              )}
            </div>

            {user && (
              <Button variant="default" size="sm" className="font-semibold text-xs tracking-wide shadow-sm" onClick={handleSave}>
                {t("history.save")}
              </Button>
            )}
          </>
        )}

        <div className="ml-2">
          {user ? (
            <AvatarThumbnail user={user} onClick={() => navigate("/profile")} />
          ) : (
            <Button
              variant="default"
              size="sm"
              className="font-semibold text-xs tracking-wide shadow-sm"
              onClick={() => navigate("/login")}
            >
              {t("nav.login")}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile hamburger */}
      <div className="md:hidden relative shrink-0">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-full hover:bg-muted transition-colors"
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
            <div className="absolute right-0 top-full mt-2 z-20 bg-card border border-border rounded-lg shadow-lg p-3 flex flex-col gap-2 min-w-[200px]">
              {menuItems}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

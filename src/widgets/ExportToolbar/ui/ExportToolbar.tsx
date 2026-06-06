import { useEffect, useRef, useState } from "react";
import { ChevronDown, Printer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AvatarThumbnail, Button } from "@/shared/ui";
import { GlobeLanguageSwitcher } from "@/features/i18n-switch";
import { useAuth } from "@/app/providers/AuthProvider";
import { logout } from "@/features/auth";
import { createEmptyInvoice } from "@/entities/invoice/model";
import type { Invoice } from "@/entities/invoice/model";
import { validateInvoice } from "@/entities/invoice/validate";
import { generatePdf } from "@/features/export-pdf";
import { generateExcel } from "@/features/export-excel";
import { saveInvoice } from "@/features/invoice-crud";
import { triggerPrint } from "@/features/print";
import { clearDraft } from "@/features/draft-autosave";
import { cn } from "@/shared/lib/utils";

type FormData = Omit<Invoice, "id" | "userId" | "createdAt">;

interface Props {
  formData?: FormData;
  page?: "documents" | "history";
}

const navLinkClass =
  "text-xs font-semibold tracking-wide transition-colors duration-200";
const navLinkInactive = `${navLinkClass} text-secondary-foreground/55 font-medium hover:text-primary`;
const navLinkActive = `${navLinkClass} text-primary font-bold border-b-2 border-primary pb-1`;

export function ExportToolbar({ formData, page = "documents" }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const isHistoryPage = page === "history";
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

  const menuItems = (
    <>
      {!isHistoryPage && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              handlePdf();
              setMenuOpen(false);
            }}
          >
            {t("export.pdf")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              handleExcel();
              setMenuOpen(false);
            }}
          >
            {t("export.excel")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              handlePrint();
              setMenuOpen(false);
            }}
          >
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
              className="w-full justify-start"
              onClick={() => {
                handleSave();
                setMenuOpen(false);
              }}
            >
              {t("history.save")}
            </Button>
          )}
          {!isHistoryPage && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                navigate("/history");
                setMenuOpen(false);
              }}
            >
              {t("nav.history")}
            </Button>
          )}
          {isHistoryPage && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                navigate("/");
                setMenuOpen(false);
              }}
            >
              {t("nav.documents")}
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
      <div className="flex min-w-0 items-center gap-6 lg:gap-8">
        <span className="text-[30px] font-bold text-primary tracking-tighter whitespace-nowrap leading-none">
          TradeDocu
        </span>
        <nav className="hidden md:flex items-center gap-6">
          {isHistoryPage ? (
            <button type="button" className={navLinkInactive} onClick={() => navigate("/")}>
              {t("nav.documents")}
            </button>
          ) : (
            <span className={navLinkActive}>{t("nav.documents")}</span>
          )}
          {user &&
            (isHistoryPage ? (
              <span className={navLinkActive}>{t("nav.history")}</span>
            ) : (
              <button type="button" className={navLinkInactive} onClick={() => navigate("/history")}>
                {t("nav.history")}
              </button>
            ))}
        </nav>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-2 shrink-0">
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
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                    onClick={() => {
                      handlePdf();
                      setExportOpen(false);
                    }}
                  >
                    {t("export.pdf")}
                  </button>
                  <button
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                    onClick={() => {
                      handleExcel();
                      setExportOpen(false);
                    }}
                  >
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
